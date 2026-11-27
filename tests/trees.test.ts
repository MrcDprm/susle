import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Db } from '@/lib/db/client'
import { openLocalDb } from '@/lib/db/local'
import { LIMITS, hit } from '@/lib/rate-limit'
import {
  MAX_ORNAMENTS,
  PAGE_SIZE,
  countOrnaments,
  createTree,
  deleteOrnament,
  findTreeByOwnerKey,
  getTree,
  hangOrnament,
  isOwner,
  listOrnaments,
  setAccepting,
} from '@/lib/trees'
import { verifyTurnstile } from '@/lib/turnstile'

const created = new Date('2026-12-01T10:00:00Z')
const beforeReveal = new Date('2026-12-20T10:00:00Z')
const afterReveal = new Date('2027-01-01T09:00:00Z')

let db: Db

beforeEach(async () => {
  db = await openLocalDb()
})

async function treeWithMessages() {
  const { id, ownerKey } = await createTree(db, { name: 'Test', style: 0, lang: 'tr' }, created)
  const msg = { treeId: id, kind: 1, ipHash: 'h' }
  await hangOrnament(db, { ...msg, authorName: 'Ali', body: 'gizli mesaj', isPublic: false }, beforeReveal)
  await hangOrnament(db, { ...msg, authorName: null, body: 'açık mesaj', isPublic: true }, beforeReveal)
  const tree = (await getTree(db, id))!
  return { tree, ownerKey }
}

describe('sahiplik', () => {
  it('sahip anahtarı yalnızca kendi ağacını açar', async () => {
    const a = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    const b = await createTree(db, { name: 'B', style: 0, lang: 'tr' }, created)
    const treeA = (await getTree(db, a.id))!
    expect(isOwner(treeA, a.ownerKey)).toBe(true)
    expect(isOwner(treeA, b.ownerKey)).toBe(false)
    expect(isOwner(treeA, undefined)).toBe(false)
    expect(isOwner(treeA, '')).toBe(false)
    expect((await findTreeByOwnerKey(db, a.ownerKey))?.id).toBe(a.id)
    expect(await findTreeByOwnerKey(db, 'yanlis')).toBeNull()
  })

  it('veritabanında sahip anahtarının kendisi değil özeti durur', async () => {
    const { id, ownerKey } = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    const tree = (await getTree(db, id))!
    expect(tree.ownerKeyHash).not.toContain(ownerKey)
    expect(tree.ownerKeyHash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('kilit', () => {
  it('açılıştan önce kimse mesaj metnini alamaz, sahip de', async () => {
    const { tree } = await treeWithMessages()
    for (const owner of [true, false]) {
      const list = await listOrnaments(db, tree, { owner, now: beforeReveal })
      expect(list).toHaveLength(2)
      expect(list.every((o) => o.body === null)).toBe(true)
    }
  })

  it('açılıştan önce isimler görünür, boş isim anonim kalır', async () => {
    const { tree } = await treeWithMessages()
    const list = await listOrnaments(db, tree, { owner: false, now: beforeReveal })
    expect(list.map((o) => o.authorName)).toEqual(['Ali', null])
  })

  it('açılıştan sonra sahip hepsini, ziyaretçi yalnızca herkese açık olanı okur', async () => {
    const { tree } = await treeWithMessages()
    const owner = await listOrnaments(db, tree, { owner: true, now: afterReveal })
    expect(owner.map((o) => o.body)).toEqual(['gizli mesaj', 'açık mesaj'])
    const visitor = await listOrnaments(db, tree, { owner: false, now: afterReveal })
    expect(visitor.map((o) => o.body)).toEqual([null, 'açık mesaj'])
  })

  it('açılış anından sonra yeni süs asılamaz', async () => {
    const { tree } = await treeWithMessages()
    const r = await hangOrnament(
      db,
      { treeId: tree.id, kind: 0, authorName: null, body: 'geç', isPublic: false, ipHash: 'h' },
      afterReveal,
    )
    expect(r).toEqual({ ok: false, reason: 'revealed' })
  })
})

describe('süs asma', () => {
  const msg = { kind: 2, authorName: 'Can', body: 'selam', isPublic: false, ipHash: 'h' }

  it('olmayan ağaca süs asılamaz', async () => {
    expect(await hangOrnament(db, { ...msg, treeId: 'abcdefgh23' }, beforeReveal)).toEqual({
      ok: false,
      reason: 'missing',
    })
  })

  it('sahip kapattığında süs kabul edilmez, açınca yeniden edilir', async () => {
    const { id } = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    await setAccepting(db, id, false)
    expect(await hangOrnament(db, { ...msg, treeId: id }, beforeReveal)).toEqual({ ok: false, reason: 'closed' })
    await setAccepting(db, id, true)
    expect((await hangOrnament(db, { ...msg, treeId: id }, beforeReveal)).ok).toBe(true)
  })

  it('aynı anda asılan süsler farklı yuvalara düşer', async () => {
    const { id } = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    const results = await Promise.all(
      Array.from({ length: 8 }, () => hangOrnament(db, { ...msg, treeId: id }, beforeReveal)),
    )
    expect(results.every((r) => r.ok)).toBe(true)
    expect(await countOrnaments(db, id)).toBe(8)
  })

  it('ağaç dolunca yeni süs kabul edilmez ve sayfalar 24er süs döner', async () => {
    const { id } = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    for (let i = 0; i < MAX_ORNAMENTS; i++) {
      const r = await hangOrnament(db, { ...msg, treeId: id, body: `m${i}` }, beforeReveal)
      expect(r.ok).toBe(true)
    }
    expect(await hangOrnament(db, { ...msg, treeId: id }, beforeReveal)).toEqual({ ok: false, reason: 'full' })
    const tree = (await getTree(db, id))!
    const page2 = await listOrnaments(db, tree, { owner: true, now: afterReveal, page: 1 })
    expect(page2).toHaveLength(PAGE_SIZE)
    expect(page2[0].body).toBe(`m${PAGE_SIZE}`)
  }, 60000)

  it('süs yalnızca kendi ağacından silinir', async () => {
    const a = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    const b = await createTree(db, { name: 'B', style: 0, lang: 'tr' }, created)
    await hangOrnament(db, { ...msg, treeId: a.id }, beforeReveal)
    const [orn] = await listOrnaments(db, (await getTree(db, a.id))!, { owner: true, now: beforeReveal })
    expect(await deleteOrnament(db, b.id, orn.id)).toBe(false)
    expect(await deleteOrnament(db, a.id, orn.id)).toBe(true)
    expect(await countOrnaments(db, a.id)).toBe(0)
  })
})

describe('istek sınırı', () => {
  it('pencere içinde sınırı aşan isteği durdurur, pencere bitince sıfırlar', async () => {
    const t0 = new Date('2026-12-10T10:00:00Z')
    for (let i = 0; i < LIMITS.ornament.max; i++) {
      expect(await hit(db, 'o:ip', LIMITS.ornament, t0)).toBe(true)
    }
    expect(await hit(db, 'o:ip', LIMITS.ornament, t0)).toBe(false)
    expect(await hit(db, 'o:baska', LIMITS.ornament, t0)).toBe(true)
    const later = new Date(t0.getTime() + LIMITS.ornament.windowSec * 1000 + 1)
    expect(await hit(db, 'o:ip', LIMITS.ornament, later)).toBe(true)
  })

  it('aynı anda gelen istekler sınırı atlatamaz', async () => {
    const t0 = new Date('2026-12-10T10:00:00Z')
    const results = await Promise.all(Array.from({ length: 20 }, () => hit(db, 't:ip', LIMITS.tree, t0)))
    expect(results.filter(Boolean)).toHaveLength(LIMITS.tree.max)
  })
})

describe('Turnstile', () => {
  it('Cloudflare onaylamazsa, hata verirse ya da anahtar yoksa reddeder', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'gizli')
    const answer = (body: unknown, status = 200) =>
      vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch
    expect(await verifyTurnstile('t', null, answer({ success: true }))).toBe(true)
    expect(await verifyTurnstile('t', null, answer({ success: false }))).toBe(false)
    expect(await verifyTurnstile('t', null, answer({ success: 'true' }))).toBe(false)
    expect(await verifyTurnstile('t', null, answer({}, 500))).toBe(false)
    const broken = vi.fn(async () => {
      throw new Error('ağ yok')
    }) as unknown as typeof fetch
    expect(await verifyTurnstile('t', null, broken)).toBe(false)
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    expect(await verifyTurnstile('t', null, answer({ success: true }))).toBe(false)
    vi.unstubAllEnvs()
  })
})
