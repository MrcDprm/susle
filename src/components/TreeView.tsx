'use client'

import { useId, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { ornamentNodes } from '@/lib/art/ornaments'
import { ornamentTransform, presentCount, slotPlace, TREE_VIEWBOX, TWINE_COLOR, twinePath, type TreeLook } from '@/lib/art/tree'
import { chime } from '@/lib/music'
import { renderNode, TreeBase } from './Art'
import { puffAt } from './scene/Snow'

export type TreeOrnament = { id: string; kind: number; label: string }

type Props = {
  style: number
  ornaments: TreeOrnament[]
  total?: number
  title: string
  newIndex?: number | null
  swingIndex?: number | null
  onSelect?: (index: number) => void
  className?: string
  look?: Partial<TreeLook>
  growth?: number
  // Bu tarayıcıdan asılan süsler; ağaçta işaretli görünür.
  mine?: ReadonlySet<string>
}

// Ağaç ve süsler tek SVG'de. Süsler klavyeyle de seçilebilen düğmelerdir.
// Ağacın gövdesine dokununca ağaç sallanır ve dallardan kar silkelenir.
export function TreeView({ style, ornaments, total, title, newIndex, swingIndex, onSelect, className, look, growth, mine }: Props) {
  const [shaking, setShaking] = useState(false)
  // Sayfada birden çok ağaç olabilir; degrade ve kırpma kimlikleri çakışmasın.
  const prefix = `tr${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  const activate = (i: number) => {
    chime('tap')
    onSelect?.(i)
  }
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      activate(i)
    }
  }
  const onTreeTap = (e: MouseEvent) => {
    if (!shaking) {
      setShaking(true)
      setTimeout(() => setShaking(false), 700)
    }
    chime('tap')
    puffAt(e.clientX, e.clientY)
  }

  return (
    <svg viewBox={TREE_VIEWBOX} className={`tree ${className ?? ''}`} role="group" aria-label={title}>
      <g className={shaking ? 'shake' : undefined}>
        <g onClick={onTreeTap} className="tree-tap">
          <TreeBase style={style} prefix={prefix} presents={presentCount(total ?? ornaments.length)} look={look} growth={growth} />
        </g>
        <g className="ornaments">
          {ornaments.map((o, i) => {
            const p = slotPlace(i)
            const classes = ['orn', `o${i % 6}`, i === newIndex ? 'is-new' : '', i === swingIndex ? 'is-swinging' : '', mine?.has(o.id) ? 'is-mine' : ''].join(' ')
            return (
              <g
                key={o.id}
                className={classes}
                role={onSelect ? 'button' : undefined}
                tabIndex={onSelect ? 0 : undefined}
                aria-label={o.label}
                onClick={onSelect ? () => activate(i) : undefined}
                onKeyDown={onSelect ? (e) => onKey(e, i) : undefined}
              >
                <path d={twinePath(p)} stroke={TWINE_COLOR} strokeWidth={1.4} fill="none" className="twine" />
                <g transform={ornamentTransform(p)}>
                  <g className="sway">
                    <circle className="mine-ring" cx={0} cy={20} r={24} />
                    <circle className="focus-ring" cx={0} cy={20} r={23} />
                    <circle className="hit" cx={0} cy={19} r={21} />
                    {ornamentNodes(o.kind).map((n, k) => renderNode(n, k))}
                  </g>
                </g>
              </g>
            )
          })}
        </g>
      </g>
    </svg>
  )
}
