import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { OrnamentIcon } from '@/components/Art'
import { PrintButton } from '@/components/PrintButton'
import { getDb } from '@/lib/db/client'
import { dict, isLang, localePath } from '@/lib/i18n'
import { TREE_ID_PATTERN } from '@/lib/ids'
import { isRevealed, revealYear } from '@/lib/reveal'
import { readOwnerKey } from '@/lib/server'
import { getTree, isOwner, listOrnaments } from '@/lib/trees'

type Params = Promise<{ lang: string; id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params
  const robots = { index: false, follow: false }
  if (!isLang(lang) || !TREE_ID_PATTERN.test(id)) return { robots }
  const tree = await getTree(await getDb(), id)
  return { title: tree ? `${dict(lang).show.keepsake}: ${tree.name}` : undefined, robots }
}

// Anı sayfası: açılıştan sonra bütün mesajlar tek sayfada. Sahip hepsini, ziyaretçi herkese açık
// olanları görür. Tarayıcının yazdır penceresinden PDF olarak da kaydedilir.
export default async function KeepsakePage({ params }: { params: Params }) {
  const { lang, id } = await params
  if (!isLang(lang) || !TREE_ID_PATTERN.test(id)) notFound()
  const db = await getDb()
  const tree = await getTree(db, id)
  if (!tree) notFound()
  const now = new Date()
  if (!isRevealed(tree.revealAt, now)) redirect(localePath(lang, `/a/${tree.id}`))

  const t = dict(lang)
  const owner = isOwner(tree, await readOwnerKey(tree.id))
  const messages = (await listOrnaments(db, tree, { owner, now, all: true })).filter((o) => o.body !== null)

  return (
    <main className="keepsake">
      <div className="keepsake-inner">
        <h1>{t.keepsake.title(tree.name, revealYear(tree.revealAt))}</h1>
        {tree.note && <p className="keepsake-lead">{tree.note}</p>}
        <p className="keepsake-lead">{t.keepsake.lead(messages.length)}</p>
        <div className="keepsake-actions">
          <PrintButton label={t.keepsake.print} />
          <Link className="btn-small" href={localePath(lang, `/a/${tree.id}`)}>
            {t.keepsake.back}
          </Link>
        </div>
        {messages.length === 0 ? (
          <p>{t.keepsake.empty}</p>
        ) : (
          <ul className="keepsake-list">
            {messages.map((m) => (
              <li key={m.id} className="tag">
                <span className="tag-icon">
                  <OrnamentIcon kind={m.kind} />
                </span>
                <p className="tag-body">{m.body}</p>
                <p className="tag-name">{m.authorName ?? t.card.anonymous}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
