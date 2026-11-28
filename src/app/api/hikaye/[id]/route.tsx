import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/lib/db/client'
import { hashIp, TREE_ID_PATTERN } from '@/lib/ids'
import { hit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/server'
import { messageStoryImage, treeStoryImage } from '@/lib/share-image'
import { countOrnaments, getPublicMessage, getTree, listOrnaments } from '@/lib/trees'

const messageId = z.uuid()

// Instagram hikayesi görseli. İçinde yalnızca herkese açık bilgiler var: ağacın adı, süsler, sayı.
// mesaj parametresiyle açılıştan sonra herkese açık tek bir mesajın görseli üretilir.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = req.nextUrl.searchParams.get('l') === 'en' ? 'en' : 'tr'
  if (!TREE_ID_PATTERN.test(id)) return new Response('Not found', { status: 404 })
  const db = await getDb()
  // Görsel üretmek işlemciyi yorar; aynı IP saatte en fazla 60 görsel ister.
  if (!(await hit(db, `img:${hashIp(await clientIp())}`, { max: 60, windowSec: 3600 }))) {
    return new Response('Too many requests', { status: 429 })
  }
  const tree = await getTree(db, id)
  if (!tree) return new Response('Not found', { status: 404 })
  const mesaj = req.nextUrl.searchParams.get('mesaj')
  if (mesaj !== null) {
    if (!messageId.safeParse(mesaj).success) return new Response('Not found', { status: 404 })
    const message = await getPublicMessage(db, tree, mesaj)
    if (!message) return new Response('Not found', { status: 404 })
    return messageStoryImage(tree, message, lang)
  }
  const ornaments = await listOrnaments(db, tree, { owner: false })
  return treeStoryImage(tree, ornaments.map((o) => o.kind), await countOrnaments(db, id), lang)
}
