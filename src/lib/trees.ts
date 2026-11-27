import { randomUUID } from 'node:crypto'
import { and, asc, count, eq, sql } from 'drizzle-orm'
import { rowsOf, type Db } from './db/client'
import { ornaments, trees } from './db/schema'
import { newOwnerKey, newTreeId, sameHash, sha256 } from './ids'
import { isRevealed, revealAtFor } from './reveal'

export const PAGE_SIZE = 24
export const MAX_ORNAMENTS = PAGE_SIZE * 20

export type Tree = typeof trees.$inferSelect

export type OrnamentView = {
  id: string
  kind: number
  authorName: string | null
  isPublic: boolean
  // Açılıştan önce herkes için, açılıştan sonra sahip olmayanlar için gizli mesajlarda null.
  body: string | null
  createdAt: string
}

export async function createTree(
  db: Db,
  input: { name: string; style: number; lang: 'tr' | 'en' },
  now = new Date(),
): Promise<{ id: string; ownerKey: string }> {
  const ownerKey = newOwnerKey()
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = newTreeId()
    try {
      await db.insert(trees).values({
        id,
        name: input.name,
        style: input.style,
        lang: input.lang,
        ownerKeyHash: sha256(ownerKey),
        revealAt: revealAtFor(now),
        createdAt: now,
      })
      return { id, ownerKey }
    } catch (error) {
      // 31^10 olasılıkta çakışma neredeyse imkansız; yine de yeni kimlikle bir daha denenir.
      if (!isUniqueViolation(error) || attempt === 2) throw error
    }
  }
  throw new Error('unreachable')
}

export async function getTree(db: Db, id: string): Promise<Tree | null> {
  const rows = await db.select().from(trees).where(eq(trees.id, id)).limit(1)
  return rows[0] ?? null
}

export async function findTreeByOwnerKey(db: Db, ownerKey: string): Promise<Tree | null> {
  const rows = await db.select().from(trees).where(eq(trees.ownerKeyHash, sha256(ownerKey))).limit(1)
  return rows[0] ?? null
}

export function isOwner(tree: Tree, ownerKey: string | undefined | null): boolean {
  return !!ownerKey && sameHash(sha256(ownerKey), tree.ownerKeyHash)
}

export async function countOrnaments(db: Db, treeId: string): Promise<number> {
  const rows = await db.select({ n: count() }).from(ornaments).where(eq(ornaments.treeId, treeId))
  return Number(rows[0]?.n ?? 0)
}

// Kilit burada: açılıştan önce mesaj metni sorguya hiç girmez, açılıştan sonra
// sahip olmayan biri yalnızca herkese açık mesajların metnini alır.
export async function listOrnaments(
  db: Db,
  tree: Tree,
  opts: { owner: boolean; now?: Date; page?: number; all?: boolean },
): Promise<OrnamentView[]> {
  const revealed = isRevealed(tree.revealAt, opts.now ?? new Date())
  const body = !revealed
    ? sql<string | null>`NULL`
    : opts.owner
      ? sql<string | null>`${ornaments.body}`
      : sql<string | null>`CASE WHEN ${ornaments.isPublic} THEN ${ornaments.body} END`

  const query = db
    .select({
      id: ornaments.id,
      kind: ornaments.kind,
      authorName: ornaments.authorName,
      isPublic: ornaments.isPublic,
      body,
      createdAt: ornaments.createdAt,
    })
    .from(ornaments)
    .where(eq(ornaments.treeId, tree.id))
    .orderBy(asc(ornaments.slot))

  const rows = opts.all
    ? await query.limit(MAX_ORNAMENTS)
    : await query.limit(PAGE_SIZE).offset(Math.max(0, (opts.page ?? 0) * PAGE_SIZE))

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    authorName: r.authorName,
    isPublic: r.isPublic,
    body: r.body ?? null,
    createdAt: new Date(r.createdAt).toISOString(),
  }))
}

export type HangResult = { ok: true; index: number } | { ok: false; reason: 'missing' | 'closed' | 'revealed' | 'full' }

export async function hangOrnament(
  db: Db,
  input: { treeId: string; kind: number; authorName: string | null; body: string; isPublic: boolean; ipHash: string },
  now = new Date(),
): Promise<HangResult> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      // Ağaç açık mı, kilit tarihi geçmedi mi, dolu mu: hepsi tek komutta kontrol edilir.
      const result = await db.execute(sql`
        INSERT INTO ornaments (id, tree_id, slot, kind, author_name, body, is_public, ip_hash, created_at)
        SELECT ${randomUUID()}, t.id,
          (SELECT COALESCE(MAX(o.slot) + 1, 0) FROM ornaments o WHERE o.tree_id = t.id),
          ${input.kind}, ${input.authorName}, ${input.body}, ${input.isPublic}, ${input.ipHash}, ${now.toISOString()}
        FROM trees t
        WHERE t.id = ${input.treeId}
          AND t.accepting
          AND t.reveal_at > ${now.toISOString()}
          AND (SELECT COUNT(*) FROM ornaments o WHERE o.tree_id = t.id) < ${MAX_ORNAMENTS}
        RETURNING slot
      `)
      if (rowsOf<{ slot: number }>(result).length > 0) {
        return { ok: true, index: (await countOrnaments(db, input.treeId)) - 1 }
      }
      const tree = await getTree(db, input.treeId)
      if (!tree) return { ok: false, reason: 'missing' }
      if (isRevealed(tree.revealAt, now)) return { ok: false, reason: 'revealed' }
      if (!tree.accepting) return { ok: false, reason: 'closed' }
      return { ok: false, reason: 'full' }
    } catch (error) {
      // Aynı anda iki süs aynı yuvayı aldıysa biri yeniden dener.
      if (!isUniqueViolation(error) || attempt === 3) throw error
    }
  }
  throw new Error('unreachable')
}

export async function renameTree(db: Db, treeId: string, name: string): Promise<void> {
  await db.update(trees).set({ name }).where(eq(trees.id, treeId))
}

export async function setAccepting(db: Db, treeId: string, accepting: boolean): Promise<void> {
  await db.update(trees).set({ accepting }).where(eq(trees.id, treeId))
}

export async function deleteOrnament(db: Db, treeId: string, ornamentId: string): Promise<boolean> {
  const rows = await db
    .delete(ornaments)
    .where(and(eq(ornaments.treeId, treeId), eq(ornaments.id, ornamentId)))
    .returning({ id: ornaments.id })
  return rows.length > 0
}

export async function deleteTree(db: Db, treeId: string): Promise<void> {
  await db.delete(trees).where(eq(trees.id, treeId))
}

function isUniqueViolation(error: unknown): boolean {
  for (let e: unknown = error, depth = 0; e && depth < 4; depth++) {
    if (typeof e === 'object' && 'code' in e && (e as { code: unknown }).code === '23505') return true
    e = typeof e === 'object' && 'cause' in e ? (e as { cause: unknown }).cause : undefined
  }
  return false
}
