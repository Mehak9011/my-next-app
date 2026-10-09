import { NextResponse } from "next/server";
import {
  submitEnquiry,
  markEnquiryEmailed,
  type EnquiryItem,
  type EnquiryPayload,
} from "@/app/lib/wordpress";
import { sendEnquiryAlert } from "@/app/lib/enquiry-mail";

/**
 * ============================================================
 * POST /api/enquiry
 * "Request This Package" on /pricing → WordPress + owner email.
 *
 * The browser never talks to WordPress directly: it posts here, and
 * this server-only handler validates the payload and forwards it to
 * the `cmx/v1/enquiry` REST route with the shared secret. That keeps
 * the CMS URL and the enquiry key completely hidden from the client.
 *
 * Email is two-tier, so a lead is never left unannounced:
 *   1. WordPress saves the lead and tries wp_mail() itself.
 *   2. If that send failed, this handler re-sends the alert from
 *      Vercel — Resend when RESEND_API_KEY is set, otherwise the
 *      zero-config FormSubmit fallback — then tells WordPress via
 *      `POST /cmx/v1/enquiry/{id}/emailed` so the wp-admin "Emailed"
 *      column shows the real outcome instead of a stale "no".
 * Storage always happens first, so neither path can lose a lead.
 * ============================================================
 */

/** Same-origin in production, but allow localhost during development. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients (health checks, curl)

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * In-memory throttle: max 5 enquiries per IP per 10 minutes.
 *
 * Serverless instances are ephemeral, so this is a best-effort guard
 * that stops casual form spam. The real protection is the honeypot
 * plus validation below — WordPress also rate-limits by request size.
 */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);

  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim to a maximum length; never returns null/undefined. */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Normalise one package line; drops anything without a usable label. */
function cleanItem(raw: unknown): EnquiryItem | null {
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as Record<string, unknown>;
  const service = clean(record.service, 160);
  if (!service) return null;

  const price = Number(record.price);
  return {
    service,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
  };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Invalid request origin." },
      { status: 403 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many enquiries sent. Please try again in a few minutes.",
      },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot: a real visitor never sees or fills this hidden field,
  // so anything in it is a bot. Fail quietly with a 200 so the bot
  // does not learn that it was detected.
  if (clean(body.company_website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 190);
  const phone = clean(body.phone, 40);
  const company = clean(body.company, 160);
  const message = clean(body.message, 4000);
  const source = clean(body.source, 40) || "pricing";
  const page = clean(body.page, 300);

  const errors: string[] = [];
  if (name.length < 2) errors.push("name");
  if (!EMAIL_RE.test(email)) errors.push("email");
  if (errors.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Please provide your name and a valid email address." },
      { status: 400 }
    );
  }

  const packageItems = Array.isArray(body.package)
    ? body.package
        .map(cleanItem)
        .filter((item): item is EnquiryItem => item !== null)
        .slice(0, 40)
    : [];

  const payload: EnquiryPayload = {
    name,
    email,
    phone: phone || undefined,
    company: company || undefined,
    message: message || undefined,
    source,
    page: page || undefined,
    package: packageItems,
  };

  try {
    const result = await submitEnquiry(payload);

    // WordPress stored the lead. If its own mail did not go out,
    // send the alert from here instead (Resend, then FormSubmit).
    let emailed = result.emailed ?? false;
    // Coarse mail outcome for the response/logs: `wp` is WordPress's own
    // wp_mail() result, `via`/`sent`/`reason` describe the fallback.
    // No secrets — just which tier delivered (or why it did not).
    const mail: Record<string, unknown> = { wp: result.emailed ?? false };
    if (!emailed) {
      const fallback = await sendEnquiryAlert({
        name,
        email,
        phone: phone || undefined,
        company: company || undefined,
        message: message || undefined,
        source,
        page: page || undefined,
        // Same format WordPress writes into `_cmx_submitted`.
        submitted: `${new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")} UTC`,
        packageItems,
      });
      if (fallback) {
        emailed = fallback.sent;
        mail.via = fallback.provider;
        mail.sent = fallback.sent;
        if (fallback.reason) mail.reason = fallback.reason;
        if (fallback.status) mail.status = fallback.status;
        // Report a successful fallback back to WordPress so the
        // wp-admin "Emailed" column shows ✓ instead of a stale "no".
        if (fallback.sent && typeof result.id === "number") {
          await markEnquiryEmailed(result.id, fallback.provider);
        }
      } else {
        // sendEnquiryAlert returns null only when no recipient resolved.
        mail.reason = "no_recipient";
      }
    }

    return NextResponse.json(
      { ok: true, id: result.id, emailed, mail },
      { status: 200 }
    );
  } catch (error) {
    // Log the real cause server-side; never leak WordPress details.
    console.error("[enquiry] submission failed:", error);

    // Coarse machine-readable cause — never the CMS URL or the secret.
    // The browser response and the Vercel logs both carry it, so a live
    // failure names the step that broke (env, auth, reachability) without
    // exposing anything sensitive to the visitor.
    const detail = error instanceof Error ? error.message : "";
    let code = "unknown";
    if (detail.includes("WORDPRESS_ENQUIRY_KEY")) code = "env_key";
    else if (detail.includes("WORDPRESS_REST_URL")) code = "env_rest_url";
    else if (detail.includes("WordPress enquiry error: 403")) code = "wp_403";
    else if (detail.includes("WordPress enquiry error: 404")) code = "wp_404";
    else if (/WordPress enquiry error: 5\d\d/.test(detail)) code = "wp_5xx";
    else if (detail.includes("WordPress enquiry error:")) code = "wp_error";
    else if (/fetch failed|ENOTFOUND|ECONN|socket|abort|timed? ?out/i.test(detail))
      code = "wp_unreachable";

    // A missing server-side secret/URL is a configuration problem, not a
    // CMS outage — say so plainly so it can be fixed in Vercel.
    const message =
      code === "env_key" || code === "env_rest_url"
        ? "Enquiry service is not configured yet."
        : "We couldn't send your enquiry right now. Please email us directly.";

    return NextResponse.json(
      { ok: false, error: message, code },
      { status: 502 }
    );
  }
}
