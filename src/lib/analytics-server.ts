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
  userAgent?: string;
  clientIp?: string;
  conversationLength?: number;
  userMessageLength?: number;
}): Promise<void> {
  const ph = getPosthogServer();
  if (!ph) return;
  try {
    // Analyze the user's question for intent
    const userMessage = props.inputMessages?.find(m => m.role === 'user')?.content || '';
    const questionType = analyzeQuestionType(userMessage);
    const hasCodeTerms = /\b(code|programming|python|javascript|react|api|function|class|import|export)\b/i.test(userMessage);
    
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
        // Enhanced properties
        user_agent: props.userAgent,
        client_ip: props.clientIp,
        conversation_length: props.conversationLength,
        user_message_length: props.userMessageLength,
        question_type: questionType,
        has_code_terms: hasCodeTerms,
        response_latency_bucket: props.latencyMs < 1000 ? 'fast' : props.latencyMs < 3000 ? 'medium' : 'slow'
      },
    });
  } catch {
    // ignore
  }
}

function analyzeQuestionType(message: string): string {
  const msg = message.toLowerCase();
  if (/\b(latest|recent|newest|last)\b.*\b(project|work|built)\b/i.test(msg)) return 'latest_project';
  if (/\b(latest|recent|newest|last)\b.*\b(blog|post|article|wrote)\b/i.test(msg)) return 'latest_post';
  if (/\b(email|contact|reach|how to contact)\b/i.test(msg)) return 'contact';
  if (/\b(resume|cv|experience|work history|background)\b/i.test(msg)) return 'resume';
  if (/\b(project|projects)\b/i.test(msg)) return 'projects';
  if (/\b(blog|post|posts|article|wrote|writing)\b/i.test(msg)) return 'blog';
  if (/\b(skill|skills|technology|tech|programming|language)\b/i.test(msg)) return 'skills';
  if (/\?/i.test(msg)) return 'question';
  return 'general';
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


