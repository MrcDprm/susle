import { NextResponse, type NextRequest } from 'next/server'
import { getDb } from '@/lib/db/client'
import { localePath } from '@/lib/i18n'
import { hashIp, OWNER_KEY_PATTERN } from '@/lib/ids'
import { LIMITS, hit } from '@/lib/rate-limit'
import { clientIp, ownerCookieName, ownerCookieOptions, siteUrl } from '@/lib/server'
import { findTreeByOwnerKey } from '@/lib/trees'

// Sahip linki: anahtar doğruysa tarayıcıya sahip çerezi yazılır ve ağaca gidilir.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const home = new URL('/', siteUrl())
  if (!OWNER_KEY_PATTERN.test(key)) return NextResponse.redirect(home)

  const db = await getDb()
  // Anahtar tahmini denemelerine karşı aynı sınır ağaç açmadaki gibi IP başına uygulanır.
  if (!(await hit(db, `owner:${hashIp(await clientIp())}`, { max: 30, windowSec: LIMITS.tree.windowSec }))) {
    return new NextResponse('Too many requests', { status: 429 })
  }
  const tree = await findTreeByOwnerKey(db, key)
  if (!tree) return NextResponse.redirect(home)

  const res = NextResponse.redirect(new URL(localePath(tree.lang === 'en' ? 'en' : 'tr', `/a/${tree.id}`), siteUrl()))
  res.cookies.set(ownerCookieName(tree.id), key, ownerCookieOptions)
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('Cache-Control', 'no-store')
  return res
}
