'use client'

import { useEffect, useState } from 'react'
import type { Lang } from '@/lib/i18n'
import { isPlaying, startMusic, stopMusic } from '@/lib/music'

const KEY = 'susle-ses'

// Tarayıcılar sesin kendiliğinden başlamasına izin vermez. Kullanıcı kapatmadıysa
// müzik sayfadaki ilk dokunuşla başlar; düğme her zaman görünür.
export function SoundToggle({ lang }: { lang: Lang }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(isPlaying())
    if (localStorage.getItem(KEY) === 'off') return
    const first = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest('.sound-toggle')) return
      void startMusic().then(() => setOn(true))
    }
    window.addEventListener('pointerdown', first, { once: true })
    return () => window.removeEventListener('pointerdown', first)
  }, [])

  const toggle = () => {
    if (on) {
      stopMusic()
      localStorage.setItem(KEY, 'off')
      setOn(false)
    } else {
      localStorage.setItem(KEY, 'on')
      void startMusic().then(() => setOn(true))
    }
  }

  const label = lang === 'tr' ? (on ? 'Müziği kapat' : 'Müziği aç') : on ? 'Turn music off' : 'Turn music on'
  return (
    <button type="button" className={`sound-toggle ${on ? 'is-on' : ''}`} onClick={toggle} aria-pressed={on} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
            <path d="M18.5 7a7 7 0 0 1 0 10" />
          </g>
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
      <span className="note" aria-hidden="true">♪</span>
    </button>
  )
}
