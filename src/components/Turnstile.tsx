'use client'

import { useEffect, useRef } from 'react'

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<void> | null = null

function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loading = null
      reject(new Error('turnstile'))
    }
    document.head.appendChild(s)
  })
  return loading
}

// Cloudflare Turnstile: çoğu kişide görünmeden geçer, gerekirse tek tıklık kutu çıkar.
export function Turnstile({ siteKey, lang, onToken }: { siteKey: string; lang: string; onToken: (token: string | null) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const tokenCb = useRef(onToken)
  tokenCb.current = onToken

  useEffect(() => {
    let id: string | null = null
    let cancelled = false
    load()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return
        id = window.turnstile.render(box.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'flexible',
          language: lang,
          callback: (token: string) => tokenCb.current(token),
          'expired-callback': () => tokenCb.current(null),
          'error-callback': () => tokenCb.current(null),
        })
      })
      .catch(() => tokenCb.current(null))
    return () => {
      cancelled = true
      if (id && window.turnstile) window.turnstile.remove(id)
    }
  }, [siteKey, lang])

  return <div ref={box} className="turnstile" />
}
