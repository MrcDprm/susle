import { describe, expect, it } from 'vitest'
import { detectInApp, openInBrowserUrl } from '@/lib/inapp'

const UA = {
  instagramIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 356.0.0.31.89 (iPhone15,2; iOS 18_1; tr_TR; tr; scale=3.00; 1179x2556; 659813475)',
  instagramAndroid:
    'Mozilla/5.0 (Linux; Android 14; SM-S911B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 Instagram 356.0.0.41.101 Android',
  tiktokIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_35.1.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/tr Region/TR',
  genericIosWebview:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  androidWebview:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36',
  safariIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  chromeIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  desktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
}

describe('uygulama içi tarayıcı', () => {
  it('Instagram, TikTok ve adı bilinmeyen uygulama tarayıcılarını tanır', () => {
    expect(detectInApp(UA.instagramIos)).toEqual({ app: 'Instagram', platform: 'ios' })
    expect(detectInApp(UA.instagramAndroid)).toEqual({ app: 'Instagram', platform: 'android' })
    expect(detectInApp(UA.tiktokIos)).toEqual({ app: 'TikTok', platform: 'ios' })
    expect(detectInApp(UA.genericIosWebview)).toEqual({ app: '', platform: 'ios' })
    expect(detectInApp(UA.androidWebview)).toEqual({ app: '', platform: 'android' })
  })

  it('gerçek tarayıcıları uygulama içi saymaz', () => {
    for (const ua of [UA.safariIos, UA.chromeIos, UA.chromeAndroid, UA.desktop]) expect(detectInApp(ua)).toBeNull()
  })

  it('platforma göre tarayıcıda açma adresi üretir', () => {
    const href = 'https://susle.miracdeprem.com/a/abcdefgh23?dal=2'
    expect(openInBrowserUrl(href, 'ios')).toBe('x-safari-https://susle.miracdeprem.com/a/abcdefgh23?dal=2')
    const android = openInBrowserUrl(href, 'android')
    expect(android.startsWith('intent://susle.miracdeprem.com/a/abcdefgh23?dal=2#Intent;scheme=https;')).toBe(true)
    expect(android).toContain(`S.browser_fallback_url=${encodeURIComponent(href)}`)
    expect(openInBrowserUrl(href, 'other')).toBe(href)
  })
})
