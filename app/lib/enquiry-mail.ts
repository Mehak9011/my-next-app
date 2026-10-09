/**
 * ============================================================
 * Enquiry notification — reliable delivery for owner alerts.
 *
 * WordPress stores the lead first (see wordpress/cmx-enquiries.php)
 * and tries wp_mail() itself. Shared hosts refuse or silently drop that
 * mail, so this module is the fallback used when the WordPress send did
 * not go out. Two providers, tried in order:
 *
 *   1. Resend     - used whenever RESEND_API_KEY is set.
 *   2. FormSubmit - needs no account, API key or DNS record, so the
 *                   alert works on a fresh deploy before anyone has
 *                   signed up for a transactional-mail provider.
 *
 * Deliberately dependency-free — it calls the Resend HTTP API with
 * the platform `fetch`, so no npm package is added to this project.
 * ============================================================
 */
import { site } from "@/app/lib/site";

/** Loose shape check — the recipient only has to look like an address. */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export interface EnquiryAlert {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  source: string;
  /** The page the visitor submitted from (same as `_cmx_page` in WP). */
  page?: string;
  /**
   * Submission time, formatted exactly like WordPress stores it
   * (`Y-m-d H:i:s` + " UTC"). Generated at send time when omitted, so
   * the email always shows the same field WordPress saved.
   */
  submitted?: string;
  /** Lines the visitor selected, already priced. */
  packageItems: { service: string; price: number }[];
}

/**
 * Format the submission timestamp the way WordPress does in
 * `cmx_enquiry_post()` — `gmdate('Y-m-d H:i:s') . ' UTC'` — so the
 * fallback email shows the exact same value that gets saved in the
 * `_cmx_submitted` post meta.
 */
function submittedStamp(alert: EnquiryAlert): string {
  if (alert.submitted) return alert.submitted;
  return `${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

/** Escape a value for the HTML body. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build the same HTML alert WordPress renders. */
function buildHtml(alert: EnquiryAlert): string {
  const total = alert.packageItems.reduce((sum, i) => sum + i.price, 0);

  const rows = alert.packageItems
    .map(
      (item) =>
        `<tr>
           <td style="padding:8px 0;border-bottom:1px solid #e9e7e2;">${esc(
             item.service
           )}</td>
           <td style="padding:8px 0;border-bottom:1px solid #e9e7e2;text-align:right;font-weight:700;">$${item.price}</td>
         </tr>`
    )
    .join("");

  const packageBlock = rows
    ? `<h2 style="margin:24px 0 8px;font-size:15px;color:#14181d;">Requested package</h2>
       <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}
         <tr><td style="padding:10px 0;font-weight:700;">Estimated total</td>
             <td style="padding:10px 0;text-align:right;font-weight:700;color:#e63329;">$${total}</td></tr>
       </table>`
    : "";

  const messageBlock = alert.message
    ? `<h2 style="margin:24px 0 8px;font-size:15px;color:#14181d;">Message</h2>
       <div style="font-size:14px;line-height:1.6;color:#5b6570;">${esc(
         alert.message
       ).replace(/\n/g, "<br>")}</div>`
    : "";

  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;">
    <h1 style="margin:0 0 4px;font-size:20px;color:#14181d;">New package enquiry</h1>
    <p style="margin:0 0 20px;color:#9aa3ac;font-size:13px;">Sent from the CodeXmattriX pricing calculator.</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Name</td>
          <td style="padding:6px 0;font-size:14px;">${esc(alert.name)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Email</td>
          <td style="padding:6px 0;font-size:14px;"><a href="mailto:${esc(
            alert.email
          )}">${esc(alert.email)}</a></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Phone</td>
          <td style="padding:6px 0;font-size:14px;">${esc(alert.phone ?? "—")}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Company</td>
          <td style="padding:6px 0;font-size:14px;">${esc(alert.company || "—")}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Source</td>
          <td style="padding:6px 0;font-size:14px;">${esc(alert.source)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Page</td>
          <td style="padding:6px 0;font-size:14px;">${esc(alert.page || "—")}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Submitted</td>
          <td style="padding:6px 0;font-size:14px;">${esc(submittedStamp(alert))}</td></tr>
    </table>
    ${packageBlock}${messageBlock}
  </div>`;
}

/** Which provider ended up handling (or failing) the alert. */
export type EnquiryMailProvider = "resend" | "formsubmit";

/** Coarse reason a provider did not deliver (never leaks credentials). */
export type EnquiryMailReason =
  | "disabled" // ENQUIRY_MAIL_PROVIDER=none
  | "held_activation" // FormSubmit one-time activation still pending
  | "provider_error"; // HTTP or network failure at the provider

export interface EnquiryAlertResult {
  /** True when a provider accepted the mail for delivery. */
  sent: boolean;
  /** The provider tried last (the successful one when `sent` is true). */
  provider: EnquiryMailProvider;
  /** Present only when `sent` is false — says why that provider refused. */
  reason?: EnquiryMailReason;
}

/**
 * Send the owner alert, trying each provider in turn.
 *
 * Returns the outcome — `sent` plus which `provider` handled it — or
 * `null` when no recipient address could be resolved at all (so callers
 * can tell "not sent" apart from "there was nowhere to send it"). The
 * provider name matters: the route handler writes it back to WordPress
 * (`_cmx_mailed_via`) so the wp-admin "Emailed" column can credit the
 * fallback instead of staying stuck on "no".
 */
export async function sendEnquiryAlert(
  alert: EnquiryAlert
): Promise<EnquiryAlertResult | null> {
  // Fall back to the address baked into app/lib/site.ts, so the alert
  // still has a destination even when ENQUIRY_EMAIL is not set in the
  // environment. That address is the single source of truth in the app.
  const to = process.env.ENQUIRY_EMAIL?.trim() || site.enquiryEmail;
  if (!isEmail(to)) return null;

  // 1. Resend, whenever an API key is configured.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const sent = await sendViaResend(apiKey, to, alert);
    if (sent) return { sent: true, provider: "resend" };
    // Do not give up here: fall through so a Resend outage, an expired
    // key or an unverified sender domain still alerts the owner.
  }

  // 2. FormSubmit, the zero-configuration path.
  const fallback = await sendViaFormSubmit(to, alert);
  return { sent: fallback.sent, provider: "formsubmit", reason: fallback.reason };
}

/** Plain-text rendering of the selected package, for text-only mail. */
function describePackage(alert: EnquiryAlert): string {
  if (alert.packageItems.length === 0) return "-";
  const total = alert.packageItems.reduce((sum, i) => sum + i.price, 0);
  const lines = alert.packageItems
    .map((item) => `* ${item.service} - $${item.price}`)
    .join("\n");
  return `${lines}\n\nEstimated total: $${total}`;
}

/** Send the alert through Resend's HTTP API (no SDK involved). */
async function sendViaResend(
  apiKey: string,
  to: string,
  alert: EnquiryAlert
): Promise<boolean> {
  const total = alert.packageItems.reduce((sum, i) => sum + i.price, 0);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Resend only sends from a verified domain — set this in the
        // Resend dashboard and to a value on the same domain.
        from: process.env.ENQUIRY_FROM ?? "CodeXmattriX <onboarding@resend.dev>",
        to: [to],
        // Reply-To goes to the customer, so replying reaches them.
        reply_to: alert.email,
        subject: `New pricing enquiry from ${alert.name}${
          total > 0 ? ` ($${total})` : ""
        }`,
        html: buildHtml(alert),
      }),
    });

    if (!response.ok) {
      console.error(
        "[enquiry] Resend send failed:",
        response.status,
        (await response.text().catch(() => "")).slice(0, 200)
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[enquiry] Resend send threw:", error);
    return false;
  }
}

/**
 * Send the alert through FormSubmit.co - the fallback that needs no account.
 *
 * Resend requires an account, an API key and usually a verified sender
 * domain. That is the right long-term setup, but it also means enquiry
 * mail silently stops until all three exist. FormSubmit needs nothing but
 * the recipient address, so the owner alert keeps working on a brand-new
 * deploy; the first send asks the owner to confirm the address once and
 * after that it lands in the inbox directly.
 *
 * Set ENQUIRY_MAIL_PROVIDER=none to turn this off and leave WordPress
 * mail (and Resend, when configured) as the only send paths.
 */
async function sendViaFormSubmit(
  to: string,
  alert: EnquiryAlert
): Promise<{ sent: boolean; reason?: EnquiryMailReason }> {
  if ((process.env.ENQUIRY_MAIL_PROVIDER ?? "").toLowerCase() === "none") {
    return { sent: false, reason: "disabled" };
  }

  const total = alert.packageItems.reduce((sum, i) => sum + i.price, 0);

  // FormSubmit only accepts requests that look like they came from a page
  // on a real site — a bare server-side POST is rejected with "Make sure
  // you open this page through a web server". Sending an explicit Referer
  // and Origin is what makes it accept the request.
  const origin = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://cms.codexmattrix.com"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Referer: `${origin}/pricing`,
          Origin: origin,
        },
        body: JSON.stringify({
          _subject: `New pricing enquiry from ${alert.name}${
            total > 0 ? ` ($${total})` : ""
          }`,
          _template: "table",
          // So hitting "Reply" in the inbox reaches the customer.
          _replyto: alert.email,
          name: alert.name,
          email: alert.email,
          phone: alert.phone ?? "-",
          company: alert.company || "-",
          source: alert.source,
          page: alert.page || "-",
          submitted: submittedStamp(alert),
          total: `$${total}`,
          package: describePackage(alert),
          message: alert.message ?? "-",
        }),
      }
    );

    const body = await response.text().catch(() => "");

    // FormSubmit answers 200 with {"success":"true"|"false", ...}, so the
    // status alone is not enough to call the send successful.
    if (!/"success"\s*:\s*"true"/.test(body)) {
      // On the very first send to an address FormSubmit emails the owner a
      // one-time "Activate Form" link and holds the alert until it is
      // clicked. That is the expected first-run state, not a defect, so
      // log it as the actionable next step instead of a generic failure.
      if (/needs Activation|Activate Form/i.test(body)) {
        console.error(
          `[enquiry] FormSubmit is holding the alert until ${to} clicks its one-time activation link`
        );
        return { sent: false, reason: "held_activation" };
      }

      console.error(
        "[enquiry] FormSubmit send failed:",
        response.status,
        body.slice(0, 200)
      );
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[enquiry] FormSubmit send threw:", error);
    return { sent: false, reason: "provider_error" };
  }
}
