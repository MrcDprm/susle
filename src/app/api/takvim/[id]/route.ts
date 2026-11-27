import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db/client'
import { dict, localePath } from '@/lib/i18n'
import { reminderIcs } from '@/lib/ics'
import { TREE_ID_PATTERN } from '@/lib/ids'
import { siteUrl } from '@/lib/server'
import { getTree } from '@/lib/trees'

// 1 Ocak 00:00'da alarm çalan takvim etkinliği. Telefon dosyayı açınca takvime eklemeyi önerir.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = req.nextUrl.searchParams.get('l') === 'en' ? 'en' : 'tr'
  if (!TREE_ID_PATTERN.test(id)) return new Response('Not found', { status: 404 })
  const tree = await getTree(await getDb(), id)
  if (!tree) return new Response('Not found', { status: 404 })
  const t = dict(lang)
  const ics = reminderIcs({
    uid: tree.id,
    start: tree.revealAt,
    title: t.reminder.title(tree.name),
    body: t.reminder.body,
    url: `${siteUrl()}${localePath(lang, `/a/${tree.id}`)}`,
  })
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="susle-1-ocak.ics"',
      'Cache-Control': 'private, max-age=60',
    },
  })
}
