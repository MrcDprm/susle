import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { COLORS as C } from './art/palette'
import { treeSvgString } from './art/tree'
import { dict, type Lang } from './i18n'
import { isRevealed, revealYear } from './reveal'
import { siteUrl } from './server'
import type { Tree } from './trees'

type Font = { name: string; data: ArrayBuffer; weight: 500 | 700; style: 'normal' }
let fonts: Promise<Font[]> | null = null

// Rubik iki dosya halinde: latin ve Türkçe harfleri içeren latin-ext. Aynı ailenin parçaları.
function loadFonts(): Promise<Font[]> {
  fonts ??= Promise.all(
    [
      ['Rubik', 'rubik-latin-500-normal.woff', 500],
      ['RubikExt', 'rubik-latin-ext-500-normal.woff', 500],
      ['Rubik', 'rubik-latin-700-normal.woff', 700],
      ['RubikExt', 'rubik-latin-ext-700-normal.woff', 700],
    ].map(async ([name, file, weight]) => {
      const buf = await readFile(path.join(process.cwd(), 'assets', 'fonts', file as string))
      const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
      return { name: name as string, data, weight: weight as 500 | 700, style: 'normal' as const }
    }),
  )
  return fonts
}

const FONT = 'Rubik, RubikExt'
const CACHE = { 'Cache-Control': 'public, max-age=300, s-maxage=300' }

function svgSrc(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// Sabit tohumlu rastgele sayı: aynı görsel her seferinde aynı karla çizilir.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

// Gökyüzü, yıldızlar, ay, kar taneleri ve en altta karlı tepeler. groundY: tepelerin başladığı yükseklik.
function sceneSvg(width: number, height: number, groundY: number): string {
  const rnd = seeded(width * 7 + height)
  const dots: string[] = []
  for (let i = 0; i < 60; i++) {
    const x = rnd() * width
    const y = rnd() * groundY * 0.7
    dots.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + rnd() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`)
  }
  for (let i = 0; i < 90; i++) {
    const x = rnd() * width
    const y = rnd() * groundY
    dots.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2 + rnd() * 4).toFixed(1)}" fill="#fff" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`)
  }
  const g = groundY
  const w = width
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${height}" viewBox="0 0 ${w} ${height}">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.gokUst}"/><stop offset="0.6" stop-color="${C.gokOrta}"/><stop offset="1" stop-color="${C.gokAlt}"/></linearGradient>
<radialGradient id="moon"><stop offset="0.55" stop-color="#FFF6DA"/><stop offset="0.7" stop-color="#FFF6DA" stop-opacity="0.25"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></radialGradient></defs>
<rect width="${w}" height="${height}" fill="url(#sky)"/>
<circle cx="${w * 0.82}" cy="${height * 0.09}" r="${w * 0.09}" fill="url(#moon)"/>
${dots.join('')}
<path d="M0 ${g + 30} Q${w * 0.15} ${g - 25} ${w * 0.33} ${g + 5} T${w * 0.66} ${g - 5} T${w} ${g + 10} L${w} ${height} L0 ${height} Z" fill="#B9C8E0"/>
<path d="M0 ${g + 70} Q${w * 0.2} ${g + 35} ${w * 0.45} ${g + 55} T${w} ${g + 50} L${w} ${height} L0 ${height} Z" fill="#DCE6F3"/>
<path d="M0 ${g + 110} Q${w * 0.25} ${g + 80} ${w * 0.5} ${g + 95} T${w} ${g + 100} L${w} ${height} L0 ${height} Z" fill="${C.kar}"/>
</svg>`
}

export async function treeOgImage(tree: Tree | null, kinds: number[], total: number, lang: Lang) {
  const t = dict(lang)
  const tree4 = svgSrc(treeSvgString(tree?.style ?? 1, kinds, 380, total))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', color: C.yazi, fontFamily: FONT }}>
        <img src={svgSrc(sceneSvg(1200, 630, 520))} width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0 }} />
        <img src={tree4} width={380} height={532} style={{ position: 'absolute', left: 60, top: 64 }} />
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', left: 500, top: 0, right: 70, height: 520, justifyContent: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.altin }}>Süsle</div>
          <div style={{ fontSize: tree ? 64 : 56, fontWeight: 700, lineHeight: 1.1, marginTop: 14, wordBreak: 'break-word' }}>{tree ? tree.name : t.home.title}</div>
          <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.35, marginTop: 22, opacity: 0.92 }}>
            {tree ? t.meta.treeDescription : t.home.lead}
          </div>
          {tree && <div style={{ fontSize: 28, fontWeight: 500, marginTop: 18, color: C.altin }}>{t.tree.count(total)}</div>}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await loadFonts(), headers: CACHE },
  )
}

// Instagram hikayesi. Üst ve alt şeritte Instagram'ın kendi düğmeleri durduğu için içerik ortada toplanır.
// Gökyüzünde ağacın adı ve davet, karlı zeminde herkesi kendi ağacını açmaya çağıran yazı.
export async function treeStoryImage(tree: Tree, kinds: number[], total: number, lang: Lang) {
  const t = dict(lang)
  const revealed = isRevealed(tree.revealAt, new Date())
  const treeSvg = svgSrc(treeSvgString(tree.style, kinds, 640, total))
  const host = new URL(siteUrl()).host
  const groundY = 1360
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: FONT }}>
        <img src={svgSrc(sceneSvg(1080, 1920, groundY))} width={1080} height={1920} style={{ position: 'absolute', top: 0, left: 0 }} />
        <div style={{ position: 'absolute', top: 230, left: 80, right: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', color: C.yazi }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.08, textAlign: 'center', wordBreak: 'break-word' }}>{tree.name}</div>
          <div style={{ fontSize: 42, fontWeight: 500, lineHeight: 1.3, textAlign: 'center', marginTop: 22, paddingLeft: 30, paddingRight: 30 }}>
            {revealed ? t.story.revealed(total, revealYear(tree.revealAt)) : t.story.invite}
          </div>
          {!revealed && <div style={{ fontSize: 36, fontWeight: 500, color: C.altin, marginTop: 14 }}>{t.story.count(total)}</div>}
        </div>
        <img src={treeSvg} width={640} height={896} style={{ position: 'absolute', left: 220, top: groundY + 80 - 896 }} />
        <div style={{ position: 'absolute', top: 1520, left: 110, right: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', color: C.koyu }}>
          <div style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.35, textAlign: 'center' }}>{t.story.promo}</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.kirmizi, marginTop: 14 }}>{host}</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await loadFonts(), headers: CACHE },
  )
}
