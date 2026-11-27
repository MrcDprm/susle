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

// Sayfayı gerçek tarayıcıda açan adres.
// Instagram iPhone: uygulamanın kendi extbrowser adresi; Instagram onay sorar, sonra Safari açılır.
// Instagram x-safari-https adresini sessizce yutuyor.
// Diğer iPhone uygulamaları: x-safari-https, iOS 17 ve sonrasında Safari'yi açar.
// Android: intent adresi varsayılan tarayıcıyı açar.
export function openInBrowserUrl(href: string, inApp: InApp): string {
  const url = new URL(href)
  if (inApp.platform === 'android') {
    return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(url.href)};end`
  }
  if (inApp.platform === 'ios' && inApp.app === 'Instagram') return `instagram://extbrowser/?url=${encodeURIComponent(url.href)}`
  if (inApp.platform === 'ios') return `x-safari-${url.href}`
  return url.href
}

// Kendiliğinden geçiş denenecek durumlar: denenmiş yollar. Adı bilinmeyen iPhone uygulamalarında
// sayfa yerinde kalır, düğme ve tarif görünür.
export function canAutoEscape(inApp: InApp): boolean {
  if (inApp.platform === 'android') return true
  return inApp.platform === 'ios' && (inApp.app === 'Instagram' || inApp.app === 'Facebook')
}
