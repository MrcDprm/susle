'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { deleteOrnamentAction } from '@/app/actions'
import { dict, localePath, type Lang } from '@/lib/i18n'
import { chime } from '@/lib/music'
import type { OrnamentView } from '@/lib/trees'
import { OrnamentIcon } from './Art'
import { Countdown } from './Countdown'
import { Dialog } from './Dialog'
import { HangForm } from './HangForm'
import { OwnerPanel } from './OwnerPanel'
import { Ground } from './scene/Ground'
import { puffAt } from './scene/Snow'
import { TreeView } from './TreeView'
import { Welcome } from './Welcome'

export type ScreenProps = {
  lang: Lang
  tree: { id: string; name: string; style: number; accepting: boolean; revealAt: string; year: number }
  nowMs: number
  owner: boolean
  ownerUrl: string | null
  shareUrl: string
  ornaments: OrnamentView[]
  page: number
  pageCount: number
  pageSize: number
  total: number
  full: boolean
  revealed: boolean
  messages: OrnamentView[]
  turnstileSiteKey: string
  welcome: boolean
}

export function TreeScreen(p: ScreenProps) {
  const t = dict(p.lang)
  const router = useRouter()
  const [hangOpen, setHangOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [newIndex, setNewIndex] = useState<number | null>(null)
  const [swing, setSwing] = useState<number | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const stage = useRef<HTMLElement>(null)
  const [welcomeOpen, setWelcomeOpen] = useState(p.welcome)
  const [celebrate, setCelebrate] = useState(false)
  const known = useRef(p.total)
  known.current = Math.max(known.current, p.total)

  // Canlı güncelleme: sayfa açıkken 20 saniyede bir süs sayısına bakılır, yeni süs gelince
  // ağaç yenilenir, yeni süs dalına iner ve üstte kısa bir bildirim çıkar.
  useEffect(() => {
    if (p.revealed) return
    const lastPage = p.page === p.pageCount - 1
    const timer = setInterval(async () => {
      if (document.hidden) return
      try {
        const r = await fetch(`/api/agac/${p.tree.id}`, { cache: 'no-store' })
        if (!r.ok) return
        const { count } = (await r.json()) as { count: number }
        const added = count - known.current
        if (added <= 0) return
        known.current = count
        setFlash(added === 1 ? t.live.one : t.live.many(added))
        chime('tap')
        if (lastPage && count <= (p.page + 1) * p.pageSize) setNewIndex((count - 1) % p.pageSize)
        router.refresh()
      } catch {
        // Bağlantı koptuysa bir sonraki turda yeniden denenir.
      }
    }, 20000)
    return () => clearInterval(timer)
  }, [p.revealed, p.page, p.pageCount, p.pageSize, p.tree.id, router, t])

  // Yeni yılın ilk günlerinde sayfayı ilk açan bir kez kutlama görür.
  useEffect(() => {
    if (!p.revealed) return
    const since = p.nowMs - new Date(p.tree.revealAt).getTime()
    const key = `susle-kutlama-${p.tree.id}`
    if (since < 3 * 86400000 && !localStorage.getItem(key)) {
      localStorage.setItem(key, '1')
      setCelebrate(true)
      const bursts = [0, 400, 900, 1500]
      bursts.forEach((ms, i) =>
        setTimeout(() => puffAt(window.innerWidth * (0.2 + 0.2 * i), window.innerHeight * (0.25 + 0.1 * (i % 2))), ms),
      )
    }
  }, [p.revealed, p.nowMs, p.tree.revealAt, p.tree.id])

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(null), 5000)
    return () => clearTimeout(timer)
  }, [flash])

  const name = (o: OrnamentView) => o.authorName ?? t.card.anonymous
  const canHang = !p.revealed && p.tree.accepting && !p.full
  const pagePath = (n: number) => `${localePath(p.lang, `/a/${p.tree.id}`)}${n > 0 ? `?dal=${n + 1}` : ''}`
  const current = selected !== null ? p.ornaments[selected] : null

  // Önce süs sallanır, kart kısa bir an sonra açılır.
  const select = (i: number) => {
    setSwing(null)
    requestAnimationFrame(() => setSwing(i))
    setTimeout(() => setSelected(i), 280)
  }

  const onHung = (index: number) => {
    setHangOpen(false)
    setFlash(t.hang.done)
    chime('hang')
    const box = stage.current?.querySelector('.tree-wrap')?.getBoundingClientRect()
    if (box) puffAt(box.left + box.width / 2, box.top + box.height * 0.4)
    const page = Math.floor(index / p.pageSize)
    setNewIndex(index % p.pageSize)
    if (page !== p.page) router.push(pagePath(page))
    else router.refresh()
    stage.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const removeOrnament = (id: string) => {
    if (!window.confirm(t.card.removeConfirm)) return
    start(async () => {
      const r = await deleteOrnamentAction(p.tree.id, id)
      if (r.ok) {
        setSelected(null)
        router.refresh()
      }
    })
  }

  return (
    <main className="tree-page">
      <section className="stage" ref={stage}>
        <div className="tree-head">
          <h1>{p.tree.name}</h1>
          <p className="count">{t.tree.count(p.total)}</p>
          {p.revealed ? (
            <p className="revealed-note">
              {t.tree.revealed(p.tree.year)} {p.total > 0 && t.tree.tapHint}
            </p>
          ) : (
            <>
              <Countdown lang={p.lang} revealAt={p.tree.revealAt} nowMs={p.nowMs} />
              <a className="remind-link" href={`/api/takvim/${p.tree.id}?l=${p.lang}`} download="susle-1-ocak.ics">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {t.reminder.short}
              </a>
            </>
          )}
        </div>

        <div className="tree-wrap">
          <TreeView
            style={p.tree.style}
            title={p.tree.name}
            total={p.total}
            newIndex={newIndex}
            swingIndex={swing}
            onSelect={select}
            ornaments={p.ornaments.map((o) => ({ id: o.id, kind: o.kind, label: `${t.ornaments[o.kind]}, ${name(o)}` }))}
          />
        </div>

        <Ground />

        <div className="bar">
          {p.pageCount > 1 && (
            <nav className="pager" aria-label={t.tree.page(p.page + 1, p.pageCount)}>
              {p.page > 0 ? <Link href={pagePath(p.page - 1)}>{t.tree.prev}</Link> : <span />}
              <span>{t.tree.page(p.page + 1, p.pageCount)}</span>
              {p.page < p.pageCount - 1 ? <Link href={pagePath(p.page + 1)}>{t.tree.next}</Link> : <span />}
            </nav>
          )}
          <div className="bar-buttons">
            {canHang && (
              <button type="button" className="btn btn-hang" onClick={() => setHangOpen(true)}>
                {t.tree.hang}
              </button>
            )}
            {p.owner && p.ownerUrl && (
              <button type="button" className={canHang ? 'btn-round' : 'btn btn-hang'} onClick={() => setOwnerOpen(true)}>
                {t.owner.open}
              </button>
            )}
          </div>
          {!canHang && !p.revealed && <p className="bar-note">{p.full ? t.tree.full : t.tree.closed}</p>}
          {!p.owner && (
            <Link className="make-yours" href={localePath(p.lang, '/')}>
              {t.tree.makeYours}
            </Link>
          )}
        </div>
      </section>

      {flash && (
        <p className="flash" role="status">
          {flash}
        </p>
      )}

      {p.revealed && p.messages.length > 0 && (
        <section className="messages snowfield" aria-labelledby="messages-title">
          <h2 id="messages-title">{t.tree.allMessages}</h2>
          <ul>
            {p.messages.map((m) => (
              <li key={m.id} className="tag">
                <span className="tag-icon">
                  <OrnamentIcon kind={m.kind} />
                </span>
                <p className="tag-body">{m.body}</p>
                <p className="tag-name">{name(m)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Dialog open={hangOpen} onClose={() => setHangOpen(false)} label={t.hang.title}>
        <HangForm lang={p.lang} treeId={p.tree.id} siteKey={p.turnstileSiteKey} onDone={onHung} onCancel={() => setHangOpen(false)} />
      </Dialog>

      {p.owner && p.ownerUrl && (
        <Dialog open={ownerOpen} onClose={() => setOwnerOpen(false)} label={t.owner.title}>
          <OwnerPanel
            lang={p.lang}
            treeId={p.tree.id}
            name={p.tree.name}
            accepting={p.tree.accepting}
            revealed={p.revealed}
            shareUrl={p.shareUrl}
            ownerUrl={p.ownerUrl}
            revealAt={p.tree.revealAt}
            onClose={() => setOwnerOpen(false)}
          />
        </Dialog>
      )}

      {p.owner && p.ownerUrl && (
        <Dialog open={welcomeOpen} onClose={() => {}} label={t.welcome.title} dismissable={false}>
          <Welcome
            lang={p.lang}
            treeId={p.tree.id}
            treeName={p.tree.name}
            shareUrl={p.shareUrl}
            ownerUrl={p.ownerUrl}
            revealAt={p.tree.revealAt}
            onDone={() => {
              setWelcomeOpen(false)
              router.replace(localePath(p.lang, `/a/${p.tree.id}`), { scroll: false })
            }}
          />
        </Dialog>
      )}

      <Dialog open={celebrate} onClose={() => setCelebrate(false)} label={t.celebrate.title(p.tree.year)} className="celebrate">
        <div className="celebrate-body">
          <h2>{t.celebrate.title(p.tree.year)}</h2>
          <p>{p.owner ? t.celebrate.owner : t.celebrate.visitor}</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCelebrate(false)
              document.querySelector('.messages')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {t.celebrate.go}
          </button>
        </div>
      </Dialog>

      <Dialog open={current !== null} onClose={() => setSelected(null)} label={current ? name(current) : ''} className="card-dialog">
        {current && (
          <div className="card">
            <span className="card-icon">
              <OrnamentIcon kind={current.kind} />
            </span>
            <h2 className="card-name">{name(current)}</h2>
            {current.body !== null ? (
              <p className="card-body">{current.body}</p>
            ) : (
              <p className="card-note">{p.revealed ? t.card.private : t.card.locked}</p>
            )}
            <div className="actions">
              {p.owner && (
                <button type="button" className="btn-ghost" onClick={() => removeOrnament(current.id)} disabled={pending}>
                  {t.card.remove}
                </button>
              )}
              <button type="button" className="btn-small" onClick={() => setSelected(null)}>
                {t.card.close}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </main>
  )
}
