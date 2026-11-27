'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import { createTreeAction } from '@/app/actions'
import { dict, localePath, type Lang } from '@/lib/i18n'
import { MAX_TREE_NAME } from '@/lib/validation'
import { MiniTree } from './Art'

export function CreateTree({ lang }: { lang: Lang }) {
  const t = dict(lang)
  const [name, setName] = useState('')
  const [style, setStyle] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [pending, start] = useTransition()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    start(async () => {
      const r = await createTreeAction({ name, style, lang })
      // Ağaç sayfasına geçilir; orada paylaşım penceresi kendiliğinden açılır.
      if (r.ok) router.push(`${localePath(lang, `/a/${r.id}`)}?yeni=1`)
      else setError(r.error === 'name' ? t.create.nameError : r.error === 'rate' ? t.errors.rate : t.errors.generic)
    })
  }

  return (
    <form className="patch create" onSubmit={submit} noValidate>
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
      <fieldset className="styles">
        <legend className="field-label">{t.create.styleLabel}</legend>
        {t.create.styles.map((label, i) => (
          <label key={label} className={`style-option ${style === i ? 'is-on' : ''}`}>
            <input type="radio" name="style" value={i} checked={style === i} onChange={() => setStyle(i)} />
            <MiniTree style={i} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn" disabled={pending}>
        {pending ? t.create.pending : t.create.submit}
      </button>
    </form>
  )
}
