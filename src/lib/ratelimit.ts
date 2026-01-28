import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const isDev = process.env.NODE_ENV === 'development'

// Mock rate limiter for development (no network calls)
const mockRatelimit = {
  limit: async () => ({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 3600000,
    pending: Promise.resolve(),
  }),
}

// Initialize Redis client only in production
const redis = isDev ? null : Redis.fromEnv()

// Rate limit configurations for different endpoint types
export const rateLimits = {
  // Email escalation - prevent email spam
  // 3 escalations per IP per day
  escalation: isDev ? mockRatelimit : new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    analytics: true,
    prefix: '@easyask/ratelimit/escalation',
  }),

  // Feedback submission - prevent feedback spam
  // 10 submissions per IP per hour
  feedback: isDev ? mockRatelimit : new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: '@easyask/ratelimit/feedback',
  }),

  // Early access signup - prevent email spam
  // 3 signups per IP per hour
  earlyAccess: isDev ? mockRatelimit : new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: '@easyask/ratelimit/early-access',
  }),

  // Chat messages - prevent query spam
  // 50 requests per IP per hour
  chat: isDev ? mockRatelimit : new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: '@easyask/ratelimit/chat',
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
