/**
 * Typed shape of the Home Page content.
 *
 * The same shape is produced by:
 *   1. the bundled defaults (app/lib/content/defaults.ts), and
 *   2. the WordPress data layer (app/lib/wordpress.ts).
 * Components only ever consume this interface — they never care
 * whether the content came from the CMS or the defaults.
 */
export interface Shot {
  id: string;
  /** Local path (public/), a WordPress media URL, or a remote CDN URL. */
  image: string | null;
  /** Two lines, separated by "\n" (rendered as <br />). */
  label: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ServiceGroup {
  title: string;
  items: string[];
}

export interface Industry {
  title: string;
  description: string;
  image: string | null;
  link: string;
}

export interface Testimonial {
  quote: string;
  initial: string;
  author: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface HomeContent {
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    trustBadge: string;
  };
  shots: Shot[];
  stats: Stat[];
  services: {
    heading: string;
    groups: ServiceGroup[];
  };
  industries: {
    heading: string;
    items: Industry[];
  };
  testimonials: {
    heading: string;
    items: Testimonial[];
  };
  faqs: {
    heading: string;
    items: Faq[];
  };
  cta: {
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
  clients: {
    kicker: string;
    heading: string;
    names: string[];
  };
}

/* ------------------------------------------------------------------
   About page — populated by the bundled Next.js defaults
   (app/lib/content/about.ts). WordPress only registers the "/about"
   URL; it never provides content or design.
   ------------------------------------------------------------------ */
export interface AboutValue {
  title: string;
  description: string;
}

export interface AboutTeamMember {
  name: string;
  role: string;
  location: string;
  bio: string;
}

export interface AboutContent {
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    secondaryLabel: string;
    trustBadge: string;
  };
  story: {
    kicker: string;
    heading: string;
    paragraphs: string[];
    pointsHeading: string;
    points: string[];
  };
  mission: {
    kicker: string;
    heading: string;
    mission: string;
    vision: string;
  };
  values: {
    kicker: string;
    heading: string;
    items: AboutValue[];
  };
  stats: Stat[];
  team: {
    kicker: string;
    heading: string;
    items: AboutTeamMember[];
  };
  cta: {
    kicker: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
}

/* ------------------------------------------------------------------
   Pricing page — populated by WordPress ACF with bundled Next.js
   defaults as fallback (app/lib/content/pricing.ts).
   Free-ACF compatible: fixed slots only (groups + text/number/textarea),
   no repeaters. ACF field group lives in wordpress/acf-field-group.json
   and maps 1:1 to these interfaces (see wordpress/pricing-acf-setup.md).
   Tab "design"      ← ACF group "Designing"
   Tab "development" ← ACF group "Development"
   ------------------------------------------------------------------ */
export interface PricingWebsiteType {
  key: string;
  title: string;
  description: string;
  price: number;
  priceLabel: string;
}

export interface PricingProductOption {
  key: string;
  title: string;
  description: string;
  price: number;
  priceLabel: string;
}

export interface PricingQuestion {
  key: "logo" | "branding" | "website" | "redesign" | "custom";
  number: string;
  title: string;
  description: string;
  /** Price added on "Yes" (0 for the website flow and contact-only items). */
  yesPrice: number;
  /** Sub-label under "Yes" (e.g. "+$50", "Choose Website Type", "Contact Us"). */
  yesSub: string;
  mode: "simple" | "website" | "contact";
  websitePrompt: string;
  websiteTypes: [PricingWebsiteType, PricingWebsiteType];
  staticNote: string;
  staticTitle: string;
  staticDescription: string;
  staticLabel: string;
  productPrompt: string;
  productOptions: [PricingProductOption, PricingProductOption];
}

export interface PricingDesignTab {
  id: "design";
  tabLabel: string;
  kicker: string;
  heading: string;
  sub: string;
  questions: PricingQuestion[];
  summaryLabel: string;
  summaryTitle: string;
  emptyText: string;
  totalLabel: string;
  totalNote: string;
  ctaLabel: string;
}

export interface PricingPlan {
  name: string;
  description: string;
  price: number;
  per: string;
  /** One feature per line in ACF textarea; array in code. */
  features: string[];
  ctaLabel: string;
  popular?: boolean;
}

export interface PricingDevTab {
  id: "development";
  tabLabel: string;
  popularLabel: string;
  kicker: string;
  heading: string;
  sub: string;
  plans: [PricingPlan, PricingPlan, PricingPlan];
}

export interface PricingContent {
  hero: {
    kicker: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  design: PricingDesignTab;
  development: PricingDevTab;
  cta: {
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
}