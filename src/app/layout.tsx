import { HOME_OG_IMAGE_URL } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import cn from "classnames";
import dynamic from "next/dynamic";
import { SiteNavigation } from "./_components/site-navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "./_components/footer";
import { PosthogInit } from "./_components/posthog-init";
import { KeyboardShortcutsProvider } from "./_components/keyboard-shortcuts-provider";

import "./globals.css";

// Dynamic import CustomCursor - code-split to reduce initial bundle
// The component already handles touch device detection internally
const CustomCursor = dynamic(
  () => import("./_components/custom-cursor").then((mod) => ({ default: mod.CustomCursor })),
  { loading: () => null }
);

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shreyash Gupta",
  description:
    "Personal website and blog of Shreyash Gupta - Data Scientist, Software Engineer, and Tech Enthusiast.",
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: getSiteUrl(),
  },
  openGraph: {
    type: "website",
    url: getSiteUrl(),
    title: "Shreyash Gupta",
    description:
      "Personal website and blog of Shreyash Gupta - Software Engineer, Tech Enthusiast, and Content Creator.",
    images: [HOME_OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyash Gupta",
    description:
      "Personal website and blog of Shreyash Gupta - Software Engineer, Tech Enthusiast, and Content Creator.",
    images: [HOME_OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#000" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      </head>
      <body
        className={cn(
          geist.variable,
          playfair.variable,
          "font-sans bg-background text-foreground transition-colors duration-200 min-h-screen flex flex-col"
        )}
      >
        <PosthogInit />
        <CustomCursor />
        <KeyboardShortcutsProvider />
        <SiteNavigation />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
