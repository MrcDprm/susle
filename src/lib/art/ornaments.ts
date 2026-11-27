import { COLORS as C } from './palette'
import { g, h, type SvgNode } from './node'

// Her süs (0,0) noktasındaki askı halkasından sarkar; gövde yaklaşık 0..36 arasında durur.
function ring(): SvgNode {
  return h('circle', { cx: 0, cy: 1.5, r: 2.4, fill: 'none', stroke: C.altinKoyu, 'stroke-width': 1.4 })
}

function star(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join(' L')} Z`
}

const SHINE = { fill: C.kar, opacity: 0.35 }
const HEART = 'M0 34 C-4 29 -16 23 -16 13 C-16 6 -11 3 -7 3 C-3.5 3 -1.5 5 0 8 C1.5 5 3.5 3 7 3 C11 3 16 6 16 13 C16 23 4 29 0 34 Z'
const MITTEN = 'M-9 34 L-9 14 C-9 8 -6 4 0 4 C6 4 9 8 9 14 L9 34 Z'
const THUMB = 'M-9 22 C-14 21 -16 16 -14 13 C-12 11 -9.5 12 -9 15 Z'
const GLASS = 'M-7.5 6 C-11 13 -5 19 -7.5 30 L7.5 30 C5 19 11 13 7.5 6 Z'
const TEA = 'M-8.3 14 C-7 18 -6 22 -7.5 30 L7.5 30 C6 22 7 18 8.3 14 Z'
const BELL = 'M-13 28 C-13 14 -9 6 0 6 C9 6 13 14 13 28 Z'

const DRAW: (() => SvgNode[])[] = [
  // 0 Top
  () => [
    h('rect', { x: -4.5, y: 2.5, width: 9, height: 5, rx: 1.5, fill: C.altin }),
    h('circle', { cx: 0, cy: 21, r: 15, fill: C.kirmizi }),
    h('ellipse', { cx: -5, cy: 15, rx: 4, ry: 2.6, transform: 'rotate(-30 -5 15)', ...SHINE }),
  ],
  // 1 Yıldız
  () => [h('path', { d: star(0, 20, 18, 8), fill: C.altin, 'stroke-linejoin': 'round' })],
  // 2 Kalp
  () => [h('path', { d: HEART, fill: C.pembe }), h('ellipse', { cx: -7, cy: 11, rx: 3, ry: 2, ...SHINE })],
  // 3 Çan
  () => [
    h('circle', { cx: 0, cy: 31, r: 3.6, fill: C.kahve }),
    h('path', { d: BELL, fill: C.altin }),
    h('rect', { x: -15, y: 26, width: 30, height: 5, rx: 2.5, fill: C.altinKoyu }),
  ],
  // 4 Kar tanesi
  () => {
    const arm = (deg: number) =>
      g({ transform: `rotate(${deg} 0 20)` }, [
        h('rect', { x: -1.8, y: 4, width: 3.6, height: 32, rx: 1.8, fill: C.kar }),
        h('path', { d: 'M0 9 L-5 5 M0 9 L5 5 M0 31 L-5 35 M0 31 L5 35', stroke: C.kar, 'stroke-width': 2.2, 'stroke-linecap': 'round' }),
      ])
    return [arm(0), arm(60), arm(120)]
  },
  // 5 Eldiven
  () => [
    h('path', { d: THUMB, fill: C.mavi }),
    h('path', { d: MITTEN, fill: C.mavi }),
    h('rect', { x: -10.5, y: 27, width: 21, height: 8, rx: 2, fill: C.kar }),
  ],
  // 6 Nar
  () => [
    h('path', { d: 'M-6.5 11 L-8 2 L-3.5 6.5 L0 1 L3.5 6.5 L8 2 L6.5 11 Z', fill: C.kirmiziKoyu }),
    h('path', { d: 'M0 9 C10 9 15.5 15 15.5 22 C15.5 30 8.5 36 0 36 C-8.5 36 -15.5 30 -15.5 22 C-15.5 15 -10 9 0 9 Z', fill: C.kirmiziKoyu }),
    h('path', { d: 'M-3 18 C-1 14 6 14 9 19 C10 24 6 30 0 30 C-5 30 -8 25 -3 18 Z', fill: '#F2B8C0' }),
    h('circle', { cx: 0, cy: 21, r: 1.6, fill: C.kirmizi }),
    h('circle', { cx: 4, cy: 24, r: 1.6, fill: C.kirmizi }),
    h('circle', { cx: -1, cy: 26, r: 1.6, fill: C.kirmizi }),
    h('circle', { cx: 4, cy: 19, r: 1.4, fill: C.kirmizi }),
  ],
  // 7 Nazar boncuğu
  () => [
    h('circle', { cx: 0, cy: 21, r: 15.5, fill: C.lacivert }),
    h('circle', { cx: 0, cy: 21, r: 10.5, fill: C.kar }),
    h('circle', { cx: 0, cy: 21, r: 6.8, fill: C.mavi }),
    h('circle', { cx: 0, cy: 21, r: 3.4, fill: C.koyu }),
  ],
  // 8 Çay bardağı
  () => [
    h('path', { d: GLASS, fill: C.kar, opacity: 0.5 }),
    h('path', { d: TEA, fill: C.cay }),
    h('path', { d: GLASS, fill: 'none', stroke: C.kar, 'stroke-width': 1.5 }),
    h('ellipse', { cx: 0, cy: 32, rx: 14, ry: 3.6, fill: C.kirmizi }),
  ],
  // 9 Mandalina
  () => [
    h('path', { d: 'M0 7 C2 2 8 0 12 2 C9 6 5 8 0 7 Z', fill: C.cam }),
    h('circle', { cx: 0, cy: 21, r: 14, fill: C.turuncu }),
    h('ellipse', { cx: -5, cy: 15, rx: 3.4, ry: 2.2, transform: 'rotate(-30 -5 15)', ...SHINE }),
  ],
  // 10 Kedi
  () => [
    h('path', { d: 'M-13 14 L-11 2 L-3 9 Z M13 14 L11 2 L3 9 Z', fill: C.gri }),
    h('ellipse', { cx: 0, cy: 20, rx: 14, ry: 12.5, fill: C.gri }),
    h('circle', { cx: -5, cy: 18.5, r: 2, fill: C.koyu }),
    h('circle', { cx: 5, cy: 18.5, r: 2, fill: C.koyu }),
    h('path', { d: 'M-1.8 23 L1.8 23 L0 25 Z', fill: C.pembe }),
  ],
  // 11 Hediye
  () => [
    h('rect', { x: -13, y: 10, width: 26, height: 24, rx: 2, fill: C.mavi }),
    h('rect', { x: -3, y: 10, width: 6, height: 24, fill: C.kirmizi }),
    h('rect', { x: -13, y: 18.5, width: 26, height: 5, fill: C.kirmizi }),
    h('path', { d: 'M0 10 C-4 3 -11 4 -9 8 C-7.5 10.5 -3 10.5 0 10 C3 10.5 7.5 10.5 9 8 C11 4 4 3 0 10 Z', fill: C.kirmizi }),
  ],
]

export const ORNAMENT_COUNT = DRAW.length

export function ornamentNodes(kind: number): SvgNode[] {
  return [ring(), ...(DRAW[kind] ?? DRAW[0])()]
}
