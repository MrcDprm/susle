import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { InAppEscape } from '@/components/InAppEscape'
import { Sky } from '@/components/scene/Sky'
import { dict, isLang, LANGS, localePath } from '@/lib/i18n'
import { siteUrl } from '@/lib/server'
import '../globals.css'

// Tek yazı ailesi; Türkçe harfler aynı tasarımın parçası, diğer harflerle tutarlı.
const rubik = Rubik({ subsets: ['latin', 'latin-ext'], variable: '--font-rubik' })

export const viewport: Viewport = { themeColor: '#0B1630', colorScheme: 'dark' }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const t = dict(lang)
  return {
    metadataBase: new URL(siteUrl()),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: localePath(lang, '/'),
      languages: { tr: '/', en: '/en', 'x-default': '/' },
    },
    openGraph: {
      type: 'website',
      siteName: 'Süsle',
      title: t.meta.title,
      description: t.meta.description,
      locale: lang === 'tr' ? 'tr_TR' : 'en_US',
      images: [{ url: `/api/og?l=${lang}`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  return (
    <html lang={lang} className={rubik.variable}>
      <body>
        <Sky />
        <InAppEscape />
        {children}
        <Footer />
      </body>
    </html>
  )
}
