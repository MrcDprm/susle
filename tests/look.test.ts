import { beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '@/lib/db/client'
import { openLocalDb } from '@/lib/db/local'
import { DEFAULT_LOOK, growthLevel, lookSchema, nextGrowth, normalizeLook } from '@/lib/look'
import { createTree, getPublicMessage, getTree, hangOrnament, listOrnaments, lookOf, updateLook } from '@/lib/trees'
import { customizeSchema } from '@/lib/validation'

const created = new Date('2026-12-01T10:00:00Z')
const before = new Date('2026-12-20T10:00:00Z')
const after = new Date('2027-01-01T09:00:00Z')

describe('görünüm', () => {
  it('geçerli seçimleri kabul eder, sınır dışını ve bilinmeyen alanı reddeder', () => {
    expect(lookSchema.safeParse({ ...DEFAULT_LOOK, topper: 5, sky: 2 }).success).toBe(true)
    expect(lookSchema.safeParse({ ...DEFAULT_LOOK, topper: 6 }).success).toBe(false)
    expect(lookSchema.safeParse({ ...DEFAULT_LOOK, lights: -1 }).success).toBe(false)
    expect(lookSchema.safeParse({ ...DEFAULT_LOOK, music: 1.5 }).success).toBe(false)
    expect(lookSchema.safeParse({ ...DEFAULT_LOOK, renk: 'kirmizi' }).success).toBe(false)
    const { sky: _sky, ...eksik } = DEFAULT_LOOK
    expect(lookSchema.safeParse(eksik).success).toBe(false)
  })

  it('veritabanından gelen bozuk değeri varsayılana çevirir', () => {
    expect(normalizeLook(null)).toEqual(DEFAULT_LOOK)
    expect(normalizeLook({ topper: 3, lights: 99, ribbon: 'x', scene: 2 })).toEqual({ ...DEFAULT_LOOK, topper: 3, scene: 2 })
  })

  it('notu tek satıra indirir, boşsa saklamaz, 80 karakteri geçmez', () => {
    const base = { style: 1, look: DEFAULT_LOOK }
    expect(customizeSchema.parse({ ...base, note: '  2026’yı birlikte\n geçirdiklerime ' }).note).toBe('2026’yı birlikte geçirdiklerime')
    expect(customizeSchema.parse({ ...base, note: '   ' }).note).toBeNull()
    expect(customizeSchema.safeParse({ ...base, note: 'a'.repeat(81) }).success).toBe(false)
    expect(customizeSchema.safeParse({ ...base, style: 6, note: '' }).success).toBe(false)
  })

  it('büyüme eşiklerini ve bir sonrakine kalan süsü hesaplar', () => {
    expect(growthLevel(0)).toBe(0)
    expect(growthLevel(9)).toBe(0)
    expect(growthLevel(10)).toBe(1)
    expect(growthLevel(25)).toBe(2)
    expect(growthLevel(80)).toBe(3)
    expect(nextGrowth(7)).toEqual({ at: 10, left: 3, level: 1 })
    expect(nextGrowth(24)).toEqual({ at: 25, left: 1, level: 2 })
    expect(nextGrowth(50)).toBeNull()
  })
})

describe('görünümün saklanması ve yılın mesajı', () => {
  let db: Db
  beforeEach(async () => {
    db = await openLocalDb()
  })

  it('yeni ağaç varsayılan görünümle başlar, sahip değiştirince saklanır', async () => {
    const { id } = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    expect(lookOf((await getTree(db, id))!)).toEqual(DEFAULT_LOOK)
    const look = { ...DEFAULT_LOOK, topper: 2, lights: 4, scene: 1, music: 2 }
    await updateLook(db, id, { style: 3, look, note: 'Sevdiklerime' })
    const tree = (await getTree(db, id))!
    expect(tree.style).toBe(3)
    expect(lookOf(tree)).toEqual(look)
    expect(tree.note).toBe('Sevdiklerime')
  })

  it('yılın mesajı yalnızca açılıştan sonra ve herkese açık mesajdan seçilir', async () => {
    const { id } = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    const msg = { treeId: id, kind: 3, ipHash: 'h', authorName: 'Ayşe' }
    const pub = await hangOrnament(db, { ...msg, body: 'açık', isPublic: true }, before)
    const priv = await hangOrnament(db, { ...msg, body: 'gizli', isPublic: false }, before)
    if (!pub.ok || !priv.ok) throw new Error('asılamadı')
    const tree = (await getTree(db, id))!
    expect(await getPublicMessage(db, tree, pub.id, before)).toBeNull()
    expect(await getPublicMessage(db, tree, pub.id, after)).toEqual({ kind: 3, authorName: 'Ayşe', body: 'açık' })
    expect(await getPublicMessage(db, tree, priv.id, after)).toBeNull()
    const other = await createTree(db, { name: 'B', style: 0, lang: 'tr' }, created)
    expect(await getPublicMessage(db, (await getTree(db, other.id))!, pub.id, after)).toBeNull()
  })

  it('süs asınca dönen kimlik ağaçtaki süsle aynıdır', async () => {
    const { id } = await createTree(db, { name: 'A', style: 0, lang: 'tr' }, created)
    const r = await hangOrnament(db, { treeId: id, kind: 1, ipHash: 'h', authorName: null, body: 'x', isPublic: false }, before)
    if (!r.ok) throw new Error('asılamadı')
    const [o] = await listOrnaments(db, (await getTree(db, id))!, { owner: true, now: before })
    expect(o.id).toBe(r.id)
  })
})
