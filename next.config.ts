import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // PGlite yalnızca yerel geliştirmede kullanılır; WASM dosyası paketlenmeden Node'dan yüklenir.
  serverExternalPackages: ['@electric-sql/pglite'],
  // Paylaşım görselleri yazı tiplerini diskten okur; Vercel'e bu dosyaların da gitmesi gerekir.
  outputFileTracingIncludes: { '/api/**': ['./assets/fonts/*.woff'] },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
