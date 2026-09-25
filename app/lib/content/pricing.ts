import type { PricingContent, PricingQuestion } from "./types";
import { site } from "@/app/lib/site";

/**
 * Bundled default content for the Pricing page (Design + Development tabs).
 *
 * This mirrors the approved standalone calculator 1:1 — prices, order and
 * behaviour are identical. WordPress ACF only replaces these values at
 * runtime (see wordpress/pricing-acf-setup.md); the design is never rebuilt
 * in WordPress. If the CMS is unreachable, this file keeps /pricing fully
 * functional.
 */

/** Empty website/product slots for the non-website questions. */
export const emptyQuestionSlots: Pick<
  PricingQuestion,
  | "websitePrompt"
  | "websiteTypes"
  | "staticNote"
  | "staticTitle"
  | "staticDescription"
  | "staticLabel"
  | "productPrompt"
  | "productOptions"
> = {
  websitePrompt: "",
  websiteTypes: [
    { key: "static", title: "", description: "", price: 0, priceLabel: "" },
    { key: "ecommerce", title: "", description: "", price: 0, priceLabel: "" },
  ],
  staticNote: "",
  staticTitle: "",
  staticDescription: "",
  staticLabel: "",
  productPrompt: "",
  productOptions: [
    { key: "100", title: "", description: "", price: 0, priceLabel: "" },
    { key: "550", title: "", description: "", price: 0, priceLabel: "" },
  ],
};

export const defaultPricingContent: PricingContent = {
  hero: {
    kicker: "Pricing",
    title: "Build Your Package.",
    titleAccent: "Know Your Price.",
    subtitle:
      "Tell us what your business needs. Select the services that you want and get an instant estimated project price.",
  },
  design: {
    id: "design",
    tabLabel: "Custom Premium",
    kicker: "Custom Premium",
    heading: "What Does Your Business Need?",
    sub: "Select Yes or No and we'll calculate your estimated price.",
    questions: [
      {
        key: "logo",
        number: "01",
        title: "Do you need a Logo Design?",
        description: "Get a professional logo designed for your business.",
        yesPrice: 50,
        yesSub: "+$50",
        mode: "simple",
        ...emptyQuestionSlots,
      },
      {
        key: "branding",
        number: "02",
        title: "Do you need Branding?",
        description: "Build a consistent visual identity for your brand.",
        yesPrice: 30,
        yesSub: "+$30",
        mode: "simple",
        ...emptyQuestionSlots,
      },
      {
        key: "website",
        number: "03",
        title: "Do you need a Website?",
        description: "Choose between a static website or an e-commerce website.",
        yesPrice: 0,
        yesSub: "Choose Website Type",
        mode: "website",
        websitePrompt: "What type of website do you need?",
        websiteTypes: [
          {
            key: "static",
            title: "Static Website",
            description: "Professional business website",
            price: 100,
            priceLabel: "$100",
          },
          {
            key: "ecommerce",
            title: "E-Commerce Website",
            description: "Online store with products",
            price: 300,
            priceLabel: "$300",
          },
        ],
        staticNote: "Static website package includes a complete website.",
        staticTitle: "Full Static Website",
        staticDescription: "Complete static website",
        staticLabel: "Included — $100",
        productPrompt: "How many products do you need?",
        productOptions: [
          {
            key: "100",
            title: "Up to 100 Products",
            description: "Product setup",
            price: 20,
            priceLabel: "+$20",
          },
          {
            key: "550",
            title: "Up to 550 Products",
            description: "Product setup",
            price: 80,
            priceLabel: "+$80",
          },
        ],
      },
      {
        key: "redesign",
        number: "04",
        title: "Do you need Website Redesign?",
        description: "Already have a website? We can redesign and improve it.",
        yesPrice: 100,
        yesSub: "+$100",
        mode: "simple",
        ...emptyQuestionSlots,
      },
      {
        key: "custom",
        number: "05",
        title: "Do you need Custom Development?",
        description: "Custom functionality, integrations or advanced features.",
        yesPrice: 0,
        yesSub: "Contact Us",
        mode: "contact",
        ...emptyQuestionSlots,
      },
    ],
    summaryLabel: "Your Package",
    summaryTitle: "Estimated Investment",
    emptyText: "Select your requirements and your selected services will appear here.",
    totalLabel: "Estimated Total",
    totalNote: "Final pricing may vary depending on project requirements and complexity.",
    ctaLabel: "Request This Package →",
  },
  development: {
    id: "development",
    tabLabel: "Digital Marketing & SEO",
    popularLabel: "Most Popular",
    kicker: "Digital Growth",
    heading: "Digital Marketing & SEO",
    sub: "Choose the growth plan that fits your business.",
    plans: [
      {
        name: "SEO Starter",
        description:
          "A strong foundation for businesses beginning their organic growth journey.",
        price: 150,
        per: "/ month",
        features: [
          "Keyword Research",
          "On-Page SEO",
          "Technical SEO Audit",
          "Meta Title & Description",
          "Monthly SEO Report",
        ],
        ctaLabel: "Get Started →",
      },
      {
        name: "SEO Growth",
        description:
          "For businesses ready to increase organic traffic, visibility and leads.",
        price: 300,
        per: "/ month",
        features: [
          "Everything in Starter",
          "Advanced Keyword Research",
          "Content Optimization",
          "Technical SEO Improvements",
          "Competitor Analysis",
          "Link Building",
          "Monthly Performance Report",
        ],
        ctaLabel: "Choose Growth →",
        popular: true,
      },
      {
        name: "SEO Premium",
        description:
          "A complete growth strategy for brands targeting competitive markets.",
        price: 500,
        per: "/ month",
        features: [
          "Everything in Growth",
          "Advanced Technical SEO",
          "Content Strategy",
          "Competitor Research",
          "High-Quality Link Building",
          "Conversion Optimization",
          "Detailed Monthly Reporting",
        ],
        ctaLabel: "Go Premium →",
      },
    ],
  },
  webdev: {
    id: "webdev",
    // Empty until runtime: wordpress.ts builds questions[] DYNAMICALLY
    // from the Development post's ACF fields (one Yes/No question per
    // priced field). With no post / no priced field cmsReady stays
    // false and PricingTabs shows the heading + quote-CTA empty
    // state — placeholder questions never render.
    cmsReady: false,
    tabLabel: "Development",
    kicker: "Development",
    heading: "What Does Your Project Need?",
    sub: "Select Yes or No and we'll calculate your estimated price.",
    questions: [],
    summaryLabel: "Your Package",
    summaryTitle: "Estimated Investment",
    emptyText:
      "Select your requirements and your selected services will appear here.",
    totalLabel: "Estimated Total",
    totalNote:
      "Final pricing may vary depending on project requirements and complexity.",
    ctaLabel: "Request This Package →",
  },
  cta: {
    title: "Have a bigger project in mind?",
    subtitle:
      "Every business is different. Tell us what you're building and we'll create a custom solution around your goals.",
    buttonLabel: "Talk To Our Experts →",
  },
};

// The middle tab's questions are built at runtime in
// applyPricingPosts() (app/lib/wordpress.ts) — one Yes/No question
// per priced ACF field on the "development" post. Nothing bundled.

export const pricingContactHref = site.links.contact;
