"use client";

import { useState } from "react";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { Faq } from "@/app/lib/content/types";

/**
 * FAQ accordion — one open item at a time (first opens by default),
 * matching the original behaviour. Accessible with keyboard support and
 * revealed with a per-item stagger.
 */
export default function FAQ({
  heading,
  items,
}: {
  heading: string;
  items: Faq[];
}) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="bg-panel py-[100px]">
      <div className="mx-auto w-full max-w-[800px] px-8">
        <Reveal variant="up">
          <Kicker>FAQ</Kicker>
          <h2 className="mb-9 text-[28px] font-bold sm:text-[36px]">{heading}</h2>
        </Reveal>

        {items.map((item, index) => {
          const open = openIndex === index;

          return (
            <Reveal key={item.question} variant="up" delay={index * 70}>
              <div
                className={`faq-item cursor-pointer border-t border-line py-[22px] ${
                  index === items.length - 1 ? "border-b border-line" : ""
                }`}
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? -1 : index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpenIndex(open ? -1 : index);
                  }
                }}
              >
                <div className="faq-question flex items-center justify-between gap-4 text-[16.5px] font-semibold leading-snug text-ink">
                  {item.question}
                  <span
                    className={`text-[20px] leading-none text-crimson transition-transform duration-200 ${
                      open ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </div>
                <div className={`faq-answer ${open ? "open" : ""}`}>
                  <div className="faq-answer-inner">{item.answer}</div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
