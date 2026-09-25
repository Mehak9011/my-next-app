import type { AboutContent } from "./types";

/**
 * Bundled default content for the About page.
 *
 * The About page is designed AND populated entirely in Next.js —
 * WordPress only registers the "/about" URL. Edit THIS file to change
 * the copy (and app/components/about/* for the design). Nothing on
 * this page is fetched from the CMS — that is the whole point of the
 * "WordPress manages URLs, Next.js owns the frontend" architecture.
 */
export const defaultAboutContent: AboutContent = {
  hero: {
    kicker: "About Us",
    title: "A small team of designers & developers",
    titleAccent: "who care about the outcome.",
    subtitle:
      "We are CodeXmattriX — a design and development studio based in Dharamshala, India, building high-performing websites, apps and software for growing US brands.",
    ctaLabel: "Book a Free Consultation",
    secondaryLabel: "See Our Work",
    trustBadge:
      "★★★★★ Trusted by 15+ US brands across Healthcare, CBD & E-commerce",
  },
  story: {
    kicker: "Our Story",
    heading:
      "From a design table in the Himalaya foothills to trusted partners for US brands.",
    paragraphs: [
      "CodeXmattriX started with a simple frustration: too many businesses paid for websites that looked great and sold nothing. We set out to build the opposite — products where design, code and business goals are one conversation, not three.",
      "Today we work with healthcare, CBD and e-commerce brands across the United States. Every project still gets the same founding promise: explain everything clearly, ship on time, and stay involved long after launch.",
    ],
    pointsHeading: "What that looks like in practice",
    points: [
      "Design-first development — UI decisions are made before a line of code, not after.",
      "Weekly demos and plain-English updates. No black boxes.",
      "Two teams, one overlap — India build team aligned with US client hours.",
      "Post-launch support is included, not an upsell.",
    ],
  },
  mission: {
    kicker: "Mission & Vision",
    heading: "Why we do what we do.",
    mission:
      "To give growing businesses a website and software that treats design as an investment — not an expense — and converts the traffic they already paid for.",
    vision:
      "A web where small and mid-size brands can compete with enterprises because their digital products are built by people who care about the result, not the hand-off.",
  },
  values: {
    kicker: "Our Values",
    heading: "The standards behind every build.",
    items: [
      {
        title: "Design that converts",
        description:
          "Every pixel is a business decision. If it doesn't help the user take the next step, it doesn't ship.",
      },
      {
        title: "Code that lasts",
        description:
          "Clean architecture, readable code and documentation — so your product stays fast and easy to extend.",
      },
      {
        title: "Radical clarity",
        description:
          "Timelines, budgets and trade-offs are discussed openly. You always know where the project stands.",
      },
      {
        title: "Ownership",
        description:
          "We measure success by your results after launch — uptime, conversions and revenue — not by the invoice.",
      },
    ],
  },
  stats: [
    { value: "2019", label: "Studio Founded" },
    { value: "15+", label: "Projects Delivered" },
    { value: "8–12 wks", label: "Typical Timeline" },
    { value: "100%", label: "Post-Launch Support" },
  ],
  team: {
    kicker: "The Team",
    heading: "The people behind the pixels.",
    items: [
      {
        name: "[Placeholder — Founder's Name]",
        role: "Founder & Lead Developer",
        location: "Dharamshala, IN",
        bio:
          "[Placeholder — one line about the founder: background, what they build, and how they can be reached.]",
      },
      {
        name: "[Placeholder — Co-Founder's Name]",
        role: "Co-Founder & Head of Design",
        location: "Dharamshala, IN",
        bio:
          "[Placeholder — one line about the co-founder: design background and client approach.]",
      },
      {
        name: "[Placeholder — Team Member]",
        role: "Senior UI/UX Designer",
        location: "Remote",
        bio: "[Placeholder — one line about this team member's role and expertise.]",
      },
      {
        name: "[Placeholder — Team Member]",
        role: "Full-Stack Developer",
        location: "Remote",
        bio: "[Placeholder — one line about this team member's role and expertise.]",
      },
    ],
  },
  cta: {
    kicker: "Let's Talk",
    title: "Have a project in mind? Let's design and build it together.",
    subtitle:
      "Book a free 15-minute consultation and walk away with honest answers — including whether we're the right fit.",
    buttonLabel: "Book a Free Consultation",
  },
};