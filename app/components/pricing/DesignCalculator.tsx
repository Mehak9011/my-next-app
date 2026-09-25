"use client";

import { useMemo, useState } from "react";
import type { PricingDesignTab, PricingQuestion } from "@/app/lib/content/types";

interface DesignCalculatorProps {
  /** Designing tab content, or the middle Development tab (id omitted). */
  design: Omit<PricingDesignTab, "id">;
  contactHref: string;
}

interface Selection {
  service: string;
  price: number;
}

/** "Do you need a Logo Design?" â†’ "Logo Design" for summary rows. */
function cleanTitle(title: string) {
  return title
    .replace(/^Do you need (a|an)?\s*/i, "")
    .replace(/\?$/, "")
    .trim();
}

/** Design-tab calculator â€” questions, conditional website flow, sticky summary. */
export default function DesignCalculator({ design, contactHref }: DesignCalculatorProps) {
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  // Explicit Yes/No answers drive the sequential reveal — and stop
  // unanswered questions from looking like "No" was already picked.
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const [showWebsite, setShowWebsite] = useState(false);
  const [websiteType, setWebsiteType] = useState<"static" | "ecommerce" | null>(null);
  const [productKey, setProductKey] = useState<string | null>(null);

  const websiteQuestion = useMemo(
    () => design.questions.find((q) => q.mode === "website"),
    [design.questions]
  );

  const selectedItems = useMemo(
    () => Object.values(selections).filter((item) => item.price > 0),
    [selections]
  );
  const total = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price, 0),
    [selectedItems]
  );

  function setSimple(question: PricingQuestion, choice: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, [question.key]: choice }));
    setSelections((prev) => {
      const next = { ...prev };
      if (choice === "yes") {
        next[question.key] = { service: cleanTitle(question.title), price: question.yesPrice };
      } else {
        delete next[question.key];
      }
      return next;
    });
  }

  function handleWebsiteAnswer(choice: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, website: choice }));
    if (choice === "no") {
      setShowWebsite(false);
      setWebsiteType(null);
      setProductKey(null);
      setSelections((prev) => {
        const next = { ...prev };
        delete next.website;
        delete next.static;
        delete next.ecommerce;
        delete next["100"];
        delete next["550"];
        return next;
      });
      return;
    }
    setShowWebsite(true);
    setSelections((prev) => {
      const next = { ...prev };
      delete next.website;
      return next;
    });
  }

  function handleWebsiteType(type: "static" | "ecommerce", service: string, price: number) {
    setWebsiteType(type);
    setProductKey(null);
    setSelections((prev) => {
      const next = { ...prev };
      delete next.static;
      delete next.ecommerce;
      delete next["100"];
      delete next["550"];
      next[type] = { service, price };
      return next;
    });
  }

  function handleProduct(key: string, service: string, price: number) {
    setProductKey(key);
    setSelections((prev) => {
      const next = { ...prev };
      delete next["100"];
      delete next["550"];
      next[key] = { service, price };
      return next;
    });
  }

  /** A question counts as answered once its (conditional) flow is complete. */
  function isAnswered(question: PricingQuestion): boolean {
    const answer = answers[question.key];
    if (question.mode === "website") {
      if (answer === "no") return true;
      if (answer !== "yes") return false;
      if (!websiteType) return false;
      return websiteType !== "ecommerce" || productKey !== null;
    }
    return answer !== undefined;
  }

  // Sequential reveal: a question shows only after every earlier one
  // has been answered (Yes or No).
  const revealed = design.questions.map((_, index) =>
    design.questions.slice(0, index).every((earlier) => isAnswered(earlier))
  );

  return (
    <div className="pricing-calculator">
      <div className="pricing-questions">
        {design.questions.map((question, questionIndex) => {
          if (!revealed[questionIndex]) return null;

          const isWebsite = question.mode === "website";
          const answer = answers[question.key];
          const yesSelected = answer === "yes";
          const noSelected = answer === "no";

          return (
            <div className="pricing-question" key={question.key}>
              <span className="pricing-question-number">{question.number}</span>
              <h3>{question.title}</h3>
              <p className="pricing-question-desc">{question.description}</p>

              <div className="pricing-yesno">
                <button
                  type="button"
                  className={`pricing-choice${yesSelected ? " is-selected" : ""}`}
                  onClick={() =>
                    isWebsite ? handleWebsiteAnswer("yes") : setSimple(question, "yes")
                  }
                >
                  Yes
                  <span className="pricing-choice-price">{question.yesSub}</span>
                </button>
                <button
                  type="button"
                  className={`pricing-choice${noSelected ? " is-selected" : ""}`}
                  onClick={() =>
                    isWebsite ? handleWebsiteAnswer("no") : setSimple(question, "no")
                  }
                >
                  No
                  <span className="pricing-choice-price">$0</span>
                </button>
              </div>



              {isWebsite && showWebsite && websiteQuestion ? (
                <div className="pricing-conditional">
                  <p className="pricing-question-desc">{websiteQuestion.websitePrompt}</p>
                  <div className="pricing-options-grid">
                    {websiteQuestion.websiteTypes.map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        className={`pricing-option${websiteType === type.key ? " is-selected" : ""}`}
                        onClick={() =>
                          handleWebsiteType(
                            type.key === "ecommerce" ? "ecommerce" : "static",
                            type.title,
                            type.price
                          )
                        }
                      >
                        <strong>{type.title}</strong>
                        <span>{type.description}</span>
                        <em className="pricing-option-price">{type.priceLabel}</em>
                      </button>
                    ))}
                  </div>

                  {websiteType === "static" ? (
                    <div className="pricing-conditional">
                      <p className="pricing-question-desc">{websiteQuestion.staticNote}</p>
                      <div className="pricing-options-grid">
                        <div className="pricing-option is-selected is-static">
                          <strong>{websiteQuestion.staticTitle}</strong>
                          <span>{websiteQuestion.staticDescription}</span>
                          <em className="pricing-option-price">{websiteQuestion.staticLabel}</em>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {websiteType === "ecommerce" ? (
                    <div className="pricing-conditional">
                      <p className="pricing-question-desc">{websiteQuestion.productPrompt}</p>
                      <div className="pricing-options-grid">
                        {websiteQuestion.productOptions.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            className={`pricing-option${productKey === option.key ? " is-selected" : ""}`}
                            onClick={() => handleProduct(option.key, option.title, option.price)}
                          >
                            <strong>{option.title}</strong>
                            <span>{option.description}</span>
                            <em className="pricing-option-price">{option.priceLabel}</em>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>


      <aside className="pricing-summary">
        <p className="pricing-summary-label">{design.summaryLabel}</p>
        <h3>{design.summaryTitle}</h3>

        <div className="pricing-summary-items">
          {selectedItems.length === 0 ? (
            <p className="pricing-summary-empty">{design.emptyText}</p>
          ) : (
            selectedItems.map((item) => (
              <div className="pricing-summary-row" key={item.service}>
                <span>{item.service}</span>
                <strong>${item.price}</strong>
              </div>
            ))
          )}
        </div>

        <div className="pricing-summary-total">
          <p className="pricing-total-label">{design.totalLabel}</p>
          <p className="pricing-total-price">${total}</p>
          <p className="pricing-total-note">{design.totalNote}</p>
        </div>

        <a href={contactHref} className="btn-primary pricing-summary-btn">
          {design.ctaLabel}
        </a>
      </aside>
    </div>
  );
}