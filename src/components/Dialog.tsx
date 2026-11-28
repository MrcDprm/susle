'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// Yerel <dialog>: odak içeride kalır. Kapatılabilir olanlar Esc ve arka plana dokunmakla kapanır;
// dismissable false ise yalnızca içindeki düğmeyle kapanır. onDismiss verilirse Esc ve arka plana
// dokunmak pencereyi kapatmaz, bu fonksiyonu çağırır; örneğin kaydedilmemiş değişiklik için soru sormak üzere.
export function Dialog({ open, onClose, label, children, className, dismissable = true, onDismiss }: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
  dismissable?: boolean
  onDismiss?: () => void
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
        if (!dismissable || onDismiss) e.preventDefault()
        if (dismissable && onDismiss) onDismiss()
      }}
      onClose={() => {
        // Tarayıcı ikinci Esc ile yine de kapatırsa kapanmaması gereken pencere geri açılır.
        if ((!dismissable || onDismiss) && open) {
          ref.current?.showModal()
          if (dismissable) onDismiss?.()
        } else onClose()
      }}
      onClick={(e) => {
        if (!dismissable || e.target !== ref.current) return
        if (onDismiss) onDismiss()
        else onClose()
      }}
    >
      {open && <div className="dialog-body">{children}</div>}
    </dialog>
  )
}
