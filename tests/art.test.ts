import { describe, expect, it } from 'vitest'
import { escapeXml, h, reactProps, toSvgString } from '@/lib/art/node'
import { ORNAMENT_COUNT } from '@/lib/art/ornaments'
import { presentCount, slotPlace, TREE_STYLE_COUNT, treeSvgString } from '@/lib/art/tree'
import { ORNAMENT_KINDS, TREE_STYLES } from '@/lib/validation'

describe('çizimler', () => {
  it('her süs türünün bir çizimi var', () => {
    expect(ORNAMENT_COUNT).toBe(ORNAMENT_KINDS)
    expect(TREE_STYLE_COUNT).toBe(TREE_STYLES)
  })

  it('bir daldaki 24 süsün askı yerleri birbirinden farklı', () => {
    const places = new Set(Array.from({ length: 24 }, (_, i) => `${slotPlace(i).x},${slotPlace(i).y}`))
    expect(places.size).toBe(24)
  })

  it('hediye kutuları süs sayısıyla artar ve 5te durur', () => {
    expect(presentCount(0)).toBe(0)
    expect(presentCount(1)).toBe(1)
    expect(presentCount(11)).toBe(3)
    expect(presentCount(400)).toBe(5)
  })

  it('SVG metninde özel karakterler kaçışlanır', () => {
    expect(escapeXml(`<a href="x">'&`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;')
    expect(toSvgString(h('text', { 'data-x': '"><script>' }))).toBe('<text data-x="&quot;&gt;&lt;script&gt;"></text>')
  })

  it('paylaşım görseli için ağaç geçerli bir SVG üretir', () => {
    const svg = treeSvgString(1, [0, 5, 11], 400)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox="0 0 400 560"')
  })

  it('React özellik adları camelCase olur', () => {
    expect(reactProps({ 'stroke-width': 2, class: 'a', viewBox: '0 0 1 1' })).toEqual({ strokeWidth: 2, className: 'a', viewBox: '0 0 1 1' })
  })
})
