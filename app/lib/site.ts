/**
 * Site-wide business constants — the single source of truth for
 * contact details, navigation and links used across every page.
 */
export const site = {
  name: "CodeXmattriX",
  tagline: "Envision · Design · Code",
  taglineUppercase: "ENVISION · DESIGN · CODE",
  email: "cmx@codexmattrix.com",
  phones: [
    { label: "+91 78328 20005", href: "tel:+917832820005" },
    { label: "+91 82196 77185", href: "tel:+918219677185" },
  ],
  addressIndia:
    "City Plaza, 56, Civil Lines, near KCC Bank, Chilgari, Dharamshala, Himachal Pradesh 176215",
  addressUS: "1671 Hoag Road Ashville, New York 14710, US",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917832820005",
  whatsappUrl: `https://wa.me/${
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917832820005"
  }`,
  links: {
    services: "/services",
    caseStudies: "/case-studies",
    work: "/case-studies",
    faq: "/faq",
    about: "/about",
    process: "/process",
    pricing: "/pricing",
    contact: "/contact",
  },
} as const;

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Primary navigation — deliberately the SAME entry list as the footer's
 * "Company" column, so the header and footer menus can never drift apart.
 * Both components read this array (single source of truth).
 */
export const navLinks: NavLink[] = [
  { label: "About", href: site.links.about },
  { label: "Services", href: site.links.services },
  { label: "Process", href: site.links.process },
  { label: "Case Studies", href: site.links.caseStudies },
  { label: "Pricing", href: site.links.pricing },
  { label: "Contact", href: site.links.contact },
];