'use server'

import { z } from 'zod'
import { getDb } from '@/lib/db/client'
import { hashIp } from '@/lib/ids'
import { LIMITS, hit } from '@/lib/rate-limit'
import { clearOwnerCookie, clientIp, readOwnerKey, setOwnerCookie } from '@/lib/server'
import * as repo from '@/lib/trees'
import { verifyTurnstile } from '@/lib/turnstile'
import { createTreeSchema, customizeSchema, hangOrnamentSchema, treeIdSchema } from '@/lib/validation'

type Fail<E extends string> = { ok: false; error: E }

export type CreateTreeResult = { ok: true; id: string; ownerKey: string } | Fail<'name' | 'rate' | 'generic'>

export async function createTreeAction(input: unknown): Promise<CreateTreeResult> {
  const parsed = createTreeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'name' }
  try {
    const db = await getDb()
    const ipHash = hashIp(await clientIp())
    if (!(await hit(db, `tree:${ipHash}`, LIMITS.tree))) return { ok: false, error: 'rate' }
    const { id, ownerKey } = await repo.createTree(db, parsed.data)
    await setOwnerCookie(id, ownerKey)
    return { ok: true, id, ownerKey }
  } catch (error) {
    console.error('createTree', error)
    return { ok: false, error: 'generic' }
  }
}

export type HangResult =
  | { ok: true; index: number; id: string }
  | Fail<'invalid' | 'bot' | 'rate' | 'closed' | 'revealed' | 'full' | 'missing' | 'generic'>

export async function hangOrnamentAction(input: unknown): Promise<HangResult> {
  const parsed = hangOrnamentSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  const { token, ...data } = parsed.data
  try {
    const db = await getDb()
    const ip = await clientIp()
    const ipHash = hashIp(ip)
    if (!(await hit(db, `ornament:${ipHash}`, LIMITS.ornament))) return { ok: false, error: 'rate' }
    if (!(await verifyTurnstile(token, ip))) return { ok: false, error: 'bot' }
    const result = await repo.hangOrnament(db, { ...data, ipHash })
    return result.ok ? result : { ok: false, error: result.reason }
  } catch (error) {
    console.error('hangOrnament', error)
    return { ok: false, error: 'generic' }
  }
}

export type OwnerResult = { ok: true } | Fail<'forbidden' | 'invalid' | 'generic'>

// Her sahip işleminde çerezdeki anahtar sunucuda yeniden doğrulanır.
async function asOwner(treeId: unknown, run: (db: Awaited<ReturnType<typeof getDb>>, id: string) => Promise<void>): Promise<OwnerResult> {
  const id = treeIdSchema.safeParse(treeId)
  if (!id.success) return { ok: false, error: 'invalid' }
  try {
    const db = await getDb()
    const tree = await repo.getTree(db, id.data)
    if (!tree || !repo.isOwner(tree, await readOwnerKey(id.data))) return { ok: false, error: 'forbidden' }
    await run(db, id.data)
    return { ok: true }
  } catch (error) {
    console.error('ownerAction', error)
    return { ok: false, error: 'generic' }
  }
}

export async function customizeTreeAction(treeId: unknown, input: unknown): Promise<OwnerResult> {
  const parsed = customizeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  return asOwner(treeId, (db, id) => repo.updateLook(db, id, parsed.data))
}

export async function renameTreeAction(treeId: unknown, name: unknown): Promise<OwnerResult> {
  const parsed = createTreeSchema.shape.name.safeParse(name)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  return asOwner(treeId, (db, id) => repo.renameTree(db, id, parsed.data))
}

export async function setAcceptingAction(treeId: unknown, accepting: unknown): Promise<OwnerResult> {
  const parsed = z.boolean().safeParse(accepting)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  return asOwner(treeId, (db, id) => repo.setAccepting(db, id, parsed.data))
}

export async function deleteOrnamentAction(treeId: unknown, ornamentId: unknown): Promise<OwnerResult> {
  const parsed = z.uuid().safeParse(ornamentId)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  return asOwner(treeId, async (db, id) => {
    await repo.deleteOrnament(db, id, parsed.data)
  })
}

export async function deleteTreeAction(treeId: unknown): Promise<OwnerResult> {
  return asOwner(treeId, async (db, id) => {
    await repo.deleteTree(db, id)
    await clearOwnerCookie(id)
  })
}
