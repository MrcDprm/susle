'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react'
import { customizeTreeAction } from '@/app/actions'
import { base, LIGHT_SETS, topper } from '@/lib/art/decor'
import { TREE_STYLE_COUNT } from '@/lib/art/tree'
import { dict, type Lang } from '@/lib/i18n'
import { LOOK_OPTIONS, type Look, type LookKey } from '@/lib/look'
import { setSong } from '@/lib/music'
import { MAX_NOTE } from '@/lib/validation'
import { MiniTree, renderNode } from './Art'
import { applySceneLook } from './sceneLook'
import { TreeView, type TreeOrnament } from './TreeView'

type Props = {
  lang: Lang
  treeId: string
  style: number
  look: Look
  note: string | null
  ornaments: TreeOrnament[]
  total: number
  growth: number
  onClose: () => void
}

// Ağacını süsle: üstte canlı önizleme, altında seçenek satırları. Gökyüzü, kar ve müzik
// arkadaki sahnede de anında değişir; vazgeçilirse eski haline döner.
export function Customize(p: Props) {
  const t = dict(p.lang)
  const c = t.customize
  const router = useRouter()
  const [style, setStyle] = useState(p.style)
  const [look, setLook] = useState<Look>(p.look)
  const [note, setNote] = useState(p.note ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  useEffect(() => {
    applySceneLook(look)
    setSong(look.music)
  }, [look])

  const close = () => {
    applySceneLook(p.look)
    setSong(p.look.music)
    p.onClose()
  }

  const save = () =>
    start(async () => {
      setError(null)
      const r = await customizeTreeAction(p.treeId, { style, look, note })
      if (!r.ok) {
        setError(t.errors.generic)
        return
      }
      p.onClose()
      router.refresh()
    })

  const set = (key: LookKey, value: number) => setLook((l) => ({ ...l, [key]: value }))

  const row = (key: LookKey, render: (i: number) => ReactNode, wide?: boolean) => (
    <OptionRow
      label={c.groups[key]}
      count={LOOK_OPTIONS[key]}
      value={look[key]}
      onChange={(v) => set(key, v)}
      names={c.options[key]}
      render={render}
      wide={wide}
    />
  )

  return (
    <div className="customize">
      <div className="customize-preview">
        <TreeView style={style} ornaments={p.ornaments} total={p.total} title={p.ornaments.length ? '' : c.title} look={look} growth={p.growth} />
      </div>
      <h2 className="patch-title">{c.title}</h2>
      <p className="welcome-lead">{c.lead}</p>

      <OptionRow
        label={c.groups.style}
        count={TREE_STYLE_COUNT}
        value={style}
        onChange={setStyle}
        names={t.create.styles}
        render={(i) => <MiniTree style={i} />}
      />
      {row('topper', (i) => (
        <svg viewBox="160 12 80 80" aria-hidden="true" className="opt-icon">
          {renderNode(topper(i))}
        </svg>
      ))}
      {row('lights', (i) => (
        <svg viewBox="0 0 64 24" aria-hidden="true" className="opt-icon wide">
          <path d="M4 8 Q32 26 60 8" fill="none" stroke="#5b6680" strokeWidth={1.4} />
          {LIGHT_SETS[i].length === 0
            ? [12, 25, 39, 52].map((x) => <circle key={x} cx={x} cy={x === 25 || x === 39 ? 15 : 12} r={4} fill="#c4ccd9" />)
            : [12, 25, 39, 52].map((x, k) => (
                <circle key={x} cx={x} cy={x === 25 || x === 39 ? 15 : 12} r={4.5} fill={LIGHT_SETS[i][k % LIGHT_SETS[i].length]} />
              ))}
        </svg>
      ))}
      {row('ribbon', (i) => <span className={`opt-ribbon r${i}`} aria-hidden="true" />)}
      {row('base', (i) => (
        <svg viewBox="135 488 130 64" aria-hidden="true" className="opt-icon wide">
          {base(i).map((n, k) => renderNode(n, k))}
        </svg>
      ))}
      {row('scene', () => null, true)}
      {row('sky', () => null, true)}
      {row('snow', () => null, true)}
      {row('music', () => null, true)}

      <label className="field">
        <span className="field-label">{c.groups.note}</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={MAX_NOTE} placeholder={c.notePlaceholder} />
        <span className="hint">{c.noteHint}</span>
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions customize-actions">
        <button type="button" className="btn-ghost" onClick={close}>
          {c.later}
        </button>
        <button type="button" className="btn" onClick={save} disabled={pending}>
          {pending ? c.saving : c.save}
        </button>
      </div>
    </div>
  )
}

function OptionRow({ label, count, value, onChange, names, render, wide }: {
  label: string
  count: number
  value: number
  onChange: (v: number) => void
  names: readonly string[]
  render: (i: number) => ReactNode
  wide?: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  // Açılışta seçili seçenek görünür olsun; satır sağa kayıksa yalnızca yatayda kaydırılır.
  useEffect(() => {
    const row = rowRef.current
    const on = row?.querySelector<HTMLElement>('.is-on')
    if (!row || !on) return
    const offset = on.getBoundingClientRect().left - row.getBoundingClientRect().left
    if (offset + on.offsetWidth > row.clientWidth) row.scrollLeft += offset - 12
    // Yalnızca ilk açılışta; seçim değişince kullanıcının kaydırması bozulmaz.
  }, [])

  return (
    <div className="opt-group" role="radiogroup" aria-label={label}>
      <span className="field-label">{label}</span>
      <div ref={rowRef} className={`opt-row ${wide ? 'is-text' : ''}`}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            className={`opt ${value === i ? 'is-on' : ''}`}
            onClick={() => onChange(i)}
          >
            {render(i)}
            <span className="opt-name">{names[i]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
