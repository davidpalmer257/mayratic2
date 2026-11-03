import type { Metadata } from "next";
import "@/styles/design-system.css";
import "@/styles/globals.css";
import { SiteShell } from "@/components/site-shell";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Mayratic — Intelligent software, built around your business", template: "%s — Mayratic" },
  description: "Custom web platforms, mobile applications, and AI automation. From the first idea to production, built around how your business works. Based in Dubai, working worldwide.",
  openGraph: { type: "website", siteName: "Mayratic", title: "Intelligent software is here.", description: "Software built around your business. From the first idea to production." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><SiteShell>{children}</SiteShell></body></html>;
}
