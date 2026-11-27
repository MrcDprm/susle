import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

// Karışan harfler (0/o, 1/l/i) yok; link elle yazılsa da sorun çıkmasın.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
export const TREE_ID_LENGTH = 10
export const TREE_ID_PATTERN = /^[a-hjkmnp-z2-9]{10}$/
export const OWNER_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function newTreeId(): string {
  let id = ''
  while (id.length < TREE_ID_LENGTH) {
    for (const byte of randomBytes(16)) {
      // 248 = 31 * 8: bu sınırın üstündeki baytlar atılır, her harf eşit olasılıkla gelir.
      if (byte < 248 && id.length < TREE_ID_LENGTH) id += ALPHABET[byte % ALPHABET.length]
    }
  }
  return id
}

export function newOwnerKey(): string {
  return randomBytes(32).toString('base64url')
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function sameHash(a: string, b: string): boolean {
  const x = Buffer.from(a, 'hex')
  const y = Buffer.from(b, 'hex')
  return x.length === y.length && timingSafeEqual(x, y)
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT
  if (!salt && process.env.NODE_ENV === 'production') throw new Error('IP_HASH_SALT tanımlı değil.')
  return sha256(`${salt ?? 'yerel'}:${ip}`)
}
