import { NextResponse } from "next/server";
import {
  submitEnquiry,
  type EnquiryItem,
  type EnquiryPayload,
} from "@/app/lib/wordpress";

/**
 * ============================================================
 * POST /api/enquiry
 * "Request This Package" on /pricing → WordPress + owner email.
 *
 * The browser never talks to WordPress directly: it posts here, and
 * this server-only handler validates the payload and forwards it to
 * the `cmx/v1/enquiry` REST route with the shared secret. That keeps
 * the CMS URL and the enquiry key completely hidden from the client.
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
    message: message || undefined,
    source,
    page: page || undefined,
    package: packageItems,
  };

  try {
    const result = await submitEnquiry(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Log the real cause server-side; never leak WordPress details.
    console.error("[enquiry] submission failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't send your enquiry right now. Please email us directly.",
      },
      { status: 502 }
    );
  }
}
