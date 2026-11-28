'use client'

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn-small btn-accent" onClick={() => window.print()}>
      {label}
    </button>
  )
}
