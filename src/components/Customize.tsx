'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { customizeTreeAction } from '@/app/actions'
import { dict, type Lang } from '@/lib/i18n'
import type { Look } from '@/lib/look'
import { setSong, stopPreview } from '@/lib/music'
import { Dialog } from './Dialog'
import { LookEditor, type Draft } from './LookEditor'
import type { TreeOrnament } from './TreeView'

type Props = {
  open: boolean
  lang: Lang
  treeId: string
  title: string
  style: number
  look: Look
  note: string | null
  ornaments: TreeOrnament[]
  total: number
  growth: number
  onClose: () => void
}

const same = (a: Draft, b: Draft) => a.style === b.style && a.note.trim() === b.note.trim() && JSON.stringify(a.look) === JSON.stringify(b.look)

// Sahibin süsle penceresi. Değişiklikler önizlemede anında görünür ama kaydedilmeden ağaca geçmez.
// Kaydedilmemiş değişiklikle pencereden çıkılmak istenirse önce sorulur: kaydet, kaydetmeden çık ya da geri dön.
export function Customize(p: Props) {
  const t = dict(p.lang)
  const c = t.customize
  const router = useRouter()
  const saved: Draft = { style: p.style, look: p.look, note: p.note ?? '' }
  const [draft, setDraft] = useState<Draft>(saved)
  const [ask, setAsk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const dirty = !same(draft, saved)

  // Pencere her açılışta ağacın kayıtlı haliyle başlar.
  const savedKey = JSON.stringify(saved)
  useEffect(() => {
    if (!p.open) return
    setDraft(JSON.parse(savedKey) as Draft)
    setAsk(false)
    setError(null)
  }, [p.open, savedKey])

  const leave = () => {
    stopPreview()
    setSong(saved.look.music)
    setAsk(false)
    p.onClose()
  }

  const requestClose = () => {
    if (pending) return
    if (ask) setAsk(false)
    else if (dirty) setAsk(true)
    else leave()
  }

  const save = () =>
    start(async () => {
      setError(null)
      const r = await customizeTreeAction(p.treeId, { style: draft.style, look: draft.look, note: draft.note })
      if (!r.ok) {
        setAsk(false)
        setError(t.errors.generic)
        return
      }
      stopPreview()
      setSong(draft.look.music)
      setAsk(false)
      p.onClose()
      router.refresh()
    })

  return (
    <Dialog open={p.open} onClose={p.onClose} onDismiss={requestClose} label={c.title} className="customize-dialog">
      <div className="customize">
        <LookEditor lang={p.lang} draft={draft} onChange={setDraft} ornaments={p.ornaments} total={p.total} growth={p.growth} title={p.title} />

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions customize-actions">
          <button type="button" className="btn-ghost" onClick={requestClose}>
            {c.cancel}
          </button>
          <button type="button" className="btn" onClick={save} disabled={pending || !dirty}>
            {pending ? c.saving : dirty ? c.save : c.noChanges}
          </button>
        </div>

        {ask && (
          <div className="ask" role="alertdialog" aria-modal="true" aria-labelledby="ask-title">
            <div className="ask-card">
              <h3 id="ask-title">{c.askTitle}</h3>
              <p>{c.askBody}</p>
              <button type="button" className="btn" onClick={save} disabled={pending}>
                {pending ? c.saving : c.askSave}
              </button>
              <button type="button" className="btn-small" onClick={leave} disabled={pending}>
                {c.askDiscard}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setAsk(false)} disabled={pending}>
                {c.askBack}
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
