import type { ServicesContent } from "./types";

/** Bundled, project-owned copy for the /services page. */
export const defaultServicesContent: ServicesContent = {
  hero: {
    kicker: "What We Do",
    title: "Digital products built to move your business",
    titleAccent: "forward.",
    subtitle:
      "From the first sketch to a production-ready platform, CodeXmattriX brings strategy, UX/UI, web, mobile and software development together under one roof.",
    ctaLabel: "Start a Project",
    secondaryLabel: "Explore Our Services",
    trustBadge: "Design, build and support — from one focused team",
  },
  overview: {
    kicker: "Services",
    heading:
      "Everything you need to design and build better digital products — in one place.",
    intro:
      "Choose the capability you need today, or combine several into one connected digital product.",
    groups: [
      {
        title: "Design Services",
        items: [
          { label: "UI/UX Design", href: "#ux-ui" },
          { label: "Mobile App Design", href: "#mobile-design" },
          { label: "SaaS & Dashboard Design", href: "#saas-design" },
          { label: "Brand Identity Design", href: "#brand" },
        ],
      },
      {
        title: "Development Services",
        items: [
          { label: "Web Development", href: "#web-dev" },
          { label: "Mobile App Development", href: "#mobile-design" },
          { label: "Custom Software & SaaS", href: "#saas-design" },
          {
            label: "AI Agent Development & Automation",
            href: "#ai-automation",
          },
        ],
      },
    ],
  },
  detailsIntro: {
    kicker: "What We Build",
    heading: "The right mix of strategy, design and engineering.",
    intro:
      "Every engagement starts with the outcome you need. We shape the scope around your users, your team and the next stage of your business.",
  },
  details: [
    {
      id: "web-dev",
      number: "01",
      category: "Web Design & Development",
      title: "Websites that work as hard as your business.",
      summary:
        "Fast, responsive web experiences that make a strong first impression and turn attention into action.",
      description:
        "We plan, design and build websites around the people you want to reach and the action you want them to take. Every screen is designed to feel clear and work across devices.",
      features: [
        "Custom responsive websites",
        "Next.js and React builds",
        "CMS and API integrations",
        "Conversion-focused landing pages",
      ],
      outcome: "A fast, credible web presence ready to support your next stage of growth.",
    },
    {
      id: "ux-ui",
      number: "02",
      category: "UX & UI Design",
      title: "Interfaces that make complex things feel simple.",
      summary:
        "User research, flows and interface design that reduce friction for your customers and your team.",
      description:
        "We start with the people using the product, map the right flows and create an interface system that makes every next step feel obvious.",
      features: [
        "User flows and wireframes",
        "Interactive prototypes",
        "Design systems and components",
        "Usability testing and refinement",
      ],
      outcome: "A product experience people can understand quickly and use confidently.",
    },
    {
      id: "mobile-design",
      number: "03",
      category: "Mobile App Design & Development",
      title: "Mobile products built for real life.",
      summary:
        "Reliable iOS and Android experiences for the moments that matter most to your customers.",
      description:
        "We design and develop mobile applications around real workflows, not just screens. The result is a fast, secure and maintainable product.",
      features: [
        "iOS and Android development",
        "App architecture and APIs",
        "Account and notification flows",
        "Store release and support",
      ],
      outcome: "A dependable mobile experience that keeps your brand present in your users’ hands.",
    },
    {
      id: "digital-product",
      number: "04",
      category: "Digital Product Design",
      title: "Turn a big idea into a product people want to use.",
      summary:
        "Research, product thinking and MVP design for new digital products and sharper versions of existing ones.",
      description:
        "We help early ideas become usable, testable products by connecting user research, product strategy and interface design before the wrong thing gets built.",
      features: [
        "Product discovery and research",
        "Requirements and user mapping",
        "MVP definition and prototyping",
        "Developer-ready documentation",
      ],
      outcome: "A clear, testable path from first idea to a product your audience can adopt.",
    },
    {
      id: "saas-design",
      number: "05",
      category: "Custom Software & SaaS",
      title: "Software that fits the way your business works.",
      summary:
        "Purpose-built dashboards, platforms and internal tools for workflows off-the-shelf products cannot handle.",
      description:
        "When the standard tool is not enough, we combine thoughtful product design with dependable engineering to create software your team can operate confidently.",
      features: [
        "Dashboards and admin portals",
        "Authentication and permissions",
        "API and third-party integrations",
        "Scalable application architecture",
      ],
      outcome: "A focused product that gives your team more control over the work that matters.",
    },
    {
      id: "brand",
      number: "06",
      category: "Brand & Marketing Design",
      title: "A visual identity that makes the right impression.",
      summary:
        "Brand systems and marketing assets that communicate clearly, consistently and with character.",
      description:
        "Your brand should feel as thoughtful as your product. We create visual direction and practical assets that give every customer touchpoint a consistent story.",
      features: [
        "Visual direction and identity",
        "Logo and color systems",
        "Campaign and social assets",
        "Web-ready brand guidelines",
      ],
      outcome: "A brand presence that builds recognition and earns attention at every touchpoint.",
    },
    {
      id: "ai-automation",
      number: "07",
      category: "AI & Automation",
      title: "Remove the repetitive work that slows your team down.",
      summary:
        "Practical AI and workflow automation that connects the tools you already use and gives time back.",
      description:
        "We map the processes that slow your team down, then design practical automation around how you already work — useful technology, not complexity for its own sake.",
      features: [
        "Workflow and process mapping",
        "AI-assisted operations",
        "API and tool integrations",
        "Internal automation tools",
      ],
      outcome: "Less busywork, faster handoffs and a team that can focus on higher-value work.",
    },

  ],
  results: {
    kicker: "Built Around Outcomes",
    heading: "Digital work that earns its place in your business.",
    description:
      "We bring an outside perspective on the moments that matter — then turn that perspective into products people can use and teams can operate.",
    items: [
      {
        title: "Healthcare & Telehealth",
        description:
          "Patient booking, dashboards and care experiences designed around clarity, trust and real-world workflows.",
        tag: "Care journeys",
      },
      {
        title: "CBD & Cannabis",
        description:
          "Compliant, trustworthy digital experiences that make a complex buying journey feel straightforward.",
        tag: "Commerce + trust",
      },
      {
        title: "E-commerce",
        description:
          "Storefronts and product experiences that help people discover, trust and choose with confidence.",
        tag: "More clarity",
      },
      {
        title: "Growing US Brands",
        description:
          "Web, app and software partnerships for ambitious teams ready to turn momentum into momentum online.",
        tag: "Built to scale",
      },
    ],
  },
  support: {
    kicker: "Ongoing Support",
    heading: "Launch once. Keep improving long after go-live.",
    copy:
      "Your product should get better as your business learns. We stay available for the improvements, experiments and support that keep your digital presence useful.",
    points: [
      "Conversion and usability improvements",
      "Performance and reliability checks",
      "New features and integrations",
      "Ongoing technical support",
    ],
  },
  cta: {
    kicker: "Let’s Build What’s Next",
    title: "Have a product, website or workflow in mind?",
    subtitle:
      "Tell us what you are trying to improve. We will help shape the right scope, approach and next step.",
    buttonLabel: "Book a Free Consultation",
  },
};
