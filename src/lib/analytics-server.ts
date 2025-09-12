import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

function getServerKey(): string | undefined {
  return process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

function getHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
}

export function getPosthogServer(): PostHog | null {
  if (posthogClient) return posthogClient;
  const key = getServerKey();
  if (!key) return null;
  try {
    posthogClient = new PostHog(key, { host: getHost(), flushAt: 1, flushInterval: 1000 });
    return posthogClient;
  } catch {
    return null;
  }
}

export async function captureAiGeneration(props: {
  traceId?: string;
  distinctId?: string;
  model: string;
  latencyMs: number;
  inputMessages?: Array<{ role: string; content: string }>;
  outputChoices?: Array<{ content?: string; finish_reason?: string }>;
  inputTokens?: number;
  outputTokens?: number;
  totalCostUsd?: number;
  tools?: string[];
}): Promise<void> {
  const ph = getPosthogServer();
  if (!ph) return;
  try {
    await ph.captureImmediate({
      distinctId: props.distinctId || 'anonymous',
      event: '$ai_generation',
      properties: {
        $ai_model: props.model,
        $ai_latency: props.latencyMs / 1000,
        $ai_input: props.inputMessages,
        $ai_output_choices: props.outputChoices,
        $ai_input_tokens: props.inputTokens,
        $ai_output_tokens: props.outputTokens,
        $ai_total_cost_usd: props.totalCostUsd,
        $ai_tools: props.tools,
        $ai_trace_id: props.traceId,
      },
    });
  } catch {
    // ignore
  }
}

export async function captureAiEmbedding(props: {
  traceId?: string;
  distinctId?: string;
  model: string;
  latencyMs: number;
  input?: string | string[];
}): Promise<void> {
  const ph = getPosthogServer();
  if (!ph) return;
  try {
    await ph.captureImmediate({
      distinctId: props.distinctId || 'anonymous',
      event: '$ai_embedding',
      properties: {
        $ai_model: props.model,
        $ai_latency: props.latencyMs / 1000,
        $ai_input: props.input,
        $ai_trace_id: props.traceId,
      },
    });
  } catch {
    // ignore
  }
}

export async function flushPosthog(): Promise<void> {
  const ph = getPosthogServer();
  if (!ph) return;
  try {
    // Graceful shutdown within 2s to flush queue
    await ph._shutdown?.(2000);
  } catch {
    // ignore
    void 0;
  }
}


