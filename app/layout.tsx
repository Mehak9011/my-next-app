import type { Metadata } from "next";
import { Archivo, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import WhatsAppFab from "@/app/components/layout/WhatsAppFab";
import IframeHeightReporter from "@/app/components/layout/IframeHeightReporter";

// Brand fonts — self-hosted via next/font (no render-blocking Google request).
// The CSS variables below feed the Tailwind theme (--font-sans / --font-display).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "CodeXmattriX — Envision. Design. Code.",
    template: "%s — CodeXmattriX",
  },
  description:
    "Custom web, app & software development agency. We design high-performing websites, apps, and software that convert — for healthcare, cannabis, and growing US brands.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "CodeXmattriX",
    title: "CodeXmattriX — Envision. Design. Code.",
    description:
      "Custom web, app & software development agency — healthcare, CBD & growing US brands.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-ink">
        <IframeHeightReporter />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
