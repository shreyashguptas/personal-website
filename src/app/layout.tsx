import { HOME_OG_IMAGE_URL } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import cn from "classnames";
import { ThemeSwitcher } from "./_components/theme-switcher";
import { SiteNavigation } from "./_components/site-navigation";
import { CustomCursor } from "./_components/custom-cursor";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ChatWidget } from "./_components/chat-widget";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shreyash Gupta",
  description:
    "Personal website and blog of Shreyash Gupta - Software Engineer, Tech Enthusiast, and Content Creator.",
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
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
        className={cn(inter.className, "bg-white text-black dark:bg-black dark:text-white transition-colors duration-200")}
      >
        <CustomCursor />
        <ThemeSwitcher />
        <SiteNavigation />
        <div className="min-h-screen">{children}</div>
        <ChatWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
