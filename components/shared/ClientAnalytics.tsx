'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PHProvider, PostHogPageview } from '../providers/posthog-provider';

export function ClientAnalytics() {
  return (
    <PHProvider>
      <PostHogPageview />
      <Analytics />
      <SpeedInsights />
    </PHProvider>
  );
} 