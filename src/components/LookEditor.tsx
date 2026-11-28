'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { base, LIGHT_SETS, ribbon, topper } from '@/lib/art/decor'
import { TREE_STYLE_COUNT } from '@/lib/art/tree'
import { dict, type Lang } from '@/lib/i18n'
import { LOOK_OPTIONS, type Look, type LookKey } from '@/lib/look'
import { previewSong } from '@/lib/music'
import { MAX_NOTE } from '@/lib/validation'
import { MiniTree, renderNode } from './Art'
import { Backdrop, Ground } from './scene/Ground'
import { SkyLayers } from './scene/Sky'
import { TreeView, type TreeOrnament } from './TreeView'

export type Draft = { style: number; look: Look; note: string }

// Seçilen her şeyin birlikte göründüğü küçük sahne: gökyüzü, manzara, kar ve ağaç.
export function ScenePreview({ draft, ornaments, total, growth, title }: {
  draft: Draft
  ornaments: TreeOrnament[]
  total: number
  growth: number
  title: string
}) {
  const { look } = draft
  return (
    <div className={`scene-preview sky-${look.sky} snow-${look.snow}`}>
      <div className="preview-sky">
        <SkyLayers />
      </div>
      <Backdrop scene={look.scene} />
      <Ground scene={look.scene} />
      <div className="preview-tree">
        <TreeView style={draft.style} ornaments={ornaments} total={total} title={title} look={look} growth={growth} />
      </div>
      <div className="preview-snow" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  )
}

// Ağacın görünüm seçenekleri. Değer dışarıda tutulur; ağaç açarken de sahibin süsle penceresinde de aynı bileşen.
export function LookEditor({ lang, draft, onChange, ornaments, total, growth, title }: {
  lang: Lang
  draft: Draft
  onChange: Dispatch<SetStateAction<Draft>>
  ornaments: TreeOrnament[]
  total: number
  growth: number
  title: string
}) {
  const t = dict(lang)
  const c = t.customize
  const set = (key: LookKey, value: number) => {
    if (key === 'music') previewSong(value)
    onChange((d) => ({ ...d, look: { ...d.look, [key]: value } }))
  }

  const row = (key: LookKey, render?: (i: number) => ReactNode, kind: 'icon' | 'text' | 'wide' = 'icon') => (
    <OptionGrid
      label={c.groups[key]}
      count={LOOK_OPTIONS[key]}
      value={draft.look[key]}
      onChange={(v) => set(key, v)}
      names={c.options[key]}
      render={render}
      kind={kind}
    />
  )

  return (
    <div className="look-editor">
      <div className="customize-preview">
        <ScenePreview draft={draft} ornaments={ornaments} total={total} growth={growth} title={title} />
      </div>

      <h2 className="patch-title">{c.title}</h2>
      <p className="welcome-lead">{c.lead}</p>

      <OptionGrid
        label={c.groups.style}
        count={TREE_STYLE_COUNT}
        value={draft.style}
        onChange={(style) => onChange((d) => ({ ...d, style }))}
        names={t.create.styles}
        render={(i) => <MiniTree style={i} />}
      />
      {row('topper', (i) => (
        <svg viewBox="140 12 100 96" aria-hidden="true" className="opt-icon">
          {renderNode(topper(i))}
        </svg>
      ))}
      {row('lights', (i) => (
        <svg viewBox="0 0 64 24" aria-hidden="true" className="opt-icon wide">
          <path d="M4 8 Q32 26 60 8" fill="none" stroke="#5b6680" strokeWidth={1.4} />
          {[12, 25, 39, 52].map((x, k) => {
            const set = LIGHT_SETS[i]
            return <circle key={x} cx={x} cy={x === 25 || x === 39 ? 15 : 12} r={set.length ? 4.5 : 4} fill={set.length ? set[k % set.length] : '#c4ccd9'} />
          })}
        </svg>
      ))}
      {row('ribbon', (i) => (
        <svg viewBox="128 18 144 52" aria-hidden="true" className="opt-icon wide">
          <rect x={128} y={18} width={144} height={52} rx={8} fill="#2E6B47" />
          {i === 0 ? <path d="M150 44 L250 44" stroke="#5b8a6c" strokeWidth={3} strokeDasharray="4 6" /> : renderNode(ribbon(i, 36, 160, '')!)}
        </svg>
      ))}
      {row('base', (i) => (
        <svg viewBox="128 486 144 66" aria-hidden="true" className="opt-icon wide">
          <rect x={186} y={486} width={28} height={24} fill="#6E4426" />
          {base(i).map((n, k) => renderNode(n, k))}
        </svg>
      ))}
      {row(
        'scene',
        (i) => (
          <span className="opt-scene" aria-hidden="true">
            <Backdrop scene={i} className="mini" />
            <Ground scene={i} className="mini" />
          </span>
        ),
        'wide',
      )}
      {row('sky', (i) => <span className={`opt-sky s${i}`} aria-hidden="true" />, 'wide')}
      {row('snow', undefined, 'text')}
      {row('music', undefined, 'text')}

      <label className="field">
        <span className="field-label">{c.groups.note}</span>
        <input value={draft.note} onChange={(e) => {
            const note = e.target.value
            onChange((d) => ({ ...d, note }))
          }} maxLength={MAX_NOTE} placeholder={c.notePlaceholder} />
        <span className="hint">{c.noteHint}</span>
      </label>
    </div>
  )
}

// Seçenekler kaydırmasız bir ızgarada; telefonda da bilgisayarda da hepsi görünür.
function OptionGrid({ label, count, value, onChange, names, render, kind = 'icon' }: {
  label: string
  count: number
  value: number
  onChange: (v: number) => void
  names: readonly string[]
  render?: (i: number) => ReactNode
  kind?: 'icon' | 'text' | 'wide'
}) {
  return (
    <div className="opt-group" role="radiogroup" aria-label={label}>
      <span className="field-label">{label}</span>
      <div className={`opt-grid is-${kind}`}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            className={`opt ${value === i ? 'is-on' : ''}`}
            onClick={() => onChange(i)}
          >
            {render?.(i)}
            <span className="opt-name">{names[i]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
