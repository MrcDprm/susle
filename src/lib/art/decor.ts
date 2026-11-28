import { COLORS as C } from './palette'
import { g, h, type Attrs, type SvgNode } from './node'

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
      case 6: // kuyruklu yıldız
        return [
          h('path', { d: 'M196 54 Q160 70 120 104 Q170 78 204 62 Z', fill: '#FFE9A8', opacity: 0.55 }),
          h('path', { d: 'M194 50 Q168 58 140 80 Q176 64 200 58 Z', fill: '#FFF6D6', opacity: 0.7 }),
          h('path', { d: star(206, 46, 22, 10), fill: C.altin }),
          h('path', { d: star(206, 46, 10, 4.5), fill: '#FFF6D6' }),
        ]
      case 7: // yılbaşı saati, akrep ve yelkovan on ikide
        return [
          h('circle', { cx: 200, cy: 50, r: 27, fill: C.altinKoyu }),
          h('circle', { cx: 200, cy: 50, r: 22, fill: '#FFFBEF' }),
          ...Array.from({ length: 12 }, (_, i) =>
            h('rect', { x: 199, y: 30, width: 2, height: i % 3 === 0 ? 5 : 3, fill: C.koyu, transform: `rotate(${i * 30} 200 50)` }),
          ),
          h('rect', { x: 198.5, y: 33, width: 3, height: 18, rx: 1.5, fill: C.koyu }),
          h('rect', { x: 199, y: 38, width: 2, height: 13, rx: 1, fill: C.kirmizi, transform: 'rotate(4 200 50)' }),
          h('circle', { cx: 200, cy: 50, r: 2.5, fill: C.koyu }),
          h('rect', { x: 196, y: 19, width: 8, height: 5, rx: 2, fill: C.altinKoyu }),
        ]
      case 8: // kar küresi
        return [
          h('path', { d: 'M180 72 L220 72 L224 82 L176 82 Z', fill: '#8A5A35' }),
          h('circle', { cx: 200, cy: 50, r: 26, fill: '#BFE3F5', opacity: 0.55 }),
          h('path', { d: 'M180 64 Q200 58 220 64 L218 70 L182 70 Z', fill: C.kar }),
          h('path', { d: 'M200 38 L210 58 L190 58 Z', fill: C.cam }),
          h('path', { d: 'M200 32 L207 46 L193 46 Z', fill: C.cam }),
          h('circle', { cx: 188, cy: 40, r: 1.4, fill: '#fff' }),
          h('circle', { cx: 213, cy: 44, r: 1.2, fill: '#fff' }),
          h('circle', { cx: 196, cy: 30, r: 1, fill: '#fff' }),
          h('circle', { cx: 216, cy: 34, r: 1.3, fill: '#fff' }),
          h('path', { d: 'M184 36 A20 20 0 0 1 198 28', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0.7 }),
        ]
      case 9: // altın çan
        return [
          h('path', { d: 'M200 24 C186 24 180 36 180 50 C180 62 174 68 170 72 L230 72 C226 68 220 62 220 50 C220 36 214 24 200 24 Z', fill: C.altin }),
          h('rect', { x: 168, y: 70, width: 64, height: 6, rx: 3, fill: C.altinKoyu }),
          h('circle', { cx: 200, cy: 80, r: 5, fill: C.altinKoyu }),
          h('path', { d: 'M188 34 C184 40 184 50 184 56', stroke: '#FFF1C4', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }),
          h('path', { d: 'M184 22 C192 16 208 16 216 22', stroke: C.kirmizi, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
        ]
      case 10: // çam kozalağı
        return [
          h('ellipse', { cx: 200, cy: 52, rx: 17, ry: 27, fill: '#7A4A26' }),
          ...[34, 42, 50, 58, 66].flatMap((y, r) =>
            [-1, 0, 1].map((k) =>
              h('path', {
                d: `M${200 + k * 9 - 6} ${y} Q${200 + k * 9} ${y + 8} ${200 + k * 9 + 6} ${y} Z`,
                fill: r % 2 === 0 ? '#A0673A' : '#8A5530',
              }),
            ),
          ),
          h('path', { d: 'M190 26 Q200 18 210 26 Q204 30 200 28 Q196 30 190 26 Z', fill: C.kar }),
        ]
      case 11: // hediye paketi
        return [
          h('rect', { x: 177, y: 38, width: 46, height: 38, rx: 3, fill: C.lacivert }),
          h('rect', { x: 173, y: 32, width: 54, height: 11, rx: 3, fill: '#2E5DAA' }),
          h('rect', { x: 196, y: 32, width: 8, height: 44, fill: C.altin }),
          h('path', { d: 'M200 32 C190 18 176 22 182 30 C186 34 194 33 200 32 Z M200 32 C210 18 224 22 218 30 C214 34 206 33 200 32 Z', fill: C.altin }),
          h('circle', { cx: 186, cy: 56, r: 2, fill: '#fff', opacity: 0.6 }),
          h('circle', { cx: 214, cy: 64, r: 2, fill: '#fff', opacity: 0.6 }),
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
  ['#C77DFF', '#FF8FC7', '#9FB8FF'],
  ['#FF5A5A', '#FFB347', '#FFF06A', '#6BE38B', '#5AB4FF', '#B57BFF'],
  [C.kirmizi, C.altin, '#FFF4DC'],
  ['#FFE7B0', '#9FE3FF'],
]

// Katın üst kısmından sarkan sim ya da kurdele.
// clip: katın kırpma yolu; sim katın dışına taşmaz.
const BEADS = ['#D7263D', '#F2C14E', '#2E5DAA', '#3FBF6A', '#E8798A']

export function ribbon(kind: number, y0: number, hw: number, clip: string): SvgNode | null {
  if (kind === 0) return null
  const w = hw * 0.42
  const p0 = [200 - w, y0 - 6]
  const p1 = [200, y0 + 26]
  const p2 = [200 + w, y0 + 8]
  const d = `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} Q${p1[0]} ${p1[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  const attrs: Attrs = clip ? { class: 'ribbon', 'clip-path': clip } : { class: 'ribbon' }
  // Boncuk dizileri: eğri üzerinde eşit aralıklı noktalar.
  const along = (n: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n
      return [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]]
    })
  if (kind === 4 || kind === 5) {
    const pts = along(Math.max(8, Math.round(w / 5)))
    return g(attrs, [
      h('path', { d, fill: 'none', stroke: '#C9D3E2', 'stroke-width': 0.8, opacity: 0.7 }),
      ...pts.map(([x, y], i) =>
        h('circle', {
          cx: x.toFixed(1),
          cy: y.toFixed(1),
          r: kind === 4 ? 2.6 : 3,
          fill: kind === 4 ? '#FBF7EE' : BEADS[i % BEADS.length],
          stroke: kind === 4 ? '#D9CFBE' : 'none',
          'stroke-width': 0.6,
        }),
      ),
    ])
  }
  if (kind === 6) {
    return g(attrs, [
      h('path', { d, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 6, 'stroke-linecap': 'round' }),
      h('path', { d, fill: 'none', stroke: C.kirmizi, 'stroke-width': 6, 'stroke-dasharray': '5 5' }),
    ])
  }
  if (kind === 7) {
    return g(attrs, [
      h('path', { d, fill: 'none', stroke: '#2E5DAA', 'stroke-width': 5.5, 'stroke-linecap': 'round' }),
      h('path', { d, fill: 'none', stroke: '#8FB3F0', 'stroke-width': 1.4, 'stroke-linecap': 'round', transform: 'translate(0 -1.5)' }),
    ])
  }
  if (kind === 3) {
    return g(attrs, [
      h('path', { d, fill: 'none', stroke: C.kirmizi, 'stroke-width': 5.5, 'stroke-linecap': 'round' }),
      h('path', { d, fill: 'none', stroke: '#F06272', 'stroke-width': 1.6, 'stroke-linecap': 'round', transform: 'translate(0 -1.5)' }),
    ])
  }
  const color = kind === 1 ? C.altin : '#E6EBF2'
  return g(attrs, [
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
    case 4: // çini saksı
      return [
        h('path', { d: 'M150 502 L250 502 L240 548 L160 548 Z', fill: '#F7F3EA' }),
        h('path', { d: 'M152 512 L248 512 M158 540 L242 540', stroke: '#1F5FA8', 'stroke-width': 3 }),
        ...[170, 200, 230].map((x) =>
          g({ transform: `translate(${x} 526)` }, [
            h('path', { d: 'M0 -9 C5 -4 5 4 0 9 C-5 4 -5 -4 0 -9 Z', fill: '#1F5FA8' }),
            h('path', { d: 'M-9 0 C-4 5 4 5 9 0 C4 -5 -4 -5 -9 0 Z', fill: '#2F8FA8', opacity: 0.8 }),
            h('circle', { r: 2.4, fill: C.kirmizi }),
          ]),
        ),
        h('rect', { x: 144, y: 496, width: 112, height: 12, rx: 4, fill: '#1F5FA8' }),
      ]
    case 5: // bakır kova
      return [
        h('path', { d: 'M150 506 C130 506 130 530 150 530 M250 506 C270 506 270 530 250 530', stroke: '#8E4C27', 'stroke-width': 3, fill: 'none' }),
        h('path', { d: 'M152 500 L248 500 L240 548 L160 548 Z', fill: '#B8683A' }),
        h('path', { d: 'M152 500 L248 500 L246 512 L154 512 Z', fill: '#CF8150' }),
        h('path', { d: 'M168 504 L174 544', stroke: '#E8A577', 'stroke-width': 5, opacity: 0.55, 'stroke-linecap': 'round' }),
        h('path', { d: 'M156 522 L244 522 M158 536 L242 536', stroke: '#8E4C27', 'stroke-width': 1.6 }),
      ]
    case 6: // hediye kutusu
      return [
        h('rect', { x: 150, y: 500, width: 100, height: 48, rx: 3, fill: '#2E8B57' }),
        h('rect', { x: 146, y: 494, width: 108, height: 12, rx: 3, fill: '#37A266' }),
        h('rect', { x: 194, y: 494, width: 12, height: 54, fill: C.kirmizi }),
        h('rect', { x: 150, y: 520, width: 100, height: 8, fill: C.kirmizi, opacity: 0.9 }),
        h('circle', { cx: 168, cy: 538, r: 2.4, fill: '#FFF4C8' }),
        h('circle', { cx: 232, cy: 512, r: 2.4, fill: '#FFF4C8' }),
      ]
    case 7: // kızak
      return [
        h('rect', { x: 146, y: 500, width: 108, height: 9, rx: 3, fill: '#A8743F' }),
        h('rect', { x: 146, y: 512, width: 108, height: 9, rx: 3, fill: '#94622F' }),
        h('rect', { x: 146, y: 524, width: 108, height: 9, rx: 3, fill: '#A8743F' }),
        h('path', { d: 'M156 533 L156 544 M244 533 L244 544', stroke: C.kirmiziKoyu, 'stroke-width': 4 }),
        h('path', { d: 'M138 546 L250 546 C262 546 268 540 268 530', stroke: C.kirmizi, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round' }),
        h('path', { d: 'M148 500 Q170 492 200 497 Q230 492 252 500 Z', fill: C.kar }),
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
