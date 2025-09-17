"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { usePathname } from "next/navigation";
import { capture, AnalyticsEvent } from "@/lib/analytics";

function generateOrGetUserId(): string {
  try {
    let userId = localStorage.getItem('sg_user_id');
    if (!userId) {
      // Generate a random user ID with timestamp
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sg_user_id', userId);
    }
    return userId;
  } catch {
    // Fallback for cases where localStorage is not available
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

function getUserProperties() {
  try {
    return {
      $browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' :
                navigator.userAgent.includes('Safari') ? 'Safari' : 
                navigator.userAgent.includes('Edge') ? 'Edge' : 'Other',
      $device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      $screen_height: screen.height,
      $screen_width: screen.width,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      returning_visitor: localStorage.getItem("sg_hasVisited") === "1"
    };
  } catch {
    return {};
  }
}

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
          person_profiles: "always", // Changed from "identified_only" to capture more data
        });
        
        // Generate or get persistent user ID
        const userId = generateOrGetUserId();
        const userProps = getUserProperties();
        
        // Identify the user with properties
        posthog.identify(userId, userProps);
        
        (window as unknown as { posthog?: typeof posthog }).posthog = posthog;
        try { window.dispatchEvent(new Event('posthog:ready')); } catch { void 0; }
      }
    } catch {
      // noop analytics
      void 0;
    }
  }, []);

  // Capture page views on route change
  useEffect(() => {
    capture(AnalyticsEvent.PageView, {
      pathname,
      referrer: document.referrer,
      previous_page: sessionStorage.getItem('sg_previous_page'),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      is_mobile: /Mobi|Android/i.test(navigator.userAgent),
      connection_type: (navigator as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown'
    });
    
    // Store current page for next navigation
    sessionStorage.setItem('sg_previous_page', pathname);
  }, [pathname]);

  return null;
}


