'use client'

import { useEffect, useRef } from 'react'

type Flake = { x: number; y: number; r: number; vy: number; vx: number; phase: number; life?: number }

export const PUFF_EVENT = 'susle:puff'

// Ağaca dokununca o noktadan kar silkelenir.
export function puffAt(x: number, y: number) {
  window.dispatchEvent(new CustomEvent(PUFF_EVENT, { detail: { x, y } }))
}

// Tek canvas, ekran boyutuna göre az sayıda kar tanesi. Sekme görünmezken durur,
// hareketi azaltma tercihi olanlarda hiç çalışmaz.
export function Snow() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let flakes: Flake[] = []
    let raf = 0
    let last = performance.now()
    let mode = '0'

    // Kar modları html data-snow ile gelir: 0 hafif, 1 yoğun, 2 yok, 3 tipi, 4 iri taneler.
    const spawn = (top = false): Flake => {
      const storm = mode === '3'
      const big = mode === '4'
      return {
        x: storm && top ? -20 - Math.random() * w * 0.5 + Math.random() * w : Math.random() * w,
        y: top ? -10 : Math.random() * h,
        r: big ? 2.4 + Math.random() * 3 : 0.8 + Math.random() * (storm ? 1.8 : 2.4),
        vy: storm ? 70 + Math.random() * 60 : big ? 14 + Math.random() * 14 : 18 + Math.random() * 30,
        vx: storm ? 90 + Math.random() * 80 : -6 + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const next = document.documentElement.dataset.snow ?? '0'
      const changed = next !== mode
      mode = next
      const factor = mode === '1' ? 2.2 : mode === '2' ? 0 : mode === '3' ? 2.6 : mode === '4' ? 0.7 : 1
      const target = Math.min(320, Math.round(((w * h) / 7000) * factor))
      // Mod değişince taneler yeni hız ve boyutlarla baştan dağıtılır.
      flakes = changed ? [] : flakes.filter((f) => f.life === undefined).slice(0, target)
      while (flakes.length < target) flakes.push(spawn())
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i]
        f.phase += dt
        f.y += f.vy * dt
        f.x += (f.vx + Math.sin(f.phase) * 8) * dt
        if (f.life !== undefined) {
          f.life -= dt
          f.vy += 60 * dt
          if (f.life <= 0) {
            flakes.splice(i, 1)
            continue
          }
        } else if (f.y > h + 10 || f.x > w + 30) {
          Object.assign(f, spawn(true))
        }
        ctx.globalAlpha = f.life !== undefined ? Math.min(1, f.life * 1.5) : 0.35 + f.r / 5
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }

    const onPuff = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 30 + Math.random() * 90
        flakes.push({ x, y, r: 1 + Math.random() * 2.2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, phase: 0, life: 0.9 + Math.random() * 0.8 })
      }
    }

    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    const observer = new MutationObserver(resize)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-snow'] })
    window.addEventListener(PUFF_EVENT, onPuff)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      observer.disconnect()
      window.removeEventListener(PUFF_EVENT, onPuff)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={ref} className="snow" aria-hidden="true" />
}
