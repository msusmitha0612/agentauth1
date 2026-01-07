import crypto from 'crypto'

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomPart = crypto.randomBytes(24).toString('base64url')
  const key = `aa_live_${randomPart}`
  const prefix = 'aa_live_'
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  
  return { key, prefix, hash }
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export function maskApiKey(key: string): string {
  // Show: aa_live_xxxx...xxxx (first 12 + last 4)
  if (key.length <= 16) return key
  return `${key.slice(0, 12)}${'•'.repeat(20)}${key.slice(-4)}`
}

export function isValidApiKeyFormat(key: string): boolean {
  return /^aa_live_[A-Za-z0-9_-]{32}$/.test(key)
}
