import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// iPhone ana ekran ikonu, favicon SVG'sinden üretilir.
export default async function AppleIcon() {
  const svg = await readFile(path.join(process.cwd(), 'src', 'app', 'icon.svg'))
  const src = `data:image/svg+xml;base64,${svg.toString('base64')}`
  return new ImageResponse(<img src={src} width={180} height={180} />, size)
}
