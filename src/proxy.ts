import { NextResponse, type NextRequest } from 'next/server'

// Her sayfa isteğinde yeni bir nonce üretilir; yalnızca bu nonce'u taşıyan betikler çalışır.
// Türkçe sayfalar önek almaz: /a/x içeride /tr/a/x olarak işlenir.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'
  const turnstile = 'https://challenges.cloudflare.com'
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self' ${turnstile}`,
    `frame-src ${turnstile}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const { pathname } = request.nextUrl
  const prefixed = /^\/(en|tr)(\/|$)/.test(pathname)
  const response = prefixed
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.rewrite(new URL(`/tr${pathname === '/' ? '' : pathname}${request.nextUrl.search}`, request.url), {
        request: { headers: requestHeaders },
      })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  // Ön yüklemeler de dil yönlendirmesine ihtiyaç duyduğu için dışarıda bırakılmaz.
  matcher: ['/((?!api|y/|_next/static|_next/image|icon.svg|apple-icon|robots.txt|sitemap.xml|favicon.ico).*)'],
}
