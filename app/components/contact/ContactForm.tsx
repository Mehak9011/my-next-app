"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/app/lib/site";
import Reveal from "@/app/components/ui/Reveal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact form — 100% Next.js.
 *
 * Validation and UI stay in Next.js. On submit it builds a pre-filled
 * WhatsApp message and a pre-filled email, then lets the visitor pick
 * the channel — no plugin, no WordPress page, no backend required.
 *
 * Styling follows the home page design system: brand tokens (ink, panel,
 * line, crimson), the shared Kicker/section-title type scale and the
 * .btn-primary/.btn-ghost buttons.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const inputClasses =
    "w-full rounded-[12px] border border-line bg-panel px-4 py-3 text-[15px] text-ink outline-none transition-all duration-200 placeholder:text-slate-light/80 focus:border-crimson focus:bg-white";

  const labelClasses =
    "mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-slate-light";

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
    <Reveal variant="right" className="h-full">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex h-full flex-col rounded-[20px] border border-line bg-white p-8 shadow-[0_20px_50px_-40px_rgba(20,24,29,0.4)]"
      >
        <p className="kicker">Book a free consultation</p>
        <h2 className="mb-1 text-[26px] font-bold tracking-[-0.02em]">
          Tell us about your project
        </h2>
        <p className="mb-7 text-[14px] leading-relaxed text-slate">
          Fill this in and your message opens pre-filled in WhatsApp or email —
          you stay in control, and we reply within one business day.
        </p>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClasses}>Full name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe"
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className={labelClasses}>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jane@company.com"
              className={inputClasses}
            />
          </label>
        </div>

        <label className="mb-4 block">
          <span className={labelClasses}>Company (optional)</span>
          <input
            type="text"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Company, Inc."
            className={inputClasses}
          />
        </label>

        <label className="mb-5 block">
          <span className={labelClasses}>Tell us about your project</span>
          <textarea
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="What are you building, and what does success look like?"
            className={`${inputClasses} resize-none`}
          />
        </label>

        {error ? (
          <p role="alert" className="mb-4 text-[14px] font-semibold text-crimson">
            {error}
          </p>
        ) : null}

        {ready ? (
          <div className="mt-auto rounded-[14px] border border-line bg-panel p-5 text-[14px] leading-relaxed text-ink">
            <p className="mb-1 font-bold">Your message is ready — pick a channel:</p>
            <p className="mb-4 text-slate">
              If nothing opens, you can always email us directly at{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-crimson">
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
          <button
            type="submit"
            className="btn-primary mt-auto w-full justify-center"
          >
            Send Message
          </button>
        )}
      </form>
    </Reveal>
  );
}