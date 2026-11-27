import Link from 'next/link'
import { dict, localePath, type Lang } from '@/lib/i18n'
import { SoundToggle } from './SoundToggle'

export function Header({ lang, otherPath }: { lang: Lang; otherPath: string }) {
  const t = dict(lang)
  return (
    <header className="header">
      <Link href={localePath(lang, '/')} className="wordmark">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l1.8 3.9 4.2.5-3.1 2.9.8 4.2L12 11.4l-3.7 2.1.8-4.2L6 6.4l4.2-.5z" fill="#F2C14E" />
          <path d="M12 9l7 12H5z" fill="#2E6B47" />
        </svg>
        Süsle
      </Link>
      <div className="header-right">
        <Link href={otherPath} className="lang-link" hrefLang={lang === 'tr' ? 'en' : 'tr'} prefetch={false}>
          {t.otherLang}
        </Link>
        <SoundToggle lang={lang} />
      </div>
    </header>
  )
}
