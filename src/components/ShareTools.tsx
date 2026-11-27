'use client'

import { useEffect, useState } from 'react'
import { dict, type Lang } from '@/lib/i18n'
import { CopyField } from './CopyField'
import { OpenInBrowser, useInApp } from './OpenInBrowser'

// Paylaşım linki, telefonun paylaş menüsü, WhatsApp, X ve Instagram hikayesi bir arada.
export function ShareTools({ lang, treeId, shareUrl }: { lang: Lang; treeId: string; shareUrl: string }) {
  const t = dict(lang)
  const shareText = t.owner.shareText(shareUrl)
  const [canShare, setCanShare] = useState(false)
  useEffect(() => setCanShare(typeof navigator.share === 'function'), [])

  const nativeShare = async () => {
    try {
      await navigator.share({ text: t.owner.shareText(''), url: shareUrl })
    } catch {
      // Kullanıcı menüyü kapattıysa bir şey yapmaya gerek yok.
    }
  }

  return (
    <div className="share-tools">
      <CopyField label={t.create.shareLabel} value={shareUrl} copyLabel={t.owner.copyLink} copiedLabel={t.owner.copied} />
      <div className="share-row">
        {canShare && (
          <button type="button" className="btn-small btn-accent" onClick={nativeShare}>
            {t.owner.shareMenu}
          </button>
        )}
        <a className="btn-small" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
          {t.owner.whatsapp}
        </a>
        <a className="btn-small" href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
          {t.owner.x}
        </a>
      </div>
      <StoryShare lang={lang} treeId={treeId} />
    </div>
  )
}

// Telefonda paylaşım menüsü dosyayla açılır; Instagram oradan seçilir. Görsel önceden indirilir,
// çünkü tarayıcı paylaşımı yalnızca dokunuşun hemen ardından izin veriyor.
function StoryShare({ lang, treeId }: { lang: Lang; treeId: string }) {
  const t = dict(lang)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    fetch(`/api/hikaye/${treeId}?l=${lang}`)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('story'))))
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        setFile(new File([blob], 'susle-hikaye.png', { type: 'image/png' }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [treeId, lang])

  const canShareFile = file && typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file] })
    } catch {
      // Kullanıcı paylaşımı kapattıysa bir şey yapmaya gerek yok.
    }
  }

  return (
    <div className="story">
      <span className="field-label">{t.owner.story}</span>
      <div className="share-row">
        {!file ? (
          <span className="hint">{t.owner.storyPreparing}</span>
        ) : canShareFile ? (
          <button type="button" className="btn-small" onClick={share}>
            {t.owner.story}
          </button>
        ) : null}
        {url && (
          <a className="btn-small" href={url} download="susle-hikaye.png">
            {t.owner.storyDownload}
          </a>
        )}
      </div>
      <p className="hint">{t.owner.storyHint}</p>
    </div>
  )
}

// 1 Ocak 00:00 için takvim hatırlatıcısı: telefonun takvimine alarmlı etkinlik ya da Google Takvim.
export function Reminder({ lang, treeId, treeName, revealAt, shareUrl, compact, ownerUrl }: {
  lang: Lang
  treeId: string
  treeName: string
  revealAt: string
  shareUrl: string
  compact?: boolean
  ownerUrl?: string
}) {
  const t = dict(lang)
  const inApp = useInApp()
  const start = new Date(revealAt)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const google = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: t.reminder.title(treeName),
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${t.reminder.body} ${shareUrl}`,
  })}`

  // Uygulama içi tarayıcı takvim dosyasını iletmez, Google Takvim de giriş ister.
  if (inApp) {
    return (
      <div className={`reminder ${compact ? 'is-compact' : ''}`}>
        {!compact && <span className="field-label">{t.reminder.label}</span>}
        <OpenInBrowser lang={lang} inApp={inApp} compact url={ownerUrl} />
      </div>
    )
  }

  return (
    <div className={`reminder ${compact ? 'is-compact' : ''}`}>
      {!compact && <span className="field-label">{t.reminder.label}</span>}
      <div className="share-row">
        <a className="btn-small btn-accent" href={`/api/takvim/${treeId}?l=${lang}`} download="susle-1-ocak.ics">
          {t.reminder.calendar}
        </a>
        <a className="btn-small" href={google} target="_blank" rel="noopener noreferrer">
          {t.reminder.google}
        </a>
      </div>
      {!compact && <p className="hint">{t.reminder.hint}</p>}
    </div>
  )
}
