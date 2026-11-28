'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { deleteOrnamentAction } from '@/app/actions'
import { dict, localePath, type Lang } from '@/lib/i18n'
import { openInBrowserUrl } from '@/lib/inapp'
import { growthLevel, nextGrowth, type Look } from '@/lib/look'
import { chime, setSong } from '@/lib/music'
import type { OrnamentView } from '@/lib/trees'
import { OrnamentIcon } from './Art'
import { Countdown } from './Countdown'
import { Customize } from './Customize'
import { Dialog } from './Dialog'
import { HangForm } from './HangForm'
import { useInApp } from './OpenInBrowser'
import { OwnerPanel } from './OwnerPanel'
import { Backdrop, Ground } from './scene/Ground'
import { puffAt } from './scene/Snow'
import { applySceneLook, clearSceneLook } from './sceneLook'
import { Reminder, ShareTools } from './ShareTools'
import { Slideshow } from './Slideshow'
import { TreeView } from './TreeView'
import { Welcome } from './Welcome'

export type ScreenProps = {
  lang: Lang
  tree: { id: string; name: string; style: number; accepting: boolean; revealAt: string; year: number; look: Look; note: string | null }
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
  const inApp = useInApp()
  const [celebrate, setCelebrate] = useState(false)
  const known = useRef(p.total)
  known.current = Math.max(known.current, p.total)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [invite, setInvite] = useState(false)
  const [showOpen, setShowOpen] = useState(false)
  const [mine, setMine] = useState<ReadonlySet<string>>(new Set())
  const growth = growthLevel(p.total)
  const upcoming = nextGrowth(p.total)
  const mineKey = `susle-suslerim-${p.tree.id}`

  // Ağacın gökyüzü, kar ve müziği; sayfadan çıkınca varsayılana döner.
  useEffect(() => {
    applySceneLook(p.tree.look)
    setSong(p.tree.look.music)
    return () => {
      clearSceneLook()
      setSong(0)
    }
  }, [p.tree.look])

  // Bu tarayıcıdan asılan süsler ve sahibin son gördüğü süs sayısı tarayıcıda saklanır.
  useEffect(() => {
    try {
      setMine(new Set(JSON.parse(localStorage.getItem(mineKey) ?? '[]') as string[]))
      if (p.owner) localStorage.setItem(`susle-gorulen-${p.tree.id}`, String(p.total))
    } catch {
      // Tarayıcı depolamayı kapattıysa işaretler görünmez, başka bir şey bozulmaz.
    }
  }, [mineKey, p.owner, p.tree.id, p.total])

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

  const onHung = (index: number, id: string) => {
    setHangOpen(false)
    setInvite(true)
    const next = new Set(mine).add(id)
    setMine(next)
    try {
      localStorage.setItem(mineKey, JSON.stringify([...next]))
    } catch {
      // Depolama kapalıysa süs yine asılır, yalnızca işaret görünmez.
    }
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
          {p.tree.note && <p className="tree-note">{p.tree.note}</p>}
          <p className="count">{t.tree.count(p.total)}</p>
          {!p.revealed && <p className="growth-hint">{upcoming ? t.growth.next(upcoming.left, upcoming.level) : t.growth.max}</p>}
          {p.revealed ? (
            <p className="revealed-note">
              {t.tree.revealed(p.tree.year)} {p.total > 0 && t.tree.tapHint}
            </p>
          ) : (
            <>
              <Countdown lang={p.lang} revealAt={p.tree.revealAt} nowMs={p.nowMs} />
              <a
                className="remind-link"
                href={inApp ? openInBrowserUrl(p.ownerUrl ?? `${window.location.origin}${localePath(p.lang, `/a/${p.tree.id}`)}`, inApp) : `/api/takvim/${p.tree.id}?l=${p.lang}`}
                download={inApp ? undefined : 'susle-1-ocak.ics'}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {inApp ? t.inApp.remind : t.reminder.short}
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
            look={p.tree.look}
            growth={growth}
            mine={mine}
          />
        </div>

        <Backdrop scene={p.tree.look.scene} />
        <Ground scene={p.tree.look.scene} />

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
            {p.revealed && p.messages.length > 0 && (
              <button type="button" className="btn btn-hang" onClick={() => setShowOpen(true)}>
                {t.show.open}
              </button>
            )}
            {p.owner && p.ownerUrl && (
              <button type="button" className="btn-round" onClick={() => setCustomizeOpen(true)}>
                {t.customize.open}
              </button>
            )}
            {p.owner && p.ownerUrl && (
              <button
                type="button"
                className={canHang || (p.revealed && p.messages.length > 0) ? 'btn-round' : 'btn btn-hang'}
                onClick={() => setOwnerOpen(true)}
              >
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

      {p.owner && p.ownerUrl && (
        <Customize
            open={customizeOpen}
            title={p.tree.name}
            lang={p.lang}
            treeId={p.tree.id}
            style={p.tree.style}
            look={p.tree.look}
            note={p.tree.note}
            ornaments={p.ornaments.map((o) => ({ id: o.id, kind: o.kind, label: t.ornaments[o.kind] }))}
            total={p.total}
            growth={growth}
            onClose={() => setCustomizeOpen(false)}
          />
      )}

      <Dialog open={invite} onClose={() => setInvite(false)} label={t.invite.title}>
        <div className="invite">
          <h2 className="patch-title">{t.invite.title}</h2>
          <p className="welcome-lead">{t.invite.body}</p>
          <Reminder lang={p.lang} treeId={p.tree.id} treeName={p.tree.name} revealAt={p.tree.revealAt} shareUrl={p.shareUrl} compact />
          <p className="hint">{t.invite.shareLabel}</p>
          <ShareTools lang={p.lang} treeId={p.tree.id} shareUrl={p.shareUrl} story={false} />
          {!p.owner && (
            <div className="invite-own">
              <h3>{t.invite.ownTitle}</h3>
              <p>{t.invite.ownBody}</p>
              <Link className="btn" href={`${localePath(p.lang, '/')}#ac`}>
                {t.invite.ownCta}
              </Link>
            </div>
          )}
          <div className="actions">
            <button type="button" className="btn-small" onClick={() => setInvite(false)}>
              {t.invite.close}
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog open={showOpen} onClose={() => setShowOpen(false)} label={t.show.open} className="show-dialog">
        {showOpen && <Slideshow lang={p.lang} treeId={p.tree.id} messages={p.messages} owner={p.owner} onClose={() => setShowOpen(false)} />}
      </Dialog>

      <Dialog open={celebrate} onClose={() => setCelebrate(false)} label={t.celebrate.title(p.tree.year)} className="celebrate">
        <div className="celebrate-body">
          <h2>{t.celebrate.title(p.tree.year)}</h2>
          <p>{p.owner ? t.celebrate.owner : t.celebrate.visitor}</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCelebrate(false)
              if (p.messages.length > 0) setShowOpen(true)
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
            {mine.has(current.id) && <p className="card-mine">{t.card.mine}</p>}
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
