import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 10 requests per 5 minutes per unique client key
const WINDOW = "5 m";
const LIMIT = 10;

let ratelimit: Ratelimit | null = null;

export function getRateLimiter(): Ratelimit | null {
  try {
    if (ratelimit) return ratelimit;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null; // fallback to in-memory in route
    const redis = new Redis({ url, token });
    ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(LIMIT, WINDOW) });
    return ratelimit;
  } catch {
    return null;
  }
}

// Local in-memory fallback for dev (single instance only)
const localBuckets = new Map<string, { count: number; resetAt: number }>();

export function localRateLimit(key: string): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const record = localBuckets.get(key);
  if (!record || record.resetAt < now) {
    localBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: LIMIT - 1, reset: now + windowMs };
  }
  if (record.count >= LIMIT) {
    return { success: false, remaining: 0, reset: record.resetAt };
  }
  record.count += 1;
  return { success: true, remaining: LIMIT - record.count, reset: record.resetAt };
}


