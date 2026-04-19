import { HOME_OG_IMAGE_URL } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo";
import { createThemeInitializerScript } from "@/lib/theme";
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import cn from "classnames";
import dynamic from "next/dynamic";
import { Masthead } from "./_components/masthead";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "./_components/footer";
import { PosthogInit } from "./_components/posthog-init";
import { KeyboardShortcutsProvider } from "./_components/keyboard-shortcuts-provider";

import "./globals.css";

const CustomCursor = dynamic(
  () => import("./_components/custom-cursor").then((mod) => ({ default: mod.CustomCursor })),
  { loading: () => null }
);

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shreyash Gupta",
  description:
    "Personal website and blog of Shreyash Gupta — Data Scientist, Software Engineer, and Tech Enthusiast.",
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: getSiteUrl(),
  },
  openGraph: {
    type: "website",
    url: getSiteUrl(),
    title: "Shreyash Gupta",
    description:
      "Personal website and blog of Shreyash Gupta — Software Engineer, Tech Enthusiast, and Content Creator.",
    images: [HOME_OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyash Gupta",
    description:
      "Personal website and blog of Shreyash Gupta — Software Engineer, Tech Enthusiast, and Content Creator.",
    images: [HOME_OG_IMAGE_URL],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#121518" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#000000" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <script
          dangerouslySetInnerHTML={{ __html: createThemeInitializerScript() }}
        />
      </head>
      <body
        className={cn(
          serif.variable,
          sans.variable,
          mono.variable,
          "font-sans bg-background text-foreground min-h-screen flex flex-col"
        )}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:text-foreground focus:border focus:border-foreground focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <PosthogInit />
        <CustomCursor />
        <KeyboardShortcutsProvider />
        <Masthead />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
