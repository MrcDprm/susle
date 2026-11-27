'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// Yerel <dialog>: odak içeride kalır. Kapatılabilir olanlar Esc ve arka plana dokunmakla kapanır;
// dismissable false ise yalnızca içindeki düğmeyle kapanır.
export function Dialog({ open, onClose, label, children, className, dismissable = true }: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
  dismissable?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      // Tarayıcı ilk alana odaklanıp onu kaydırmasın; odak pencerenin kendisinde başlar.
      d.focus({ preventScroll: true })
      d.scrollTop = 0
    }
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`dialog ${className ?? ''}`}
      aria-label={label}
      tabIndex={-1}
      onCancel={(e) => {
        if (!dismissable) e.preventDefault()
      }}
      onClose={() => {
        // Tarayıcı ikinci Esc ile yine de kapatırsa kapanmaz pencere geri açılır.
        if (!dismissable && open) ref.current?.showModal()
        else onClose()
      }}
      onClick={(e) => {
        if (dismissable && e.target === ref.current) onClose()
      }}
    >
      {open && <div className="dialog-body">{children}</div>}
    </dialog>
  )
}
