import type { NextRequest } from 'next/server'
import { treeOgImage } from '@/lib/share-image'

const DEMO = [6, 1, 7, 9, 2, 8, 0, 3, 11, 5, 10, 4, 1, 6, 9]

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('l') === 'en' ? 'en' : 'tr'
  return treeOgImage(null, DEMO, 0, lang)
}
