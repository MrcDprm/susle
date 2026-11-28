'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { hangOrnamentAction } from '@/app/actions'
import { dict, type Lang } from '@/lib/i18n'
import { MAX_BODY, MAX_NAME, ORNAMENT_KINDS } from '@/lib/validation'
import { OrnamentIcon } from './Art'
import { Turnstile } from './Turnstile'

export function HangForm({ lang, treeId, siteKey, onDone, onCancel }: {
  lang: Lang
  treeId: string
  siteKey: string
  onDone: (index: number, id: string) => void
  onCancel: () => void
}) {
  const t = dict(lang)
  const [kind, setKind] = useState(0)
  const [authorName, setAuthorName] = useState('')
  const [body, setBody] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [widgetKey, setWidgetKey] = useState(0)
  const [pending, start] = useTransition()
  const [suggestAt, setSuggestAt] = useState(0)
  const ideas = t.suggest.items
  const shown = [0, 1, 2].map((k) => ideas[(suggestAt + k) % ideas.length])

  // Öneri metni boş kutuya yazılır, doluysa sonuna eklenir; sınırı aşmaz.
  const addIdea = (idea: string) => {
    setBody((b) => {
      const next = b.trim() === '' ? idea : `${b.trimEnd()} ${idea}`
      return [...next].length > MAX_BODY ? b : next
    })
  }

  const length = [...body].length

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError(null)
    start(async () => {
      const r = await hangOrnamentAction({ treeId, kind, authorName, body, isPublic, token })
      if (r.ok) {
        onDone(r.index, r.id)
        return
      }
      const messages: Record<string, string> = {
        invalid: t.errors.invalid,
        bot: t.errors.bot,
        rate: t.errors.rate,
        closed: t.tree.closed,
        revealed: t.card.locked,
        full: t.tree.full,
        missing: t.errors.missing,
      }
      setError(messages[r.error] ?? t.errors.generic)
      // Turnstile jetonu tek kullanımlık; yeni deneme için kutu yenilenir.
      setToken(null)
      setWidgetKey((k) => k + 1)
    })
  }

  return (
    <form className="hang" onSubmit={submit} noValidate>
      <h2 className="patch-title">{t.hang.title}</h2>
      <fieldset className="picker">
        <legend className="field-label">{t.hang.kindLabel}</legend>
        {Array.from({ length: ORNAMENT_KINDS }, (_, k) => (
          <label key={k} className={`pick ${kind === k ? 'is-on' : ''}`} title={t.ornaments[k]}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} aria-label={t.ornaments[k]} />
            <OrnamentIcon kind={k} />
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span className="field-label">{t.hang.nameLabel}</span>
        <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={MAX_NAME} autoComplete="nickname" />
        <span className="hint">{t.hang.nameHint}</span>
      </label>
      <div className="suggest">
        <span className="hint">{t.suggest.label}</span>
        <div className="suggest-row">
          {shown.map((idea) => (
            <button key={idea} type="button" className="idea" onClick={() => addIdea(idea)}>
              {idea}
            </button>
          ))}
          <button type="button" className="idea idea-more" onClick={() => setSuggestAt((n) => (n + 3) % ideas.length)}>
            {t.suggest.more}
          </button>
        </div>
      </div>
      <label className="field">
        <span className="field-label">{t.hang.bodyLabel}</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} required />
        <span className={`counter ${length > MAX_BODY ? 'is-over' : ''}`}>
          {length}/{MAX_BODY}
        </span>
      </label>
      <label className="check">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        <span>
          {t.hang.publicLabel}
          <span className="hint">{t.hang.publicHint}</span>
        </span>
      </label>
      <p className="lock-note">{t.hang.lockNote}</p>
      <Turnstile key={widgetKey} siteKey={siteKey} lang={lang} onToken={setToken} />
      {!token && <p className="hint">{t.hang.verifying}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          {t.hang.cancel}
        </button>
        <button className="btn" disabled={pending || !token || length === 0 || length > MAX_BODY}>
          {pending ? t.hang.pending : t.hang.submit}
        </button>
      </div>
    </form>
  )
}
