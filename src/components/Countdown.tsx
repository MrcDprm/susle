'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { dict, type Lang } from '@/lib/i18n'

const UNITS = {
  tr: ['gün', 'saat', 'dk', 'sn'],
  en: ['days', 'hrs', 'min', 'sec'],
}

function parts(ms: number): number[] {
  const s = Math.max(0, Math.floor(ms / 1000))
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]
}

// Saniyesi saniyesine geri sayım. İlk çizimde sunucunun saati kullanılır,
// böylece sunucu ve tarayıcı aynı sayıları üretir.
export function Countdown({ lang, revealAt, nowMs }: { lang: Lang; revealAt: string; nowMs: number }) {
  const t = dict(lang)
  const router = useRouter()
  const target = new Date(revealAt).getTime()
  const [now, setNow] = useState(nowMs)

  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const left = target - now
  useEffect(() => {
    if (left <= 0) router.refresh()
  }, [left <= 0, router]) // eslint-disable-line react-hooks/exhaustive-deps

  if (left <= 0) return null
  const [d, h, m, s] = parts(left)
  const minuteParts = parts(left + 59999)
  return (
    <div className="countdown">
      <p className="sr-only">{t.tree.countdown(minuteParts[0], minuteParts[1], minuteParts[2])}</p>
      <div className="chips" aria-hidden="true">
        {[d, h, m, s].map((v, i) => (
          <span key={i} className="chip">
            <b>{String(v).padStart(2, '0')}</b>
            <small>{UNITS[lang][i]}</small>
          </span>
        ))}
      </div>
    </div>
  )
}
