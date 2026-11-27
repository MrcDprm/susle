import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db/client'
import { TREE_ID_PATTERN } from '@/lib/ids'
import { countOrnaments } from '@/lib/trees'

// Açık sayfanın yeni süs gelip gelmediğine bakması için yalnızca süs sayısı döner.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!TREE_ID_PATTERN.test(id)) return Response.json({ error: 'not_found' }, { status: 404 })
  const count = await countOrnaments(await getDb(), id)
  return Response.json({ count }, { headers: { 'Cache-Control': 'no-store' } })
}
