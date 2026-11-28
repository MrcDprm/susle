import { COLORS as C } from './palette'
import { g, h, toSvgString, type SvgNode } from './node'
import { base, halo, LIGHT_SETS, ribbon, sparkles, topper } from './decor'
import { ornamentNodes } from './ornaments'

export const TREE_VIEWBOX = '0 0 400 560'
type Tier = { top: number; bottom: number; hw: number }

type StyleDef = {
  base: string
  dark: string
  shadow: number
  tiers: number
  width: number
  droop: number
  snow: 'none' | 'caps' | 'frost'
  wire: string
}

// Altı ağaç: kat sayısı, genişlik, dal ucu sarkması ve renkleri farklı.
const STYLES: StyleDef[] = [
  { base: '#2F6B45', dark: '#1C432C', shadow: 0.16, tiers: 4, width: 1, droop: 13, snow: 'none', wire: '#13261A' },
  { base: '#2F6B45', dark: '#1C432C', shadow: 0.16, tiers: 4, width: 1, droop: 13, snow: 'caps', wire: '#13261A' },
  { base: '#3F7468', dark: '#254A43', shadow: 0.16, tiers: 6, width: 0.88, droop: 10, snow: 'none', wire: '#152A26' },
  { base: '#245A3C', dark: '#14341F', shadow: 0.18, tiers: 5, width: 0.95, droop: 19, snow: 'none', wire: '#0E2016' },
  { base: '#93ACA6', dark: '#5D7871', shadow: 0.14, tiers: 5, width: 0.92, droop: 12, snow: 'frost', wire: '#33433F' },
  { base: '#F3F6FA', dark: '#C3CDD9', shadow: 0.1, tiers: 4, width: 1, droop: 13, snow: 'none', wire: '#8C97A6' },
]

export const TREE_STYLE_COUNT = STYLES.length

const APEX = 62
const BASE = 465

// Katlar üstten alta; her kat bir öncekinin altına girer, genişlik aşağı indikçe artar.
function tiersFor(def: StyleDef): Tier[] {
  const step = (BASE - APEX) / def.tiers
  const out: Tier[] = []
  for (let i = 0; i < def.tiers; i++) {
    const bottom = APEX + step * (i + 1)
    const top = i === 0 ? APEX : Math.max(APEX + 8, bottom - step * 1.9)
    const hw = (70 + (115 * (bottom - 170)) / (BASE - 170)) * def.width
    out.push({ top, bottom, hw: Math.max(38, hw) })
  }
  return out
}

// Alt kenar: sivri ve sarkık dal uçları. Derinlikler sabit bir sırayla değişir, her çizimde aynı.
function edge(t: Tier, droop: number, y = t.bottom, hw = t.hw): string {
  const L = 200 - hw
  const R = 200 + hw
  const n = Math.max(3, Math.round(hw / 15))
  const step = (R - L) / n
  let d = ''
  for (let k = 0; k < n; k++) {
    const x0 = L + step * k
    const x1 = x0 + step
    const mid = x0 + step / 2
    const depth = droop * (0.75 + (0.25 * ((k * 7) % 3)) / 2)
    d += ` Q${(x0 + step * 0.32).toFixed(1)} ${(y + depth * 0.18).toFixed(1)} ${mid.toFixed(1)} ${(y + depth).toFixed(1)}`
    d += ` Q${(x1 - step * 0.32).toFixed(1)} ${(y + depth * 0.18).toFixed(1)} ${x1.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}

function tierPath(t: Tier, droop: number): string {
  const midY = t.top + (t.bottom - t.top) * 0.55
  const L = 200 - t.hw
  return `M200 ${t.top.toFixed(1)} Q${(200 - t.hw * 0.42).toFixed(1)} ${midY.toFixed(1)} ${L.toFixed(1)} ${t.bottom.toFixed(1)}${edge(t, droop)} Q${(200 + t.hw * 0.42).toFixed(1)} ${midY.toFixed(1)} 200 ${t.top.toFixed(1)} Z`
}

function edgeLine(t: Tier, droop: number): string {
  return `M${(200 - t.hw).toFixed(1)} ${t.bottom.toFixed(1)}${edge(t, droop)}`
}


// Her katın ortasından sarkan bir ampul dizisi. Ampuller sayfada sırayla yanıp söner.
// Renkler sahibin seçtiği ışık setinden gelir; ağaç büyüdükçe ampul sayısı artar.
function garland(t: Tier, tierIndex: number, wire: string, colors: string[], dense: boolean): SvgNode | null {
  if (colors.length === 0) return null
  const y0 = t.top + (t.bottom - t.top) * 0.62
  const w = t.hw * 0.52
  const p0 = [200 - w, y0]
  const p1 = [200, y0 + 30]
  const p2 = [200 + w, y0 - 4]
  const n = Math.max(3, Math.round((w / 22) * (dense ? 1.6 : 1)))
  const bulbs: SvgNode[] = []
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) / n
    const x = (1 - s) ** 2 * p0[0] + 2 * (1 - s) * s * p1[0] + s * s * p2[0]
    const y = (1 - s) ** 2 * p0[1] + 2 * (1 - s) * s * p1[1] + s * s * p2[1]
    const color = colors[(i + tierIndex) % colors.length]
    bulbs.push(
      g({ class: 'bulb' }, [
        h('circle', { cx: x.toFixed(1), cy: (y + 3).toFixed(1), r: 10, fill: color, opacity: 0.22 }),
        h('circle', { cx: x.toFixed(1), cy: (y + 3).toFixed(1), r: 4.8, fill: color }),
        h('circle', { cx: (x - 1.4).toFixed(1), cy: (y + 1.6).toFixed(1), r: 1.4, fill: '#fff', opacity: 0.7 }),
      ]),
    )
  }
  return g({ class: 'garland' }, [
    h('path', { d: `M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`, fill: 'none', stroke: wire, 'stroke-width': 1.3, opacity: 0.8 }),
    ...bulbs,
  ])
}

// Ağacın altındaki hediye kutuları; süs sayısı arttıkça çoğalır.
const PRESENTS: [number, number, number, number, string, string][] = [
  [96, 512, 40, 34, C.kirmizi, C.altin],
  [266, 516, 34, 30, C.mavi, C.kirmizi],
  [60, 526, 30, 22, C.altin, C.kirmizi],
  [302, 524, 38, 24, C.cam, C.kar],
  [130, 530, 26, 18, C.pembe, C.kar],
]

function presents(count: number): SvgNode[] {
  return PRESENTS.slice(0, count).map(([x, y, w, ht, box, ribbon]) =>
    g({ class: 'present' }, [
      h('rect', { x, y, width: w, height: ht, rx: 3, fill: box }),
      h('rect', { x: x + w / 2 - 3, y, width: 6, height: ht, fill: ribbon }),
      h('rect', { x, y: y + ht / 2 - 2.5, width: w, height: 5, fill: ribbon, opacity: 0.9 }),
      h('path', { d: `M${x + w / 2} ${y} C${x + w / 2 - 6} ${y - 8} ${x + w / 2 - 12} ${y - 2} ${x + w / 2} ${y} C${x + w / 2 + 12} ${y - 2} ${x + w / 2 + 6} ${y - 8} ${x + w / 2} ${y} Z`, fill: ribbon }),
    ]),
  )
}

export function presentCount(ornaments: number): number {
  return Math.min(PRESENTS.length, Math.ceil(ornaments / 5))
}

export type TreeLook = { topper: number; lights: number; ribbon: number; base: number }

// Her kat yukarıdan aşağı koyudan açığa boyanır, sağ yanına gölge düşer; dallar ışığı soldan alır.
// growth: 1'de etrafta yıldızlar, 2'de daha çok ampul, 3'te arkada ışık halkası.
export function treeBody(
  style: number,
  opts: { presents?: number; prefix?: string; look?: Partial<TreeLook>; growth?: number } = {},
): SvgNode {
  const def = STYLES[style] ?? STYLES[0]
  const id = opts.prefix ?? 't'
  const look = { topper: 0, lights: 0, ribbon: 0, base: 0, ...opts.look }
  const growth = opts.growth ?? 0
  const colors = LIGHT_SETS[look.lights] ?? LIGHT_SETS[0]
  const tiers = tiersFor(def)
  const defs = h('defs', undefined, [
    h('linearGradient', { id: `${id}-g`, x1: 0, y1: 0, x2: 0, y2: 1 }, [
      h('stop', { offset: 0, 'stop-color': def.dark }),
      h('stop', { offset: 0.75, 'stop-color': def.base }),
    ]),
    ...tiers.map((t, i) => h('clipPath', { id: `${id}-c${i}` }, [h('path', { d: tierPath(t, def.droop) })])),
  ])

  const drawn: SvgNode[] = []
  // Alttaki kat önce çizilir, üstteki onun üstüne biner.
  for (let i = tiers.length - 1; i >= 0; i--) {
    const t = tiers[i]
    drawn.push(h('path', { d: tierPath(t, def.droop), fill: `url(#${id}-g)` }))
    drawn.push(
      h('path', {
        d: `M200 ${t.top.toFixed(1)} L${(200 + t.hw * 1.2).toFixed(1)} ${(t.bottom + 30).toFixed(1)} L${(200 + t.hw * 0.12).toFixed(1)} ${(t.bottom + 30).toFixed(1)} Z`,
        fill: '#000',
        opacity: def.shadow,
        'clip-path': `url(#${id}-c${i})`,
      }),
    )
    // Katın ortasındaki koyu uç sırası, iç dallar gibi derinlik verir.
    const innerY = t.top + (t.bottom - t.top) * 0.5
    const innerHw = t.hw * 0.5
    if (innerHw > 30) {
      drawn.push(
        h('path', {
          d: `M${(200 - innerHw).toFixed(1)} ${innerY.toFixed(1)}${edge(t, def.droop * 0.7, innerY, innerHw)}`,
          fill: 'none',
          stroke: def.dark,
          'stroke-width': 2.2,
          opacity: 0.45,
          'clip-path': `url(#${id}-c${i})`,
        }),
      )
    }
    if (def.snow === 'caps') {
      drawn.push(h('path', { d: edgeLine(t, def.droop), fill: 'none', stroke: C.kar, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))
    } else if (def.snow === 'frost') {
      drawn.push(h('path', { d: edgeLine(t, def.droop), fill: 'none', stroke: C.kar, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.85 }))
    }
    // Üstteki kat alttakinin yaklaşık yarısını örter; kurdele her katın açıkta kalan bandına çizilir.
    const ribbonY = t.top + (t.bottom - t.top) * (i === 0 ? 0.36 : 0.5)
    const r = ribbon(look.ribbon, ribbonY, t.hw, `url(#${id}-c${i})`)
    if (r) drawn.push(r)
    const gl = garland(t, i, def.wire, colors, growth >= 2)
    if (gl) drawn.push(gl)
  }

  return g(undefined, [
    defs,
    ...(growth >= 3 ? [halo()] : []),
    h('ellipse', { cx: 200, cy: 548, rx: 150, ry: 10, fill: '#0B1630', opacity: 0.25 }),
    h('rect', { x: 186, y: 450, width: 28, height: 60, rx: 3, fill: C.kahve }),
    ...base(look.base),
    g({ class: 'tree-body' }, [...drawn, topper(look.topper)]),
    ...(growth >= 1 ? [sparkles()] : []),
    ...presents(opts.presents ?? 0),
  ])
}

// 24 askı yeri: [x, y]. Süsler bu noktalardan ip ile sarkar.
const SLOTS: [number, number][] = [
  [165, 150], [235, 150],
  [170, 205], [230, 205], [115, 245], [165, 245], [235, 245], [285, 245],
  [150, 300], [200, 300], [250, 300], [80, 345], [140, 345], [200, 345], [260, 345], [320, 345],
  [120, 395], [170, 395], [230, 395], [280, 395], [55, 445], [125, 445], [275, 445], [345, 445],
]

// Ağaç dengeli dolsun diye yuvalar katlar arasında sırayla dağıtılır.
const FILL_ORDER = [13, 4, 18, 1, 9, 22, 6, 16, 11, 2, 20, 14, 7, 19, 0, 10, 23, 5, 17, 12, 3, 21, 8, 15]

export type SlotPlace = { x: number; y: number; twine: number; scale: number; tilt: number }

export function slotPlace(index: number): SlotPlace {
  const [x, y] = SLOTS[FILL_ORDER[index % FILL_ORDER.length]]
  const seed = (index * 37) % 11
  return { x, y, twine: 8 + seed * 1.3, scale: 1.02 + (seed % 4) * 0.04, tilt: (seed % 5) - 2 }
}

export function twinePath(p: SlotPlace): string {
  return `M${p.x} ${p.y - 4} L${p.x} ${p.y + p.twine}`
}

export function ornamentTransform(p: SlotPlace): string {
  return `translate(${p.x} ${p.y + p.twine}) rotate(${p.tilt}) scale(${p.scale})`
}

export const TWINE_COLOR = C.altinKoyu

export function hangingOrnament(kind: number, index: number): SvgNode {
  const p = slotPlace(index)
  return g(undefined, [
    h('path', { d: twinePath(p), stroke: TWINE_COLOR, 'stroke-width': 1.4, fill: 'none' }),
    g({ transform: ornamentTransform(p) }, ornamentNodes(kind)),
  ])
}

// Paylaşım görselleri için ağacın tamamı tek SVG metni olarak.
export function treeSvgString(
  style: number,
  kinds: number[],
  width: number,
  total = kinds.length,
  look?: Partial<TreeLook>,
  growth = 0,
): string {
  const height = Math.round((width * 560) / 400)
  return toSvgString(
    h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: TREE_VIEWBOX, width, height }, [
      treeBody(style, { presents: presentCount(total), prefix: 's', look, growth }),
      ...kinds.slice(0, SLOTS.length).map((k, i) => hangingOrnament(k, i)),
    ]),
  )
}
