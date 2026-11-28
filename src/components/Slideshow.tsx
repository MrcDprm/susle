'use client'

import { useEffect, useRef, useState } from 'react'
import { dict, localePath, type Lang } from '@/lib/i18n'
import type { OrnamentView } from '@/lib/trees'
import { OrnamentIcon } from './Art'

// 1 Ocak'tan sonra mesajlar tam ekran kartlarda tek tek okunur. Sağa sola kaydırarak, düğmelerle
// ya da ok tuşlarıyla geçilir. Sahip herkese açık bir mesajı yılın mesajı olarak hikaye görseline çevirir.
export function Slideshow({ lang, treeId, messages, owner, onClose }: {
  lang: Lang
  treeId: string
  messages: OrnamentView[]
  owner: boolean
  onClose: () => void
}) {
  const t = dict(lang)
  const [i, setI] = useState(0)
  const [image, setImage] = useState<{ id: string; url: string; file: File } | null>(null)
  const [busy, setBusy] = useState(false)
  const startX = useRef<number | null>(null)
  const m = messages[i]

  const go = (d: number) => setI((n) => Math.min(messages.length - 1, Math.max(0, n + d)))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image.url)
  }, [image])

  const makeImage = async () => {
    if (!m) return
    setBusy(true)
    try {
      const r = await fetch(`/api/hikaye/${treeId}?l=${lang}&mesaj=${m.id}`)
      if (!r.ok) throw new Error('image')
      const blob = await r.blob()
      setImage({ id: m.id, url: URL.createObjectURL(blob), file: new File([blob], 'susle-yilin-mesaji.png', { type: 'image/png' }) })
    } catch {
      setImage(null)
    } finally {
      setBusy(false)
    }
  }

  const shareImage = async () => {
    if (!image) return
    try {
      await navigator.share({ files: [image.file] })
    } catch {
      // Kullanıcı paylaşımı kapattıysa bir şey yapmaya gerek yok.
    }
  }

  if (!m) return null
  const name = m.authorName ?? t.card.anonymous
  const canShareFile = image && typeof navigator.canShare === 'function' && navigator.canShare({ files: [image.file] })

  return (
    <div
      className="show"
      onPointerDown={(e) => {
        startX.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return
        const dx = e.clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="show-top">
        <span className="show-count">{t.show.of(i + 1, messages.length)}</span>
        <button type="button" className="btn-small" onClick={onClose}>
          {t.show.close}
        </button>
      </div>

      <article key={m.id} className="show-card">
        <span className="show-icon">
          <OrnamentIcon kind={m.kind} />
        </span>
        <p className="show-body">{m.body}</p>
        <p className="show-name">{name}</p>
      </article>

      {owner && (
        <div className="show-pick">
          {!m.isPublic ? (
            <p className="hint">{t.show.privateNote}</p>
          ) : image?.id === m.id ? (
            <div className="share-row">
              {canShareFile && (
                <button type="button" className="btn-small btn-accent" onClick={shareImage}>
                  {t.show.shareImage}
                </button>
              )}
              <a className="btn-small" href={image.url} download="susle-yilin-mesaji.png">
                {t.show.download}
              </a>
            </div>
          ) : (
            <button type="button" className="btn-small" onClick={makeImage} disabled={busy}>
              {busy ? t.show.preparing : t.show.pick}
            </button>
          )}
        </div>
      )}

      <div className="show-nav">
        <button type="button" className="btn-small" onClick={() => go(-1)} disabled={i === 0}>
          {t.show.prev}
        </button>
        <a className="show-keepsake" href={localePath(lang, `/a/${treeId}/ani`)}>
          {t.show.keepsake}
        </a>
        <button type="button" className="btn-small" onClick={() => go(1)} disabled={i === messages.length - 1}>
          {t.show.next}
        </button>
      </div>
    </div>
  )
}
