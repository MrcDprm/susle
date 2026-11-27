'use client'

import { useState } from 'react'
import { dict, type Lang } from '@/lib/i18n'
import { CopyField } from './CopyField'
import { Reminder, ShareTools } from './ShareTools'

// Ağaç açılır açılmaz gelen pencere. Sahip linki kaydedilmeden kapanmaz; linki kaybeden
// ağacını başka cihazdan yönetemez.
export function Welcome({ lang, treeId, treeName, shareUrl, ownerUrl, revealAt, onDone }: {
  lang: Lang
  treeId: string
  treeName: string
  shareUrl: string
  ownerUrl: string
  revealAt: string
  onDone: () => void
}) {
  const t = dict(lang)
  const [saved, setSaved] = useState(false)

  return (
    <div className="welcome">
      <h2 className="patch-title">{t.welcome.title}</h2>
      <p className="welcome-lead">{t.welcome.lead}</p>

      <h3 className="step-title">
        <span>1</span> {t.welcome.share}
      </h3>
      <ShareTools lang={lang} treeId={treeId} shareUrl={shareUrl} />

      <h3 className="step-title">
        <span>2</span> {t.welcome.save}
      </h3>
      <div className="owner-key" onCopy={() => setSaved(true)}>
        <CopyField
          label={t.create.ownerLabel}
          hint={t.create.ownerHint}
          value={ownerUrl}
          copyLabel={t.owner.copyLink}
          copiedLabel={t.owner.copied}
          onCopied={() => setSaved(true)}
        />
      </div>

      <h3 className="step-title">
        <span>3</span> {t.welcome.remind}
      </h3>
      <Reminder lang={lang} treeId={treeId} treeName={treeName} revealAt={revealAt} shareUrl={shareUrl} compact />

      <label className="check welcome-check">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        <span>{t.welcome.confirm}</span>
      </label>
      <button type="button" className="btn welcome-done" disabled={!saved} onClick={onDone}>
        {t.welcome.done}
      </button>
    </div>
  )
}
