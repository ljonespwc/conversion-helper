import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verify Layercode webhook signature
 *
 * Layercode sends a `layercode-signature` header in the format:
 * t=timestamp,v1=signature
 *
 * To verify:
 * 1. Extract timestamp and signature from header
 * 2. Reconstruct signed payload: timestamp + "." + request_body
 * 3. Compute HMAC-SHA256 of signed payload using webhook secret
 * 4. Compare computed signature with v1 signature (timing-safe)
 * 5. Check timestamp is recent (within 5 minutes) to prevent replay attacks
 *
 * @param signature - The layercode-signature header value
 * @param body - The raw request body (string)
 * @param secret - The webhook secret from Layercode dashboard
 * @returns true if signature is valid and timestamp is recent
 */
export function verifyLayercodeWebhook(
  signature: string | null,
  body: string,
  secret: string
): { valid: boolean; error?: string } {
  // Check if signature header exists
  if (!signature) {
    return { valid: false, error: 'Missing layercode-signature header' }
  }

  // Parse signature header: t=timestamp,v1=signature
  const parts = signature.split(',')
  let timestamp: string | null = null
  let expectedSignature: string | null = null

  for (const part of parts) {
    const [key, value] = part.split('=')
    if (key === 't') {
      timestamp = value
    } else if (key === 'v1') {
      expectedSignature = value
    }
  }

  if (!timestamp || !expectedSignature) {
    return { valid: false, error: 'Invalid signature format' }
  }

  // Check timestamp is recent (within 5 minutes) to prevent replay attacks
  const now = Math.floor(Date.now() / 1000)
  const requestTime = parseInt(timestamp, 10)
  const timeDiff = Math.abs(now - requestTime)

  if (timeDiff > 300) { // 5 minutes = 300 seconds
    return { valid: false, error: 'Signature timestamp too old (replay attack?)' }
  }

  // Reconstruct the signed payload: timestamp + "." + request_body
  const signedPayload = `${timestamp}.${body}`

  // Compute HMAC-SHA256 signature
  const computedSignature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  // Timing-safe comparison to prevent timing attacks
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')
    const computedBuffer = Buffer.from(computedSignature, 'hex')

    if (expectedBuffer.length !== computedBuffer.length) {
      return { valid: false, error: 'Signature length mismatch' }
    }

    const isValid = timingSafeEqual(expectedBuffer, computedBuffer)

    if (!isValid) {
      return { valid: false, error: 'Signature verification failed' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Signature comparison error' }
  }
}
