'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect } from 'react';
import { injectContentsquareScript } from '@contentsquare/tag-sdk';

export function ClientAnalytics() {
  useEffect(() => {
    injectContentsquareScript({
      siteId: "5242334",
      async: true,
      defer: false
    });
  }, []);

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
} 