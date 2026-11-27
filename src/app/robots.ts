import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/server'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/a/', '/en/a/', '/y/', '/api/hikaye/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
