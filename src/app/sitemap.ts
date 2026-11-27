import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/server'

export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl()
  const languages = { tr: `${site}/`, en: `${site}/en` }
  return [
    { url: `${site}/`, changeFrequency: 'monthly', priority: 1, alternates: { languages } },
    { url: `${site}/en`, changeFrequency: 'monthly', priority: 0.8, alternates: { languages } },
  ]
}
