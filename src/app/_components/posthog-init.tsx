"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { usePathname } from "next/navigation";

export function PosthogInit(): null {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
      const alreadyLoaded = (posthog as unknown as { __loaded?: boolean }).__loaded === true;
      if (key && !alreadyLoaded) {
        posthog.init(key, {
          api_host: host,
          capture_pageview: false, // we will capture explicitly on path change
          person_profiles: "identified_only",
        });
        (window as unknown as { posthog?: typeof posthog }).posthog = posthog;
      }
    } catch {
      // noop analytics
    }
  }, []);

  // Capture page views on route change
  useEffect(() => {
    try {
      const ph = (window as unknown as { posthog?: typeof posthog }).posthog;
      if (ph) ph.capture("$pageview");
    } catch {
      // noop analytics
    }
  }, [pathname]);

  return null;
}


