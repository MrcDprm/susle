import { cookies, headers } from 'next/headers'
import { OWNER_KEY_PATTERN, TREE_ID_PATTERN } from './ids'

const PREFIX = '__Host-s-'
// Tarayıcılar çerez ömrünü 400 günle sınırlıyor; uzun vadeli anahtar sahip linkidir.
const MAX_AGE = 60 * 60 * 24 * 400

export function ownerCookieName(treeId: string): string {
  return `${PREFIX}${treeId}`
}

export const ownerCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE,
}

export async function readOwnerKey(treeId: string): Promise<string | null> {
  const value = (await cookies()).get(ownerCookieName(treeId))?.value
  return value && OWNER_KEY_PATTERN.test(value) ? value : null
}

export async function setOwnerCookie(treeId: string, ownerKey: string): Promise<void> {
  ;(await cookies()).set(ownerCookieName(treeId), ownerKey, ownerCookieOptions)
}

// __Host- çerezi Secure olmadan silinemez; delete() yerine süresi geçmiş bir kopya yazılır.
export async function clearOwnerCookie(treeId: string): Promise<void> {
  ;(await cookies()).set(ownerCookieName(treeId), '', { ...ownerCookieOptions, maxAge: 0 })
}

export async function ownedTreeKeys(): Promise<{ id: string; key: string }[]> {
  return (await cookies())
    .getAll()
    .filter((c) => c.name.startsWith(PREFIX))
    .map((c) => ({ id: c.name.slice(PREFIX.length), key: c.value }))
    .filter((c) => TREE_ID_PATTERN.test(c.id) && OWNER_KEY_PATTERN.test(c.key))
    .slice(0, 10)
}

// Vercel istemci adresini x-real-ip ve x-forwarded-for başlıklarına kendisi yazar.
export async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0'
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://susle.miracdeprem.com').replace(/\/$/, '')
}
