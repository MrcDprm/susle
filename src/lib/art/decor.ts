import { COLORS as C } from './palette'
import { g, h, type SvgNode } from './node'

// Ağacı kişiselleştiren parçalar: tepe süsü, ışık renkleri, sim, saksı ve büyüme süslemeleri.
// Hepsi 400x560 ağaç çerçevesine göre çizilir.

function star(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return `M${pts.join(' L')} Z`
}

// Tepe süsleri, merkez (200, 50).
export function topper(kind: number): SvgNode {
  const glow = g({ class: 'star-glow' }, [
    h('circle', { cx: 200, cy: 50, r: 44, fill: '#FFE9A8', opacity: 0.06 }),
    h('circle', { cx: 200, cy: 50, r: 32, fill: '#FFE9A8', opacity: 0.1 }),
  ])
  const body: SvgNode[] = (() => {
    switch (kind) {
      case 1: // kalp
        return [
          h('path', { d: 'M200 76 C192 68 172 58 172 40 C172 30 180 24 188 24 C194 24 198 28 200 33 C202 28 206 24 212 24 C220 24 228 30 228 40 C228 58 208 68 200 76 Z', fill: C.kirmizi }),
          h('ellipse', { cx: 184, cy: 36, rx: 5, ry: 3.5, fill: '#fff', opacity: 0.4, transform: 'rotate(-30 184 36)' }),
        ]
      case 2: // ay
        return [h('path', { d: 'M207 26 A25 25 0 1 0 207 74 A27 27 0 0 1 207 26 Z', fill: C.altin })]
      case 3: // kar tanesi
        return [0, 60, 120].map((deg) =>
          g({ transform: `rotate(${deg} 200 50)` }, [
            h('rect', { x: 197.5, y: 24, width: 5, height: 52, rx: 2.5, fill: C.kar }),
            h('path', { d: 'M200 32 L192 25 M200 32 L208 25 M200 68 L192 75 M200 68 L208 75', stroke: C.kar, 'stroke-width': 3.4, 'stroke-linecap': 'round' }),
          ]),
        )
      case 4: // nazar boncuğu
        return [
          h('circle', { cx: 200, cy: 50, r: 25, fill: C.lacivert }),
          h('circle', { cx: 200, cy: 50, r: 17, fill: C.kar }),
          h('circle', { cx: 200, cy: 50, r: 11, fill: C.mavi }),
          h('circle', { cx: 200, cy: 50, r: 5.5, fill: C.koyu }),
        ]
      case 5: // fiyonk
        return [
          h('path', { d: 'M200 50 C186 30 166 34 170 48 C173 60 190 58 200 50 Z', fill: C.kirmizi }),
          h('path', { d: 'M200 50 C214 30 234 34 230 48 C227 60 210 58 200 50 Z', fill: C.kirmizi }),
          h('path', { d: 'M196 54 L186 80 L193 77 L198 82 L200 56 Z M204 54 L214 80 L207 77 L202 82 L200 56 Z', fill: C.kirmiziKoyu }),
          h('circle', { cx: 200, cy: 51, r: 6, fill: C.kirmiziKoyu }),
        ]
      default: // yıldız
        return [h('path', { d: star(200, 50, 27, 12), fill: C.altin })]
    }
  })()
  return g({ class: 'topper' }, [glow, ...body])
}

// Işık dizilerinin renkleri; boş dizi ışıkların kapalı olduğu anlamına gelir.
export const LIGHT_SETS: string[][] = [
  [C.altin, C.kirmizi, C.mavi, C.yesilAmpul],
  ['#FFE7B0', '#FFF4DC'],
  ['#F2C14E', '#E6A23C'],
  ['#BDE6FF', '#8EC5D6', '#FFFFFF'],
  [C.kirmizi, '#3FBF6A'],
  [],
]

// Katın üst kısmından sarkan sim ya da kurdele.
// clip: katın kırpma yolu; sim katın dışına taşmaz.
export function ribbon(kind: number, y0: number, hw: number, clip: string): SvgNode | null {
  if (kind === 0) return null
  const w = hw * 0.42
  const d = `M${(200 - w).toFixed(1)} ${(y0 - 6).toFixed(1)} Q200 ${(y0 + 26).toFixed(1)} ${(200 + w).toFixed(1)} ${(y0 + 8).toFixed(1)}`
  if (kind === 3) {
    return g({ class: 'ribbon', 'clip-path': clip }, [
      h('path', { d, fill: 'none', stroke: C.kirmizi, 'stroke-width': 5.5, 'stroke-linecap': 'round' }),
      h('path', { d, fill: 'none', stroke: '#F06272', 'stroke-width': 1.6, 'stroke-linecap': 'round', transform: 'translate(0 -1.5)' }),
    ])
  }
  const color = kind === 1 ? C.altin : '#E6EBF2'
  return g({ class: 'ribbon', 'clip-path': clip }, [
    h('path', { d, fill: 'none', stroke: color, 'stroke-width': 5, 'stroke-dasharray': '1.5 2.6', 'stroke-linecap': 'round' }),
    h('path', { d, fill: 'none', stroke: color, 'stroke-width': 1.2, opacity: 0.8 }),
  ])
}

// Saksılar: ağacın gövdesi hepsinde aynı, altındaki kap değişir.
export function base(kind: number): SvgNode[] {
  switch (kind) {
    case 1: // hasır sepet
      return [
        h('path', { d: 'M148 500 L252 500 L242 548 L158 548 Z', fill: '#C68B4E' }),
        h('path', { d: 'M151 512 L249 512 M154 524 L246 524 M156 536 L244 536', stroke: '#9C6A37', 'stroke-width': 2 }),
        h('path', { d: 'M165 500 L170 548 M185 500 L187 548 M200 500 L200 548 M215 500 L213 548 M235 500 L230 548', stroke: '#B07A42', 'stroke-width': 1.4, opacity: 0.8 }),
        h('rect', { x: 142, y: 494, width: 116, height: 10, rx: 5, fill: '#A8743F' }),
      ]
    case 2: // ahşap kasa
      return [
        h('rect', { x: 150, y: 498, width: 100, height: 50, rx: 3, fill: '#8A5A35' }),
        h('path', { d: 'M150 515 L250 515 M150 532 L250 532', stroke: '#6E4426', 'stroke-width': 2 }),
        h('path', { d: 'M150 498 L250 548', stroke: '#6E4426', 'stroke-width': 3, opacity: 0.6 }),
        h('circle', { cx: 156, cy: 504, r: 1.6, fill: '#C9B39A' }),
        h('circle', { cx: 244, cy: 504, r: 1.6, fill: '#C9B39A' }),
        h('circle', { cx: 156, cy: 542, r: 1.6, fill: '#C9B39A' }),
        h('circle', { cx: 244, cy: 542, r: 1.6, fill: '#C9B39A' }),
      ]
    case 3: // karlı kütük
      return [
        h('path', { d: 'M160 506 L240 506 L244 548 L156 548 Z', fill: '#7A4E2D' }),
        h('path', { d: 'M172 512 L170 546 M195 510 L196 546 M222 512 L224 546', stroke: '#5E3A20', 'stroke-width': 2, opacity: 0.7 }),
        h('ellipse', { cx: 200, cy: 506, rx: 40, ry: 8, fill: '#C69A6B' }),
        h('ellipse', { cx: 200, cy: 506, rx: 26, ry: 5, fill: 'none', stroke: '#A27648', 'stroke-width': 1.5 }),
        h('path', { d: 'M158 504 Q172 494 186 502 Q200 492 214 501 Q228 494 242 504 Q228 509 200 509 Q172 509 158 504 Z', fill: C.kar }),
      ]
    default: // kırmızı saksı
      return [
        h('path', { d: 'M150 502 L250 502 L240 548 L160 548 Z', fill: C.kirmizi }),
        h('rect', { x: 144, y: 496, width: 112, height: 14, rx: 4, fill: C.kar }),
      ]
  }
}

// Büyüme: 10 süste etrafta parlayan yıldızlar, 50'de arkada ışık halkası.
const SPARKLES: [number, number, number][] = [
  [70, 170, 7], [330, 150, 6], [52, 300, 5], [352, 280, 7], [92, 420, 6], [318, 410, 5], [140, 90, 5], [262, 98, 6],
]

export function sparkles(): SvgNode {
  return g(
    { class: 'sparkles' },
    SPARKLES.map(([x, y, r], i) =>
      h('path', {
        d: `M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z`,
        fill: '#FFF4C8',
        class: `sparkle k${i % 4}`,
      }),
    ),
  )
}

export function halo(): SvgNode {
  return g({ class: 'halo' }, [
    h('ellipse', { cx: 200, cy: 280, rx: 210, ry: 250, fill: '#FFE9A8', opacity: 0.05 }),
    h('ellipse', { cx: 200, cy: 290, rx: 170, ry: 210, fill: '#FFE9A8', opacity: 0.06 }),
    h('ellipse', { cx: 200, cy: 300, rx: 130, ry: 170, fill: '#FFE9A8', opacity: 0.07 }),
  ])
}
