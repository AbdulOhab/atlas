import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeScript } from "@/components/layout/ThemeScript";
import "./globals.css";

const SITE_URL = "https://github.com/AbdulOhab/atlas";
const DESCRIPTION =
  "Concept modules and worked system design problems, with architecture diagrams and trade-offs.";

export const metadata: Metadata = {
  // Resolves the relative URLs of the generated share cards. Without it, every
  // link posted anywhere renders as a bare box.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atlas CE",
    template: "%s · Atlas CE",
  },
  description: DESCRIPTION,
  applicationName: "Atlas CE",
  authors: [{ name: "AbdulOhab", url: "https://github.com/AbdulOhab" }],
  keywords: [
    "system design",
    "system design interview",
    "distributed systems",
    "architecture diagrams",
    "scalability",
    "interview preparation",
  ],
  openGraph: {
    type: "website",
    siteName: "Atlas CE",
    title: "Atlas CE",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas CE",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
