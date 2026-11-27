'use client'

import { useParams } from 'next/navigation'
import { dict } from '@/lib/i18n'

// Beklenmeyen bir hata olursa ayrıntı gösterilmez; kısa bir açıklama ve yeniden deneme düğmesi.
export default function ErrorPage({ reset }: { reset: () => void }) {
  const params = useParams<{ lang?: string }>()
  const t = dict(params.lang === 'en' ? 'en' : 'tr')
  return (
    <main className="not-found">
      <h1>{t.errors.pageTitle}</h1>
      <p>{t.errors.pageBody}</p>
      <button type="button" className="btn" onClick={reset}>
        {t.errors.retry}
      </button>
    </main>
  )
}
