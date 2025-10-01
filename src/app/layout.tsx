import { HOME_OG_IMAGE_URL } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import cn from "classnames";
import { SiteNavigation } from "./_components/site-navigation";
import { CustomCursor } from "./_components/custom-cursor";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SiteFooter } from "./_components/footer";
import { PosthogInit } from './_components/posthog-init';
import { KeyboardShortcutsProvider } from "./_components/keyboard-shortcuts-provider";
import { ThemeProvider } from "./_components/theme-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shreyash Gupta",
  description:
    "Personal website and blog of Shreyash Gupta - Data Scientist, Software Engineer, and Tech Enthusiast.",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Force immediate theme application
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const html = document.documentElement;
                  
                  // Remove any existing theme classes
                  html.classList.remove('dark', 'light');
                  
                  if (isDark) {
                    html.classList.add('dark');
                  } else {
                    html.classList.add('light');
                  }
                  
                  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
                  
                  // Debug logging in development
                  if (window.location.hostname === 'localhost') {
                    console.info('Theme applied immediately:', isDark ? 'dark' : 'light');
                  }
                  
                  // Set up listener for system theme changes
                  const media = window.matchMedia('(prefers-color-scheme: dark)');
                  media.addEventListener('change', function() {
                    const isDark = media.matches;
                    html.classList.remove('dark', 'light');
                    if (isDark) {
                      html.classList.add('dark');
                    } else {
                      html.classList.add('light');
                    }
                    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
                    
                    if (window.location.hostname === 'localhost') {
                      console.info('Theme changed to:', isDark ? 'dark' : 'light');
                    }
                  });
                  
                  // Force re-application after a short delay to handle hydration
                  setTimeout(function() {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    html.classList.remove('dark', 'light');
                    if (isDark) {
                      html.classList.add('dark');
                    } else {
                      html.classList.add('light');
                    }
                    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
                    
                    if (window.location.hostname === 'localhost') {
                      console.info('Theme re-applied after delay:', isDark ? 'dark' : 'light');
                    }
                  }, 50);
                  
                } catch (error) {
                  console.error('Theme detection failed:', error);
                  // Fallback to light mode
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
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
          inter.className,
          "bg-background text-foreground transition-colors duration-200 min-h-screen flex flex-col"
        )}
      >
        <PosthogInit />
        <CustomCursor />
        <KeyboardShortcutsProvider />
        <ThemeProvider />
        <SiteNavigation />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
