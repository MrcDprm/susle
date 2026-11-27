import Link from 'next/link'
import { dict } from '@/lib/i18n'

// Dil parametresine buradan ulaşılamıyor; iki dil birlikte gösterilir.
export default function NotFound() {
  const tr = dict('tr').notFound
  const en = dict('en').notFound
  return (
    <main className="wrap not-found">
      <h1>{tr.title}</h1>
      <p>{tr.body}</p>
      <p>
        <Link className="btn" href="/">
          {tr.cta}
        </Link>
      </p>
      <p className="hint" lang="en">
        {en.title} {en.body} <Link href="/en">{en.cta}</Link>
      </p>
    </main>
  )
}
