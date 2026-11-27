// Instagram, TikTok gibi uygulamalar linkleri kendi içlerindeki tarayıcıda açar. Bu tarayıcılar
// takvim dosyasını telefonun takvimine iletmez ve Google oturumu taşımaz; kullanıcıyı gerçek
// tarayıcıya geçirmek gerekir.

export type InApp = { app: string; platform: 'ios' | 'android' | 'other' }

const APPS: [RegExp, string][] = [
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, 'Facebook'],
  [/musical_ly|BytedanceWebview|TikTok/i, 'TikTok'],
  [/LinkedInApp/i, 'LinkedIn'],
  [/Snapchat/i, 'Snapchat'],
  [/Line\//i, 'LINE'],
]

export function detectInApp(ua: string): InApp | null {
  const platform = /iPhone|iPad|iPod/i.test(ua) ? 'ios' : /Android/i.test(ua) ? 'android' : 'other'
  for (const [re, app] of APPS) if (re.test(ua)) return { app, platform }
  // iPhone'da Safari ve diğer gerçek tarayıcılar kimliklerinde Safari/ taşır; uygulama içi
  // tarayıcılar taşımaz. Android'de uygulama içi tarayıcı kimliğe wv yazar.
  if (platform === 'ios' && !/Safari\//.test(ua)) return { app: '', platform }
  if (platform === 'android' && /; wv\)/.test(ua)) return { app: '', platform }
  return null
}

// Sayfayı gerçek tarayıcıda açan adres. Android'de intent adresi varsayılan tarayıcıyı açar,
// iPhone'da x-safari-https iOS 17 ve sonrasında Safari'yi açar.
export function openInBrowserUrl(href: string, platform: InApp['platform']): string {
  const url = new URL(href)
  if (platform === 'android') {
    return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(url.href)};end`
  }
  if (platform === 'ios') return `x-safari-${url.href}`
  return url.href
}
