'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import { createTreeAction } from '@/app/actions'
import { dict, localePath, type Lang } from '@/lib/i18n'
import { DEFAULT_LOOK } from '@/lib/look'
import { setSong, stopPreview } from '@/lib/music'
import { MAX_TREE_NAME } from '@/lib/validation'
import { Dialog } from './Dialog'
import { LookEditor, type Draft } from './LookEditor'

// Ağaç iki adımda açılır: önce ad, sonra ağacın türü, süsleri, manzarası ve müziği.
// Süsleme penceresi kapatılırsa seçimler kaybolmaz, ad kutusunun altındaki düğmeyle geri açılır.
export function CreateTree({ lang }: { lang: Lang }) {
  const t = dict(lang)
  const [name, setName] = useState('')
  const [draft, setDraft] = useState<Draft>({ style: 0, look: DEFAULT_LOOK, note: '' })
  const [decorating, setDecorating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [pending, start] = useTransition()

  const next = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length === 0) {
      setError(t.create.nameError)
      return
    }
    setError(null)
    setDecorating(true)
  }

  const close = () => {
    stopPreview()
    setSong(0)
    setDecorating(false)
  }

  const create = () =>
    start(async () => {
      setError(null)
      const r = await createTreeAction({ name, style: draft.style, lang, look: draft.look, note: draft.note })
      if (r.ok) {
        stopPreview()
        // Ağaç sayfasına geçilir; orada paylaşım penceresi kendiliğinden açılır.
        router.push(`${localePath(lang, `/a/${r.id}`)}?yeni=1`)
        return
      }
      setError(r.error === 'name' ? t.create.nameError : r.error === 'rate' ? t.errors.rate : t.errors.generic)
    })

  return (
    <>
      <form className="patch create" onSubmit={next} noValidate>
        <label className="field">
          <span className="field-label">{t.create.nameLabel}</span>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.create.namePlaceholder}
            maxLength={MAX_TREE_NAME}
            autoComplete="off"
            required
          />
        </label>
        <p className="hint">{t.create.decorateHint}</p>
        {error && !decorating && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn">{t.create.next}</button>
      </form>

      <Dialog open={decorating} onClose={close} onDismiss={close} label={t.customize.title} className="customize-dialog">
        <div className="customize">
          <LookEditor lang={lang} draft={draft} onChange={setDraft} ornaments={[]} total={0} growth={0} title={name} />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="actions customize-actions">
            <button type="button" className="btn-ghost" onClick={close}>
              {t.create.back}
            </button>
            <button type="button" className="btn" onClick={create} disabled={pending}>
              {pending ? t.create.pending : t.create.submit}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
