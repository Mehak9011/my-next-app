/**
 * ============================================================
 * Enquiry notification — reliable delivery for owner alerts.
 *
 * WordPress stores the lead first (see wordpress/cmx-enquiries.php)
 * and tries wp_mail() itself. Shared hosts often refuse or silently
 * drop that mail, so this module is the fallback: when Resend is
 * configured it sends the alert from Vercel instead.
 *
 * Deliberately dependency-free — it calls the Resend HTTP API with
 * the platform `fetch`, so no npm package is added to this project.
 * ============================================================
 */

export interface EnquiryAlert {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source: string;
  /** Lines the visitor selected, already priced. */
  packageItems: { service: string; price: number }[];
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
      <tr><td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;">Source</td>
          <td style="padding:6px 0;font-size:14px;">${esc(alert.source)}</td></tr>
    </table>
    ${packageBlock}${messageBlock}
  </div>`;
}

/**
 * Send the alert through Resend.
 *
 * Returns `null` (without touching the network) when Resend is not
 * configured, so this is a safe no-op by default. When it IS
 * configured it returns true/false for the send attempt.
 */
export async function sendEnquiryAlert(
  alert: EnquiryAlert
): Promise<boolean | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const to = process.env.ENQUIRY_EMAIL;
  if (!to) return null;

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
