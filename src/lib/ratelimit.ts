import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client from environment variables
// Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv()

// Rate limit configurations for different endpoint types
export const rateLimits = {
  // Layercode session creation - prevent spam session generation
  // 50 sessions per IP per hour
  layercodeAuthorize: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: '@easyask/ratelimit/layercode-authorize',
  }),

  // Layercode webhook - prevent fake webhook spam
  // 100 requests per IP per hour (covers normal conversation flow)
  layercodeWebhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    analytics: true,
    prefix: '@easyask/ratelimit/layercode-webhook',
  }),

  // Email escalation - prevent email spam
  // 3 escalations per IP per day
  escalation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    analytics: true,
    prefix: '@easyask/ratelimit/escalation',
  }),

  // Feedback submission - prevent feedback spam
  // 10 submissions per IP per hour
  feedback: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: '@easyask/ratelimit/feedback',
  }),

  // Page assistant queries - prevent query spam
  // 30 requests per IP per hour
  pageAssistant: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 h'),
    analytics: true,
    prefix: '@easyask/ratelimit/page-assistant',
  }),
}

/**
 * Check rate limit for an identifier (IP address or user ID)
 * Returns { success: boolean, limit, remaining, reset }
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const result = await limiter.limit(identifier)
  return result
}

/**
 * Get IP address from request headers
 * Handles x-forwarded-for, x-real-ip, and falls back to 'anonymous'
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'anonymous'
}
