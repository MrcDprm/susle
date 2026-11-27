'use client'

import { useRef, useState } from 'react'

export function CopyField({ label, hint, value, copyLabel, copiedLabel, onCopied }: {
  label: string
  hint?: string
  value: string
  copyLabel: string
  copiedLabel: string
  onCopied?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Pano izni yoksa link seçili hale gelir; kullanıcı elle kopyalayabilir.
      input.current?.focus()
      input.current?.select()
    }
  }
  return (
    <div className="copy-field">
      <label>
        <span className="field-label">{label}</span>
        <span className="copy-row">
          <input ref={input} readOnly value={value} onClick={(e) => e.currentTarget.select()} />
          <button type="button" className="btn-small" onClick={copy}>
            {copied ? copiedLabel : copyLabel}
          </button>
        </span>
      </label>
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}
