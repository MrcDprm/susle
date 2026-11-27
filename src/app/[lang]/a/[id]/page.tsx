import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Header } from '@/components/Header'
import { TreeScreen } from '@/components/TreeScreen'
import { getDb } from '@/lib/db/client'
import { dict, isLang, localePath } from '@/lib/i18n'
import { TREE_ID_PATTERN } from '@/lib/ids'
import { isRevealed, revealYear } from '@/lib/reveal'
import { readOwnerKey, siteUrl } from '@/lib/server'
import { countOrnaments, getTree, isOwner, listOrnaments, MAX_ORNAMENTS, PAGE_SIZE } from '@/lib/trees'

type Params = Promise<{ lang: string; id: string }>

const loadTree = cache(async (id: string) => {
  if (!TREE_ID_PATTERN.test(id)) return null
  return getTree(await getDb(), id)
})

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params
  if (!isLang(lang)) return {}
  const tree = await loadTree(id)
  if (!tree) return { robots: { index: false } }
  const t = dict(lang)
  const title = `${tree.name} | Süsle`
  const image = `/api/og/${tree.id}?l=${lang}`
  return {
    title,
    description: t.meta.treeDescription,
    // Ağaç sayfalarında kişilerin adları ve mesajları var; arama motorlarına kapalı.
    robots: { index: false, follow: false },
    alternates: { canonical: localePath(lang, `/a/${tree.id}`) },
    openGraph: { title, description: t.meta.treeDescription, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description: t.meta.treeDescription, images: [image] },
  }
}

export default async function TreePage({ params, searchParams }: { params: Params; searchParams: Promise<{ dal?: string; yeni?: string }> }) {
  const { lang, id } = await params
  if (!isLang(lang)) notFound()
  const tree = await loadTree(id)
  if (!tree) notFound()

  const db = await getDb()
  const now = new Date()
  const ownerKey = await readOwnerKey(tree.id)
  const owner = isOwner(tree, ownerKey)
  const revealed = isRevealed(tree.revealAt, now)
  const total = await countOrnaments(db, tree.id)
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const query = await searchParams
  const requested = Number.parseInt(query.dal ?? '1', 10)
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), pageCount) - 1 : 0

  const ornaments = await listOrnaments(db, tree, { owner, now, page })
  const messages = revealed ? (await listOrnaments(db, tree, { owner, now, all: true })).filter((o) => o.body !== null) : []
  const site = siteUrl()
  const treeLang = tree.lang === 'en' ? 'en' : 'tr'

  return (
    <>
      <Header lang={lang} otherPath={localePath(lang === 'tr' ? 'en' : 'tr', `/a/${tree.id}`)} />
      <TreeScreen
        lang={lang}
        tree={{
          id: tree.id,
          name: tree.name,
          style: tree.style,
          accepting: tree.accepting,
          revealAt: tree.revealAt.toISOString(),
          year: revealYear(tree.revealAt),
        }}
        nowMs={now.getTime()}
        owner={owner}
        ownerUrl={owner && ownerKey ? `${site}/y/${ownerKey}` : null}
        shareUrl={`${site}${localePath(treeLang, `/a/${tree.id}`)}`}
        ornaments={ornaments}
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={total}
        full={total >= MAX_ORNAMENTS}
        revealed={revealed}
        messages={messages}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''}
        welcome={owner && query.yeni === '1'}
      />
    </>
  )
}
