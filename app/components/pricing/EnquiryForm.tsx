"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/app/lib/site";

/** One priced line captured from the calculator summary. */
export interface EnquiryLine {
  service: string;
  price: number;
}

interface EnquiryFormProps {
  /** The package the visitor selected in the calculator. */
  packageItems: EnquiryLine[];
  /** Estimated total, shown in the form header. */
  total: number;
  /** Submit button label from the CMS copy. */
  submitLabel: string;
  /** Fallback contact link, used only if the network call fails. */
  fallbackHref?: string;
  /** Called after a successful send, so the caller can close the form. */
  onDone?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fieldClasses =
  "w-full rounded-[10px] border border-line bg-panel px-3 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-slate-light focus:border-crimson focus:bg-white";

const labelClasses =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-light";

/**
 * "Request This Package" form — shown inside the calculator summary.
 *
 * Submits to /api/enquiry, which stores the lead in WordPress and
 * emails the site owner. The visitor is NOT redirected to /contact:
 * they get an inline confirmation, with WhatsApp/email kept as a
 * backup channel in case the network call fails.
 */
export default function EnquiryForm({
  packageItems,
  total,
  submitLabel,
  fallbackHref,
  onDone,
}: EnquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot — hidden from people, tempting to bots.
  const [trap, setTrap] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          source: "pricing",
          page: typeof window !== "undefined" ? window.location.href : "",
          package: packageItems,
          company_website: trap,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !result?.ok) {
        setError(
          result?.error ??
            "We couldn't send your enquiry. Please try WhatsApp or email below."
        );
        return;
      }

      setSent(true);
    } catch {
      setError(
        "We couldn't send your enquiry. Please try WhatsApp or email below."
      );
    } finally {
      setSending(false);
    }
  }

  /* ------------------------------ sent ------------------------------ */
  if (sent) {
    return (
      <div className="pricing-enquiry" role="status">
        <p className="pricing-enquiry-title">Enquiry sent ✓</p>
        <p className="pricing-enquiry-note">
          Thanks {name.trim().split(" ")[0]} — your package request is with our
          team. We reply within one business day.
        </p>
        <div className="pricing-enquiry-alt">
          <p>Need it sooner? Reach us directly:</p>
          <div className="pricing-enquiry-alt-actions">
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              WhatsApp
            </a>
            <a href={`mailto:${site.email}`} className="btn-ghost">
              Email
            </a>
          </div>
        </div>
        {onDone ? (
          <button
            type="button"
            className="pricing-enquiry-reset"
            onClick={() => {
              setSent(false);
              onDone();
            }}
          >
            Edit my selections
          </button>
        ) : null}
      </div>
    );
  }

  /* ------------------------------ form ------------------------------ */
  return (
    <form className="pricing-enquiry" onSubmit={handleSubmit} noValidate>
      <p className="pricing-enquiry-title">{submitLabel}</p>
      <p className="pricing-enquiry-note">
        Send this package ({packageItems.length}{" "}
        {packageItems.length === 1 ? "service" : "services"} · ${total}) and
        we&apos;ll confirm the details with you.
      </p>

      <label className="mb-3 block">
        <span className={labelClasses}>Full name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
          className={fieldClasses}
        />
      </label>

      <label className="mb-3 block">
        <span className={labelClasses}>Email address</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="jane@company.com"
          autoComplete="email"
          className={fieldClasses}
        />
      </label>

      <label className="mb-3 block">
        <span className={labelClasses}>Phone (optional)</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+1 555 000 0000"
          autoComplete="tel"
          className={fieldClasses}
        />
      </label>

      <label className="mb-3 block">
        <span className={labelClasses}>Anything else? (optional)</span>
        <textarea
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Timeline, references, anything that helps."
          className={`${fieldClasses} resize-none`}
        />
      </label>

      {/* Spam trap — off-screen, never announced, never tabbable. */}
      <div aria-hidden="true" className="pricing-enquiry-trap">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(event) => setTrap(event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mb-3 text-[13px] font-semibold text-crimson">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="btn-primary pricing-summary-btn w-full justify-center disabled:opacity-70"
      >
        {sending ? "Sending…" : submitLabel}
      </button>

      <p className="pricing-enquiry-fallback">
        Or{" "}
        <a href={site.whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>{" "}
        us on +{site.whatsappNumber}
        {fallbackHref ? (
          <>
            {" "}
            ·{" "}
            <a href={fallbackHref}>or send a message</a>
          </>
        ) : null}
        .
      </p>
    </form>
  );
}
