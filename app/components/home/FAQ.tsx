"use client";

import { useState } from "react";
import Kicker from "@/app/components/ui/Kicker";
import type { Faq } from "@/app/lib/content/types";

/**
 * FAQ accordion — one open item at a time (first opens by default),
 * matching the original behaviour. Accessible with keyboard support.
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
        <Kicker>FAQ</Kicker>
        <h2 className="mb-9 text-[28px] font-bold sm:text-[36px]">{heading}</h2>

        {items.map((item, index) => {
          const open = openIndex === index;

          return (
            <div
              key={item.question}
              className={`cursor-pointer border-t border-line py-[22px] ${
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
              <div className="flex items-center justify-between gap-4 text-[16.5px] font-semibold leading-snug text-ink">
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
          );
        })}
      </div>
    </section>
  );
}