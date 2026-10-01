import type { ProcessContent } from "./types";

/**
 * Bundled, project-owned copy for the /process page.
 *
 * The page follows the same journey as the original /our-process/ page —
 * hero, four numbered steps, two quote breaks, ongoing support and the
 * closing consultation CTA — but the presentation is entirely CodeXmattriX
 * (see app/components/process/* and the "PROCESS PAGE" block in
 * globals.css). Nothing here is fetched from WordPress: the CMS only
 * registers the "/process" URL.
 */
export const defaultProcessContent: ProcessContent = {
  hero: {
    kicker: "Our Process",
    title: "A clear, four-step path from",
    titleAccent: "idea to launch.",
    subtitle:
      "Design takes time, and it takes the right people working together. Our strategists, designers and developers move your project in defined stages — so you always know what happens next, what you get, and when.",
    ctaLabel: "Start a Project",
    secondaryLabel: "See the Steps",
    trustBadge: "Fixed scope · Fixed price · Weekly updates",
  },
  stepsIntro: {
    kicker: "How We Work",
    heading: "Four stages, no guesswork.",
    intro:
      "Every engagement runs through the same sequence. You see the work as it is shaped, not just at the end — and nothing starts until the previous stage is signed off.",
  },
  steps: [
    {
      id: "discovery",
      number: "01",
      phase: "Discovery",
      title: "Every project starts with a clear vision.",
      tagline: "Understanding what your product needs to achieve.",
      description:
        "The first step in any successful build is understanding what it needs to achieve. We learn your business, its vision and the audience you want to reach, then gather creative ideas around them. Our strategists also run a thorough competitive analysis so the direction is grounded in the market — not in guesswork.",
      deliverables: [
        "Discovery call and goal alignment",
        "Audience and competitor research",
        "Scope, budget and timeline",
        "Written project brief",
      ],
      outcome: "A shared definition of what success looks like, agreed before anyone starts building.",
    },
    {
      id: "design",
      number: "02",
      phase: "Design",
      title: "You see your ideas take visual shape early.",
      tagline: "Turning concepts into something you can react to.",
      description:
        "We turn your design ideas into detailed wireframes and interface designs, giving you an early visual representation of how we plan to tell your brand's story. Because you can see it before it is built, changes are cheap and the feedback is specific.",
      deliverables: [
        "Wireframes and user flows",
        "High-fidelity UI design",
        "Clickable prototype review",
        "Design system and components",
      ],
      outcome: "A design you have already approved, screen by screen — not a surprise at launch.",
    },
    {
      id: "build",
      number: "03",
      phase: "Build",
      title: "Clean code, built to work everywhere.",
      tagline: "Our designs are about function and feel in equal measure.",
      description:
        "Through an agile development process, our team builds your design using clean, minimal code. We test and iterate rigorously until the result is visually strong, fully functional and genuinely easy to use — and we check it works flawlessly across every platform your customers actually use.",
      deliverables: [
        "Responsive, accessible build",
        "CMS and third-party integrations",
        "Cross-device and cross-browser testing",
        "Weekly demo in plain English",
      ],
      outcome: "A fast, dependable product that holds up on every screen your audience uses.",
    },
    {
      id: "launch",
      number: "04",
      phase: "Launch",
      title: "3…2…1… launch your finished product.",
      tagline: "Delivering something that exceeds expectations.",
      description:
        "Once design and development are complete, we deliver a finished, polished product. Our goal is simple: something that looks genuinely good, works exactly as intended, and helps your business achieve the objectives we set out in step one.",
      deliverables: [
        "Final QA and pre-launch checklist",
        "Deployment and domain setup",
        "Analytics and tracking",
        "Team handover walkthrough",
      ],
      outcome: "A live product your team can use with confidence — and support that continues after go-live.",
    },
  ],
  quotes: [
    { quote: "Design is intelligence made visible.", linkLabel: "Let's chat about your project" },
    { quote: "Great design is great business.", linkLabel: "Let's chat about your project" },
  ],
  support: {
    kicker: "Ongoing Support",
    heading: "Ongoing support to keep your brand moving forward.",
    tagline: "A smooth process that puts your marketing on autopilot.",
    copy:
      "After the initial project is complete, we stay involved. Because we understand your story and vision, we can keep enhancing your design as your marketing needs change — so your business stays ahead of the competition instead of falling behind it.",
    points: [
      "Design updates and new creative assets",
      "Landing pages and campaign artwork",
      "Performance and usability reviews",
      "Priority support when something needs fixing",
    ],
  },
  cta: {
    kicker: "Let's Talk",
    title: "Ready to start step one?",
    subtitle:
      "Book a free 15-minute consultation and walk away with honest answers — including whether we're the right fit for your project.",
    buttonLabel: "Book a Free Consultation",
  },
};