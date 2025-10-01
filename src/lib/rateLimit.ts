import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 30 requests per 5 minutes per unique client key (same for dev and prod)
const WINDOW = "5 m";
const LIMIT = 30;

let ratelimit: Ratelimit | null = null;
const isProduction = process.env.NODE_ENV === 'production';
let warnedLocalInProd = false;

export function getRateLimiter(): Ratelimit | null {
  try {
    if (ratelimit) return ratelimit;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      // Degrade gracefully in any environment. We'll use local fallback in the route.
      // In production this is not ideal, so log prominently.
      console.warn('[rate-limit] Redis env not configured. Falling back to local in-memory limiter.');
      return null; // route will use local fallback
    }
    
    const redis = new Redis({ url, token });
    ratelimit = new Ratelimit({ 
      redis, 
      limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
      analytics: true, // Enable analytics for monitoring
    });
    
    console.info('[rate-limit] Redis-based rate limiting initialized successfully');
    return ratelimit;
  } catch (error) {
    console.error('[rate-limit] Failed to initialize Redis rate limiter:', error);
    // Graceful fallback; route will use local in-memory limiter
    return null;
  }
}

// Local in-memory fallback for dev (single instance only)
// WARNING: This is not secure for production as it can be bypassed by server restarts
const localBuckets = new Map<string, { count: number; resetAt: number }>();

export function localRateLimit(key: string): { success: boolean; remaining: number; reset: number } {
  // Warn once if we're using local limiter in production
  if (isProduction && !warnedLocalInProd) {
    console.warn('[rate-limit] Using local in-memory rate limiting in production (fallback). Configure Upstash to enable durable limits.');
    warnedLocalInProd = true;
  }
  const now = Date.now();
  // 5 minutes in ms, to match production
  const windowMs = 5 * 60 * 1000;
  const record = localBuckets.get(key);
  
  if (!record || record.resetAt < now) {
    localBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: LIMIT - 1, reset: now + windowMs };
  }
  
  if (record.count >= LIMIT) {
    // Log rate limit violations for monitoring
    console.warn(`[rate-limit] Client ${key} exceeded rate limit: ${record.count}/${LIMIT}`);
    return { success: false, remaining: 0, reset: record.resetAt };
  }
  
  record.count += 1;
  
  // Log when approaching rate limit (80% threshold)
  if (record.count >= LIMIT * 0.8) {
    console.info(`[rate-limit] Client ${key} approaching rate limit: ${record.count}/${LIMIT}`);
  }
  
  return { success: true, remaining: LIMIT - record.count, reset: record.resetAt };
}
