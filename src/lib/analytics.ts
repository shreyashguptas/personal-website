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

export function capture(event: AnalyticsEvent | string, properties?: AnalyticsProperties): void {
  const ph = getPosthog();
  if (!ph) return;
  try {
    ph.capture(String(event), properties);
  } catch {
    // no-op
    void 0;
  }
}


