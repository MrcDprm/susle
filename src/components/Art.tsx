import { createElement, type ReactNode } from 'react'
import { reactProps, type SvgNode } from '@/lib/art/node'
import { ornamentNodes } from '@/lib/art/ornaments'
import { TREE_VIEWBOX, treeBody } from '@/lib/art/tree'

export function renderNode(node: SvgNode, key?: string | number): ReactNode {
  if (node.text !== undefined) return createElement(node.t, { key, ...reactProps(node.a) }, node.text)
  return createElement(node.t, { key, ...reactProps(node.a) }, ...(node.c ?? []).map((c, i) => renderNode(c, i)))
}

export function TreeBase({ style, presents = 0, prefix }: { style: number; presents?: number; prefix: string }) {
  return <>{renderNode(treeBody(style, { presents, prefix }))}</>
}

export function OrnamentIcon({ kind }: { kind: number }) {
  return (
    <svg viewBox="-20 -3 40 42" aria-hidden="true" className="orn-icon">
      {ornamentNodes(kind).map((n, i) => renderNode(n, i))}
    </svg>
  )
}

export function MiniTree({ style }: { style: number }) {
  return (
    <svg viewBox={TREE_VIEWBOX} aria-hidden="true" className="mini-tree">
      <TreeBase style={style} prefix={`mini${style}`} />
    </svg>
  )
}
