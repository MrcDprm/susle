'use client'

import { useEffect, useState } from 'react'
import { dict, type Lang } from '@/lib/i18n'
import { detectInApp, openInBrowserUrl, type InApp } from '@/lib/inapp'

// Sunucu tarayıcıyı bilemez; algılama sayfa açıldıktan sonra tarayıcıda yapılır.
export function useInApp(): InApp | null {
  const [inApp, setInApp] = useState<InApp | null>(null)
  useEffect(() => setInApp(detectInApp(navigator.userAgent)), [])
  return inApp
}

// Uygulama içi tarayıcıda takvime ekleme çalışmadığı için sayfayı gerçek tarayıcıda açtırır.
// Ağacın sahibi için açılacak adres sahip linkidir; Safari'de sahip çerezi yoktur, link onu yazar.
export function OpenInBrowser({ lang, inApp, compact, url }: { lang: Lang; inApp: InApp; compact?: boolean; url?: string }) {
  const t = dict(lang).inApp
  const [copied, setCopied] = useState(false)
  const pageUrl = url ?? window.location.href.replace(/[?&]yeni=1/, '')
  const target = openInBrowserUrl(pageUrl, inApp.platform)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
    } catch {
      // Pano izni yoksa tarif yeterli.
    }
  }

  return (
    <div className={`in-app ${compact ? 'is-compact' : ''}`} role="note">
      <p className="in-app-text">{t.notice(inApp.app)}</p>
      <div className="share-row">
        <a className="btn-small btn-accent" href={target}>
          {inApp.platform === 'ios' ? t.openSafari : t.openBrowser}
        </a>
        <button type="button" className="btn-small" onClick={copy}>
          {copied ? t.copied : t.copy}
        </button>
      </div>
      <p className="hint">{t.hint}</p>
    </div>
  )
}
