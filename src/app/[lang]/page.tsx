import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { CreateTree } from '@/components/CreateTree'
import { Header } from '@/components/Header'
import { NewBadge } from '@/components/NewBadge'
import { Ground } from '@/components/scene/Ground'
import { TreeView } from '@/components/TreeView'
import { getDb } from '@/lib/db/client'
import { dict, isLang, localePath } from '@/lib/i18n'
import { ownedTreeKeys, siteUrl } from '@/lib/server'
import { countOrnaments, getTree, isOwner } from '@/lib/trees'

const DEMO = [6, 1, 7, 9, 2, 8, 0, 3, 11, 5, 10, 4, 1, 6, 9]

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  const t = dict(lang)
  const nonce = (await headers()).get('x-nonce') ?? undefined

  // Ağaç listesi ek bilgi; veritabanına ulaşılamazsa ana sayfa yine açılır.
  let mine: { id: string; name: string; lang: string; total: number }[] = []
  const owned = await ownedTreeKeys()
  if (owned.length > 0) {
    try {
      const db = await getDb()
      const found = await Promise.all(
        owned.map(async ({ id, key }) => {
          const tree = await getTree(db, id)
          if (!tree || !isOwner(tree, key)) return null
          return { id, name: tree.name, lang: tree.lang, total: await countOrnaments(db, id) }
        }),
      )
      mine = found.filter((x) => x !== null)
    } catch (error) {
      console.error('ownedTrees', error)
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Süsle',
    url: `${siteUrl()}${localePath(lang, '/')}`,
    description: t.meta.description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    inLanguage: lang,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    author: { '@type': 'Person', name: 'Miraç Deprem', url: 'https://miracdeprem.com' },
  }

  return (
    <>
      <Header lang={lang} otherPath={localePath(lang === 'tr' ? 'en' : 'tr', '/')} />
      <main className="home">
        <section className="stage home-stage">
          <div className="tree-head">
            <h1>{t.home.title}</h1>
            <p className="lead">{t.home.lead}</p>
          </div>
          <div className="tree-wrap">
            <TreeView
              style={1}
              title={t.meta.title}
              className="demo"
              total={DEMO.length}
              ornaments={DEMO.map((kind, i) => ({ id: `d${i}`, kind, label: t.ornaments[kind] }))}
            />
          </div>
          <Ground />
          <div className="bar">
            <div className="bar-buttons">
              <a className="btn btn-hang" href="#ac">
                {t.create.submit}
              </a>
              {mine[0] && (
                <Link className="btn-round" href={localePath(mine[0].lang === 'en' ? 'en' : 'tr', `/a/${mine[0].id}`)}>
                  {t.home.myTree}
                  <NewBadge lang={lang} treeId={mine[0].id} total={mine[0].total} />
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="snowfield" id="ac">
          <div className="snow-inner">
            <CreateTree lang={lang} />
            <ol className="steps">
              {t.home.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {mine.length > 0 && (
              <section className="mine">
                <h2>{t.home.yourTrees}</h2>
                <ul>
                  {mine.map((m) => (
                    <li key={m.id}>
                      <Link href={localePath(m.lang === 'en' ? 'en' : 'tr', `/a/${m.id}`)}>{m.name}</Link>
                      <NewBadge lang={lang} treeId={m.id} total={m.total} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </section>
      </main>
      <script
        type="application/ld+json"
        nonce={nonce}
        // Yalnızca sabit verimiz; < işareti kaçışlanır, kullanıcı verisi girmez.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  )
}
