import type { HomeContent } from "./types";
import { site } from "@/app/lib/site";

/**
 * Bundled default content — a pixel-faithful copy of the original
 * static Home Page. Used whenever the WordPress CMS is disabled or
 * unreachable, so the site always renders and builds.
 */
export const defaultHomeContent: HomeContent = {
  hero: {
    kicker: "Envision · Design · Code",
    title: "Custom Web, App & Software Development Agency",
    subtitle:
      "We design high-performing websites, apps, and software that convert — for healthcare, cannabis, and growing US brands.",
    trustBadge:
      "★★★★★ Trusted by 15+ US brands across Healthcare, CBD & E-commerce",
  },
  shots: [
    {
      id: "ehr",
      image: "/images/shot-ehr.svg",
      label: "MMJ Docs EHR\nPatient Booking Dashboard",
    },
    {
      id: "card",
      image: "/images/shot-card.svg",
      label: "ApplyMMJCard\nWebsite Placeholder",
    },
    {
      id: "cbd",
      image: "/images/shot-cbd.svg",
      label: "CBD E-commerce\nStorefront Placeholder",
    },
    {
      id: "app",
      image: "/images/shot-app.svg",
      label: "Mobile App\nUI Placeholder",
    },
    {
      id: "jewelry",
      image: null,
      label: "Jewelry Brand\nStore Screenshot",
    },
  ],
  stats: [
    { value: "15+", label: "Projects Delivered" },
    { value: "8–12 wks", label: "Typical Timeline" },
    { value: "3", label: "Industries Specialized In" },
    { value: "100%", label: "Post-Launch Support" },
  ],
  services: {
    heading:
      "Everything you need to design and build better digital products — in one place.",
    groups: [
      {
        title: "Design Services",
        items: [
          "UI/UX Design",
          "Mobile App Design",
          "SaaS & Dashboard Design",
          "Brand Identity Design",
        ],
      },
      {
        title: "Development Services",
        items: [
          "Web Development",
          "Mobile App Development",
          "Custom Software & SaaS",
          "AI Agent Development & Automation",
        ],
      },
    ],
  },
  industries: {
    heading: "We know your industry because we've built in it.",
    items: [
      {
        title: "Healthcare & Telehealth",
        description:
          "Live EHR and patient booking platform — from compliance to UX, end to end.",
        image: "/images/industry-health.svg",
        link: site.links.caseStudies,
      },
      {
        title: "CBD & Cannabis",
        description:
          "Age verification, compliance-aware payments, ad-restriction workarounds — solved.",
        image: "/images/industry-cbd.svg",
        link: site.links.caseStudies,
      },
    ],
  },
  testimonials: {
    heading: "Words From Businesses We've Worked With",
    items: [
      {
        quote:
          '"[Placeholder — add real client quote once collected. e.g. Communication was easy, they explained everything clearly.]"',
        initial: "M",
        author: "MMJ Docs Client",
      },
      {
        quote: '"[Placeholder — add real client quote once collected.]"',
        initial: "C",
        author: "CBD Brand Client",
      },
      {
        quote: '"[Placeholder — add real client quote once collected.]"',
        initial: "J",
        author: "Jewelry Brand Client",
      },
    ],
  },
  faqs: {
    heading: "Got Questions? Let's Clear Things Up.",
    items: [
      {
        question: "How long does a typical project take?",
        answer:
          "Most projects run 8–12 weeks depending on complexity. We start with discovery and research, then move to design, development, and QA before launch.",
      },
      {
        question: "Do you have experience in healthcare or CBD/cannabis?",
        answer:
          "Yes — we've built a live EHR and patient booking platform, and have direct experience with CBD e-commerce compliance requirements like age verification and payment restrictions.",
      },
      {
        question: "What happens after launch?",
        answer:
          "We offer ongoing optimization and support post-launch — monitoring performance and refining based on real user behavior.",
      },
      {
        question: "How do we get started?",
        answer:
          "Book a free 15-minute consultation. We'll learn about your business and outline next steps — no obligation.",
      },
    ],
  },
  cta: {
    title: "Ready to build something that actually grows your business?",
    subtitle: "Free 15-minute consultation. No pressure, no obligation.",
    buttonLabel: "Book Your Free Consultation →",
  },
  clients: {
    kicker: "Our Clients",
    heading: "Businesses That Trust Us",
    names: ["Electric", "KingLasik", "Backyard", "Guild"],
  },
};