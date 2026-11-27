'use client'

import { useRef, useState } from 'react'

// Link giriş alanında değil okunur bir kutuda durur: dar ekranda iki satıra bölünür, kaymaz.
// Ekranda başındaki https:// gösterilmez, kopyalanan link tamdır.
export function CopyField({ label, hint, value, copyLabel, copiedLabel, onCopied }: {
  label: string
  hint?: string
  value: string
  copyLabel: string
  copiedLabel: string
  onCopied?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const text = useRef<HTMLSpanElement>(null)

  const selectText = () => {
    const el = text.current
    const selection = window.getSelection()
    if (!el || !selection) return
    const range = document.createRange()
    range.selectNodeContents(el)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Pano izni yoksa link seçili hale gelir; kullanıcı elle kopyalayabilir.
      selectText()
    }
  }

  return (
    <div className="copy-field">
      <span className="field-label">{label}</span>
      <div className="copy-box">
        <span ref={text} className="copy-value" onClick={selectText}>
          {value.replace(/^https?:\/\//, '')}
        </span>
        <button type="button" className="btn-small copy-btn" onClick={copy}>
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}
