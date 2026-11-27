// Çizimler küçük bir düğüm ağacı olarak tanımlanır. Aynı çizim sayfada React öğesine,
// paylaşım görsellerinde SVG metnine çevrilir; iki ayrı kopya tutulmaz.
export type Attrs = Record<string, string | number>
export type SvgNode = { t: string; a?: Attrs; c?: SvgNode[]; text?: string }

export function h(t: string, a?: Attrs, c?: SvgNode[]): SvgNode {
  return { t, a, c }
}

export function g(a: Attrs | undefined, c: SvgNode[]): SvgNode {
  return { t: 'g', a, c }
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch])
}

export function toSvgString(node: SvgNode): string {
  const attrs = Object.entries(node.a ?? {})
    .map(([k, v]) => ` ${k}="${escapeXml(String(v))}"`)
    .join('')
  const inner = node.text !== undefined ? escapeXml(node.text) : (node.c ?? []).map(toSvgString).join('')
  return `<${node.t}${attrs}>${inner}</${node.t}>`
}

// stroke-width -> strokeWidth; React SVG özelliklerini camelCase bekler.
export function reactProps(a: Attrs | undefined): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(a ?? {})) {
    if (k === 'class') out.className = v
    else out[k.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase())] = v
  }
  return out
}
