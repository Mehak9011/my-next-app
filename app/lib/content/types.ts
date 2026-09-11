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
  /** Local path (public/) or absolute URL served by WordPress. */
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