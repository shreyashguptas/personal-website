import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 30 requests per 5 minutes per unique client key (same for dev and prod)
const WINDOW = "5 m";
const LIMIT = 30;

let ratelimit: Ratelimit | null = null;
const isProduction = process.env.NODE_ENV === 'production';

export function getRateLimiter(): Ratelimit | null {
  try {
    if (ratelimit) return ratelimit;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      if (isProduction) {
        console.error('[rate-limit] Redis not configured in production - this is a security risk');
        throw new Error('Redis rate limiting is required in production');
      }
      console.info('[rate-limit] Redis not configured, falling back to local rate limiting (dev only)');
      return null; // fallback to in-memory in route
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
    if (isProduction) {
      console.error('[rate-limit] Failed to initialize Redis rate limiter in production:', error);
      throw error; // Fail fast in production
    }
    console.error('[rate-limit] Failed to initialize Redis rate limiter:', error);
    return null;
  }
}

// Local in-memory fallback for dev (single instance only)
// WARNING: This is not secure for production as it can be bypassed by server restarts
const localBuckets = new Map<string, { count: number; resetAt: number }>();

export function localRateLimit(key: string): { success: boolean; remaining: number; reset: number } {
  // Prevent use in production
  if (isProduction) {
    console.error('[rate-limit] Local rate limiting attempted in production - this is a security risk');
    throw new Error('Local rate limiting is not allowed in production');
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
