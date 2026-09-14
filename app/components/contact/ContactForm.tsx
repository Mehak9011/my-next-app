"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/app/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact form — 100% Next.js.
 *
 * Validation and UI stay in Next.js. On submit it builds a pre-filled
 * WhatsApp message and a pre-filled email, then lets the visitor pick
 * the channel — no plugin, no WordPress page, no backend required.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const inputClasses =
    "w-full rounded-lg border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-slate-light focus:border-crimson";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (message.trim().length < 10) {
      setError("Please give us at least a sentence about your project.");
      return;
    }
    setReady(true);
  }

  const messageBody = [
    "Hi CodeXmattriX!",
    "",
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    company.trim() ? `Company: ${company.trim()}` : "Company: —",
    "",
    message.trim(),
  ].join("\n");

  const subject = `New project enquiry from ${name.trim()}`;
  const whatsappHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    messageBody
  )}`;
  const mailHref = `mailto:${site.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(messageBody)}`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[20px] border border-line bg-white p-8"
    >
      <h2 className="mb-1 text-[22px] font-bold">Book a free consultation</h2>
      <p className="mb-6 text-[14px] leading-relaxed text-slate">
        Fill this in and your message opens pre-filled in WhatsApp or email —
        you stay in control, and we reply within one business day.
      </p>

      <label className="mb-4 block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">Full name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jane Doe"
          className={inputClasses}
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">Email address</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="jane@company.com"
          className={inputClasses}
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">Company (optional)</span>
        <input
          type="text"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Company, Inc."
          className={inputClasses}
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">Tell us about your project</span>
        <textarea
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What are you building, and what does success look like?"
          className={inputClasses}
        />
      </label>

      {error ? (
        <p role="alert" className="mb-4 text-[14px] font-medium text-crimson">
          {error}
        </p>
      ) : null}

      {ready ? (
        <div className="mb-5 rounded-[12px] border border-line bg-panel p-4 text-[14px] leading-relaxed text-ink">
          <p className="mb-1 font-semibold">Your message is ready — pick a channel:</p>
          <p className="mb-4">
            If nothing opens, you can always email us directly at{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-crimson">
              {site.email}
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-[12px]">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary">
              Send via WhatsApp
            </a>
            <a href={mailHref} className="btn-ghost">
              Send via Email
            </a>
          </div>
        </div>
      ) : (
        <button type="submit" className="btn-primary w-full justify-center">
          Send Message
        </button>
      )}
    </form>
  );
}