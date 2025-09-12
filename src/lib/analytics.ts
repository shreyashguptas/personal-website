// Centralized analytics helper for PostHog
// Adheres to rules from .cursor/rules/posthog-integration.mdc

export enum AnalyticsEvent {
  PageView = "$pageview",
  ChatMessageSent = "chat_message_sent",
  ChatResponseStreamStart = "chat_response_stream_start",
  ChatResponseStreamComplete = "chat_response_stream_complete",
  ChatResponseError = "chat_response_error",
  ChatClientError = "chat_client_error",
  ChatSourceClick = "chat_source_click",
}

type AnalyticsProperties = Record<string, unknown> | undefined;

function getPosthog(): { capture: (event: string, props?: AnalyticsProperties) => void } | undefined {
  try {
    return (typeof window !== 'undefined'
      ? (window as unknown as { posthog?: { capture: (e: string, p?: AnalyticsProperties) => void } }).posthog
      : undefined);
  } catch {
    return undefined;
  }
}

// Buffer events until PostHog is ready
const buffer: Array<{ event: string; properties?: AnalyticsProperties }> = [];
let readyListenerAttached = false;

function flushBuffer(): void {
  const ph = getPosthog();
  if (!ph || buffer.length === 0) return;
  try {
    for (const item of buffer.splice(0)) {
      ph.capture(item.event, item.properties);
    }
  } catch {
    // ignore
  }
}

export function capture(event: AnalyticsEvent | string, properties?: AnalyticsProperties): void {
  const ph = getPosthog();
  if (ph) {
    try {
      ph.capture(String(event), properties);
    } catch {
      // ignore
    }
    return;
  }
  // Not ready: buffer and listen for readiness
  buffer.push({ event: String(event), properties });
  if (typeof window !== 'undefined' && !readyListenerAttached) {
    readyListenerAttached = true;
    try {
      window.addEventListener('posthog:ready', flushBuffer, { once: false });
      // Also try flush after a short delay in case init already happened
      setTimeout(flushBuffer, 1000);
    } catch {
      // ignore
    }
  }
}


