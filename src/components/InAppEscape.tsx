'use client'

import { useEffect } from 'react'
import { canAutoEscape, detectInApp, openInBrowserUrl } from '@/lib/inapp'

const KEY = 'susle-tarayici-denendi'

// Site Instagram gibi bir uygulamanın içinden ilk açıldığında gerçek tarayıcıya geçmeyi önerir.
// Oturum başına bir kez denenir; kullanıcı Instagram'ın sorusuna hayır derse sayfa yerinde kalır
// ve düğmeler yine görünür.
export function InAppEscape() {
  useEffect(() => {
    const inApp = detectInApp(navigator.userAgent)
    if (!inApp || !canAutoEscape(inApp)) return
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch {
      return
    }
    const here = window.location.href.replace(/[?&]yeni=1/, '')
    // Facebook uygulaması sayfa yüklenirken gelen yönlendirmeyi bekletiyor; biraz gecikme gerekiyor.
    const delay = inApp.app === 'Facebook' ? 1500 : 500
    const timer = setTimeout(() => {
      window.location.href = openInBrowserUrl(here, inApp)
    }, delay)
    return () => clearTimeout(timer)
  }, [])
  return null
}
