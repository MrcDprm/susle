'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteTreeAction, renameTreeAction, setAcceptingAction } from '@/app/actions'
import { dict, localePath, type Lang } from '@/lib/i18n'
import { MAX_TREE_NAME } from '@/lib/validation'
import { CopyField } from './CopyField'
import { Reminder, ShareTools } from './ShareTools'

type Props = {
  lang: Lang
  treeId: string
  name: string
  accepting: boolean
  revealed: boolean
  shareUrl: string
  ownerUrl: string
  revealAt: string
  onClose: () => void
}

export function OwnerPanel({ lang, treeId, name, accepting, revealed, shareUrl, ownerUrl, revealAt, onClose }: Props) {
  const t = dict(lang)
  const router = useRouter()
  const [newName, setNewName] = useState(name)
  const [note, setNote] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean }>, done?: string) =>
    start(async () => {
      const r = await fn()
      setNote(r.ok ? (done ?? null) : t.errors.generic)
      if (r.ok) router.refresh()
    })

  const removeTree = () => {
    if (!window.confirm(t.owner.deleteTreeConfirm)) return
    start(async () => {
      const r = await deleteTreeAction(treeId)
      if (r.ok) router.push(localePath(lang, '/'))
      else setNote(t.errors.generic)
    })
  }

  return (
    <section className="owner" aria-labelledby="owner-title">
      <h2 id="owner-title" className="patch-title">
        {t.owner.title}
      </h2>

      <ShareTools lang={lang} treeId={treeId} shareUrl={shareUrl} />
      {!revealed && <Reminder lang={lang} treeId={treeId} treeName={name} revealAt={revealAt} shareUrl={shareUrl} />}

      {!revealed && (
        <label className="check">
          <input
            type="checkbox"
            checked={accepting}
            disabled={pending}
            onChange={(e) => {
              const value = e.target.checked
              run(() => setAcceptingAction(treeId, value))
            }}
          />
          <span>{t.owner.accepting}</span>
        </label>
      )}

      <form
        className="rename"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => renameTreeAction(treeId, newName), t.owner.saved)
        }}
      >
        <label className="field">
          <span className="field-label">{t.owner.rename}</span>
          <span className="copy-row">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={MAX_TREE_NAME} />
            <button className="btn-small" disabled={pending || newName.trim() === '' || newName === name}>
              {t.owner.save}
            </button>
          </span>
        </label>
      </form>

      <CopyField label={t.owner.ownerLink} hint={t.owner.ownerLinkHint} value={ownerUrl} copyLabel={t.owner.copyLink} copiedLabel={t.owner.copied} />

      {note && (
        <p className="hint" role="status">
          {note}
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn-danger" onClick={removeTree} disabled={pending}>
          {t.owner.deleteTree}
        </button>
        <button type="button" className="btn-small" onClick={onClose}>
          {t.card.close}
        </button>
      </div>
    </section>
  )
}
