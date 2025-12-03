import { randomBytes } from 'crypto'

/**
 * Generate a new publishable API key
 * Format: pk_live_ + 48 hex chars (24 random bytes)
 */
export function generatePublishableKey(): string {
  const randomPart = randomBytes(24).toString('hex')
  return `pk_live_${randomPart}`
}

/**
 * Validate publishable key format
 * Must be: pk_live_ followed by exactly 48 hex characters
 */
export function isValidKeyFormat(key: string | null | undefined): boolean {
  if (!key) return false
  return /^pk_live_[a-f0-9]{48}$/.test(key)
}

/**
 * Mask a key for display (show first 12 and last 4 chars)
 * Example: pk_live_a1b2...w3x4
 */
export function maskKey(key: string): string {
  if (key.length < 20) return key
  return `${key.slice(0, 12)}...${key.slice(-4)}`
}
