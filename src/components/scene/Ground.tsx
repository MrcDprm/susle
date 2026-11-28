// Manzaralar iki katman: uzak katman, yani Backdrop, dağları, uzak ağaç sıralarını, şehri, gölü ve denizi çizer.
// Yakın katman Ground, karlı tepelerin üstündeki evleri, ağaçları ve küçük ayrıntıları çizer.
// Uzak katman 800x200, yakın katman 800x110 birim; telefonda ortaları, geniş ekranda tamamı görünür.
// scene: 0 karlı köy, 1 çam ormanı, 2 şehir, 3 donmuş göl, 4 dağ evi, 5 sahil kasabası.

import type { ReactNode } from 'react'

const SNOW = '#F4F8FD'
const SNOW_SHADE = '#D5E0F0'
const WARM = '#FFC861'

// Sabit tohumlu rastgele sayı: manzara her açılışta aynı çizilir.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

/* ---------- Uzak katman ---------- */

type Peak = [cx: number, top: number, hw: number]

function Mountains({ peaks, base, tone, shade, cap, baseY = 200 }: { peaks: Peak[]; base?: string; tone: string; shade: string; cap: string; baseY?: number }) {
  return (
    <g>
      {peaks.map(([cx, top, hw], i) => {
        const height = baseY - top
        const capH = height * 0.26
        const capW = hw * (capH / height)
        return (
          <g key={i}>
            <path d={`M${cx - hw} ${baseY} L${cx} ${top} L${cx + hw} ${baseY} Z`} fill={tone} />
            <path d={`M${cx} ${top} L${cx + hw} ${baseY} L${cx + hw * 0.15} ${baseY} Z`} fill={shade} />
            <path
              d={`M${cx} ${top} L${cx + capW} ${top + capH} L${cx + capW * 0.45} ${top + capH * 0.78} L${cx + capW * 0.1} ${top + capH * 1.05} L${cx - capW * 0.3} ${top + capH * 0.72} L${cx - capW * 0.65} ${top + capH * 0.95} L${cx - capW} ${top + capH} Z`}
              fill={cap}
            />
            <path d={`M${cx} ${top} L${cx + capW} ${top + capH} L${cx + capW * 0.45} ${top + capH * 0.78} L${cx + capW * 0.1} ${top + capH * 1.05} Z`} fill={base ?? shade} opacity={0.25} />
          </g>
        )
      })}
    </g>
  )
}

// Uzak çam sırası: iki katlı küçük üçgenler, karlı uçlar.
function PineRow({ y, from, to, step, s, color, seed, snow = true }: { y: number; from: number; to: number; step: number; s: number; color: string; seed: number; snow?: boolean }) {
  const r = seeded(seed)
  const out: ReactNode[] = []
  for (let x = from; x < to; x += step * (0.7 + r() * 0.6)) {
    const k = s * (0.75 + r() * 0.5)
    const yy = y + r() * 4
    out.push(
      <g key={x} transform={`translate(${x.toFixed(1)} ${yy.toFixed(1)}) scale(${k.toFixed(2)})`}>
        <path d="M0 -20 L6 -9 L3.5 -9 L8 0 L-8 0 L-3.5 -9 L-6 -9 Z" fill={color} />
        {snow && <path d="M0 -20 L3 -14.5 L-3 -14.5 Z M-6 -9 L-3.5 -10.5 L3.5 -10.5 L6 -9 L0 -8 Z" fill={SNOW} opacity={0.75} />}
      </g>,
    )
  }
  return <g>{out}</g>
}

function Hill({ d, fill }: { d: string; fill: string }) {
  return <path d={d} fill={fill} />
}

function FarHouse({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-6} y={-7} width={12} height={8} fill="#2A2F52" />
      <path d="M-7.5 -6.5 L0 -13 L7.5 -6.5 Z" fill={SNOW} />
      <rect x={-3.5} y={-4.5} width={2.4} height={2.4} fill={WARM} className="window" />
      <rect x={1.2} y={-4.5} width={2.4} height={2.4} fill={WARM} className="window w2" />
    </g>
  )
}

function VillageFar() {
  return (
    <g>
      <Mountains peaks={[[80, 82, 120], [230, 58, 150], [400, 86, 120], [560, 62, 160], [720, 78, 130]]} tone="#2C3B68" shade="#25335C" cap="#B4C3E0" />
      <Mountains peaks={[[150, 112, 110], [330, 104, 120], [480, 116, 110], [650, 106, 120]]} tone="#243258" shade="#1F2B4E" cap="#9EB0D3" />
      <Hill d="M0 158 Q120 136 250 150 T500 146 T800 150 L800 200 L0 200 Z" fill="#8FA2C8" />
      <PineRow y={152} from={10} to={790} step={16} s={0.8} color="#1F3552" seed={3} />
      <FarHouse x={268} y={150} />
      <FarHouse x={300} y={148} s={0.8} />
      <FarHouse x={515} y={147} />
      <FarHouse x={545} y={149} s={0.85} />
      <Hill d="M0 172 Q160 156 330 166 T640 162 T800 168 L800 200 L0 200 Z" fill="#A9BAD9" />
    </g>
  )
}

function ForestFar() {
  return (
    <g>
      <Mountains peaks={[[120, 90, 150], [360, 76, 170], [600, 88, 160], [780, 96, 120]]} tone="#2E3D6A" shade="#28365F" cap="#AFBEDD" />
      <PineRow y={140} from={0} to={800} step={9} s={0.75} color="#2C4A72" seed={11} />
      <PineRow y={156} from={0} to={800} step={12} s={1.05} color="#203C5C" seed={12} />
      <PineRow y={172} from={0} to={800} step={15} s={1.4} color="#183049" seed={13} />
    </g>
  )
}

// Şehir: bakan kişi nehre doğru bakar. Nehir ufka uzanır; sol kıyıda ormanlık bir tepe, sağ kıyıda şehir var.
// Asma köprü iki kıyıyı bağlar: kuleleri sudaki ayaklara oturur, ışıkları suya yansır.
// Nehir karlı tepenin arkasında kalmasın diye şehir manzarası diğerlerinden biraz yukarıda.
const DECK = 124
const RIVER_TOP = 100

function cableY(x: number): number {
  if (x < 150) return DECK - 4 - ((x - 34) / 116) * (DECK - 4 - 78)
  if (x > 330) return 78 + ((x - 330) / 132) * (DECK - 4 - 78)
  return 78 + 30 * (1 - ((x - 240) / 90) ** 2)
}

function Bridge() {
  return (
    <g>
      {/* Ayaklar ve kuleler */}
      {[150, 330].map((x) => (
        <g key={x}>
          <rect x={x - 7} y={DECK} width={14} height={14} fill="#2C3866" />
          <rect x={x - 7} y={DECK + 12} width={14} height={2} fill="#B9C8E0" opacity={0.6} />
          <rect x={x - 4} y={70} width={3} height={DECK - 70} fill="#3A4778" />
          <rect x={x + 1} y={70} width={3} height={DECK - 70} fill="#3A4778" />
          <rect x={x - 4} y={86} width={8} height={2} fill="#3A4778" />
          <rect x={x - 4} y={106} width={8} height={2} fill="#3A4778" />
          <circle cx={x} cy={68} r={1.6} fill="#FF5A5A" className="beacon" />
        </g>
      ))}
      <path d={`M34 ${DECK - 4} L150 78 Q240 138 330 78 L462 ${DECK - 4}`} stroke="#8D9CC4" strokeWidth={1.4} fill="none" />
      {Array.from({ length: 21 }, (_, i) => {
        const x = 158 + i * 8
        return <path key={i} d={`M${x} ${cableY(x).toFixed(1)} L${x} ${DECK}`} stroke="#6F7EA8" strokeWidth={0.5} />
      })}
      <rect x={24} y={DECK} width={446} height={3.5} fill="#3A4778" />
      <rect x={24} y={DECK - 0.8} width={446} height={1} fill={SNOW} opacity={0.8} />
      {Array.from({ length: 27 }, (_, i) => {
        const x = 40 + i * 16
        return <circle key={i} cx={x} cy={cableY(x).toFixed(1)} r={1.3} fill="#FFE7B0" className={i % 3 === 0 ? 'window w2' : 'window'} />
      })}
      {Array.from({ length: 28 }, (_, i) => (
        <circle key={`d${i}`} cx={28 + i * 16} cy={DECK + 1.7} r={0.9} fill={WARM} opacity={0.85} />
      ))}
      {/* Köprü ışıklarının sudaki yansıması */}
      <g className="shimmer">
        {Array.from({ length: 14 }, (_, i) => {
          const x = 44 + i * 30
          return <rect key={i} x={x - 0.8} y={DECK + 6 + (i % 3) * 3} width={1.6} height={10 + (i % 4) * 4} rx={0.8} fill="#FFE7B0" opacity={0.3} />
        })}
      </g>
    </g>
  )
}

const FAR_CITY: [number, number, number][] = [
  [470, 30, 70], [498, 40, 52], [534, 26, 92], [558, 40, 62], [612, 30, 80], [640, 44, 54], [682, 28, 96],
  [708, 40, 64], [746, 30, 76], [774, 30, 58],
]

function CityFar() {
  const r = seeded(41)
  return (
    <g>
      {/* Ufuktaki tepeler ve uzak kıyının ışıkları */}
      <path d={`M0 ${RIVER_TOP} Q120 82 260 92 T520 88 T800 90 L800 ${RIVER_TOP + 4} L0 ${RIVER_TOP + 4} Z`} fill="#26345F" />
      {Array.from({ length: 46 }, (_, i) => (
        <circle key={i} cx={(r() * 800).toFixed(1)} cy={(90 + r() * 10).toFixed(1)} r={0.8} fill={WARM} opacity={0.35 + r() * 0.45} />
      ))}
      {/* Nehir: ufka doğru daralır */}
      <path d={`M300 ${RIVER_TOP + 2} L470 ${RIVER_TOP + 2} L560 220 L0 220 L0 142 Z`} fill="url(#seaDeep)" />
      <path d="M330 108 L380 108 M250 134 L330 134 M120 160 L240 160 M360 150 L430 150 M60 184 L200 184" stroke="#5D78B0" strokeWidth={0.8} opacity={0.6} />
      {/* Sol kıyı: karlı, çam ağaçlı tepe */}
      <path d="M0 112 Q30 106 60 116 Q90 128 150 138 Q60 152 0 154 Z" fill="#2B3A66" />
      <path d="M0 112 Q30 106 60 116 Q70 120 80 123 Q40 118 0 120 Z" fill={SNOW} opacity={0.85} />
      <PineRow y={122} from={4} to={84} step={9} s={0.75} color="#1E3552" seed={44} />
      {/* Sağ kıyı: rıhtım ve şehir */}
      <path d={`M440 ${DECK + 4} L800 ${DECK - 2} L800 220 L500 220 Z`} fill="#1F2A4C" />
      <path d={`M440 ${DECK + 4} L800 ${DECK - 2} L800 ${DECK + 1} L442 ${DECK + 6.5} Z`} fill={SNOW} opacity={0.9} />
      {FAR_CITY.map(([x, w, ht], i) => (
        <g key={i}>
          <rect x={x} y={DECK + 2 - ht} width={w} height={ht + 40} fill={i % 2 ? '#283463' : '#2D3A6C'} />
          {i % 4 === 1 && <rect x={x + w / 2 - 1} y={DECK + 2 - ht - 12} width={2} height={12} fill="#283463" />}
          {i % 4 === 1 && <circle cx={x + w / 2} cy={DECK + 2 - ht - 13} r={1.4} fill="#FF5A5A" className="beacon" />}
          {i % 5 === 2 && <path d={`M${x} ${DECK + 2 - ht} L${x + w / 2} ${DECK + 2 - ht - 14} L${x + w} ${DECK + 2 - ht} Z`} fill="#2D3A6C" />}
          {Array.from({ length: Math.floor(ht / 7) }, (_, row) =>
            Array.from({ length: Math.floor(w / 7) }, (_, c) =>
              r() < 0.45 ? (
                <rect key={`${row}-${c}`} x={x + 2.5 + c * 7} y={DECK + 2 - ht + 4 + row * 7} width={3} height={3} fill={WARM} opacity={0.35 + r() * 0.5} className={r() < 0.08 ? 'window w2' : undefined} />
              ) : null,
            ),
          )}
          <rect x={x} y={DECK + 2 - ht} width={w} height={2} fill={SNOW} opacity={0.8} />
        </g>
      ))}
      {/* Saat kulesi, kadranı on ikiyi gösterir. */}
      <g transform={`translate(596 ${DECK + 2}) scale(0.82)`}>
        <rect x={-14} y={-118} width={28} height={118} fill="#323F74" />
        <path d="M-17 -118 L0 -146 L17 -118 Z" fill="#323F74" />
        <path d="M-17 -118 L0 -146 L17 -118 L13 -118 L0 -140 L-13 -118 Z" fill={SNOW} />
        <circle cx={0} cy={-100} r={10} fill="#FFF3D0" className="clock-face" />
        <path d="M0 -100 L0 -108 M0 -100 L0.8 -106" stroke="#2A2235" strokeWidth={1.6} strokeLinecap="round" />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={-8} y={-80 + k * 18} width={16} height={8} fill={WARM} opacity={0.8} />
        ))}
      </g>
      <Bridge />
    </g>
  )
}

function LakeFar() {
  const peaks: Peak[] = [[110, 70, 150], [300, 54, 170], [520, 66, 170], [720, 74, 140]]
  return (
    <g>
      <Mountains peaks={peaks} tone="#2D3C6A" shade="#26345E" cap="#B9C7E2" baseY={132} />
      <PineRow y={132} from={0} to={250} step={10} s={0.8} color="#1E3552" seed={21} />
      <PineRow y={132} from={560} to={800} step={10} s={0.8} color="#1E3552" seed={22} />
      <rect x={0} y={132} width={800} height={68} fill="url(#lakeIce)" />
      <g opacity={0.22} transform="translate(0 264) scale(1 -1)">
        <Mountains peaks={peaks} tone="#6F86B8" shade="#5E74A6" cap="#DCE6F5" baseY={132} />
      </g>
      <path d="M120 150 L260 146 M330 160 L520 156 M560 148 L690 151 M200 170 L380 168" stroke="#E8F0FA" strokeWidth={1} opacity={0.5} />
      <path d="M250 158 Q300 152 350 158 Q300 164 250 158 Z M430 166 Q480 160 540 167" stroke="#FFFFFF" strokeWidth={0.8} fill="none" opacity={0.45} />
      <g className="skater">
        <g transform="translate(300 152)">
          <circle cx={0} cy={-11} r={1.8} fill="#2A2235" />
          <path d="M0 -9 L-1 -3 L-4 0 M-1 -3 L2 0 M0 -8 L-4 -6 M0 -8 L4 -10" stroke="#2A2235" strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <path d="M-3 -8.5 L1 -9" stroke="#D7263D" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      </g>
      <g className="skater s2">
        <g transform="translate(470 160)">
          <circle cx={0} cy={-11} r={1.8} fill="#2A2235" />
          <path d="M0 -9 L1 -3 L4 0 M1 -3 L-2 0 M0 -8 L4 -6 M0 -8 L-4 -10" stroke="#2A2235" strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <path d="M-1 -8.5 L3 -9" stroke="#2E5DAA" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      </g>
    </g>
  )
}

function MountainFar() {
  const chairs: ReactNode[] = []
  for (let i = 0; i < 9; i++) {
    const t = i / 9
    const x = 470 + t * 300
    const y = 150 - t * 96
    chairs.push(
      <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
        <path d="M0 0 L0 6" stroke="#2A2235" strokeWidth={0.7} />
        <rect x={-3} y={6} width={6} height={3} rx={1} fill="#D7263D" />
      </g>,
    )
  }
  return (
    <g>
      <Mountains peaks={[[70, 84, 140], [250, 38, 190], [470, 60, 170], [680, 30, 200]]} tone="#33457A" shade="#2A3A6A" cap="#DDE6F5" />
      {/* Kaya damarları */}
      <path d="M250 38 L232 92 M250 38 L268 104 M680 30 L700 96 M680 30 L656 84 M470 60 L486 120" stroke="#25345F" strokeWidth={2} opacity={0.6} />
      <Mountains peaks={[[160, 110, 120], [390, 100, 140], [600, 114, 120]]} tone="#2A3B6A" shade="#22325C" cap="#B7C6E2" />
      <path d="M470 150 L770 54" stroke="#1B2238" strokeWidth={0.8} />
      {[0.18, 0.55, 0.9].map((t) => (
        <g key={t} transform={`translate(${470 + t * 300} ${150 - t * 96})`}>
          <rect x={-1.5} y={0} width={3} height={40} fill="#1B2238" />
          <rect x={-6} y={-1} width={12} height={2} fill="#1B2238" />
        </g>
      ))}
      <g className="lift">{chairs}</g>
      <PineRow y={158} from={0} to={800} step={12} s={1} color="#1C3450" seed={31} />
      <PineRow y={172} from={0} to={800} step={16} s={1.3} color="#162B42" seed={32} />
    </g>
  )
}

function CoastFar() {
  const r = seeded(51)
  return (
    <g>
      <path d="M0 120 Q90 100 200 112 T420 106 T640 110 T800 104 L800 128 L0 128 Z" fill="#26345F" />
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={(r() * 800).toFixed(1)} cy={(112 + r() * 14).toFixed(1)} r={0.9} fill={WARM} opacity={0.4 + r() * 0.5} className={i % 9 === 0 ? 'window w2' : undefined} />
      ))}
      <rect x={0} y={126} width={800} height={74} fill="url(#seaDeep)" />
      <g className="shimmer">
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={560 + ((i * 37) % 70) - 35 + i * 1.5} y={130 + i * 4.6} width={18 + ((i * 13) % 22)} height={1.4} rx={0.7} fill="#FFF3D0" opacity={0.5 - i * 0.025} />
        ))}
      </g>
      {Array.from({ length: 18 }, (_, i) => (
        <path key={i} d={`M${(i * 47) % 800} ${136 + (i % 6) * 9} q6 -2 12 0`} stroke="#5D78B0" strokeWidth={0.8} fill="none" opacity={0.6} />
      ))}
      {/* Deniz feneri: kayalık burun, çizgili kule, dönen ışık. */}
      <g transform="translate(250 150)">
        <path d="M-40 10 Q-30 -6 -12 -8 Q4 -12 16 -4 Q34 0 44 10 Z" fill="#1F2A4C" />
        <path d="M-12 -8 Q4 -12 16 -4 L12 -2 Q2 -8 -10 -5 Z" fill={SNOW} />
        <path d="M-6 -6 L-4 -50 L4 -50 L6 -6 Z" fill="#F4F1EA" />
        <path d="M-5.5 -20 L5.5 -20 L5 -28 L-5 -28 Z M-4.6 -38 L4.6 -38 L4.3 -45 L-4.3 -45 Z" fill="#D7263D" />
        <rect x={-6} y={-56} width={12} height={6} fill="#2A2235" />
        <circle cx={0} cy={-53} r={3.2} fill="#FFF1B8" className="lamp-glow" />
        <path d="M-7 -56 L0 -62 L7 -56 Z" fill="#D7263D" />
        <g className="beam">
          <path d="M0 -53 L120 -66 L120 -40 Z" fill="url(#beam)" />
        </g>
      </g>
      <g transform="translate(470 156)">
        <g className="bob">
          <path d="M-14 0 L14 0 L10 5 L-10 5 Z" fill="#2A2235" />
          <path d="M0 0 L0 -16 L9 -2 Z" fill="#D5E0F0" />
          <circle cx={-8} cy={-2} r={1.2} fill={WARM} />
        </g>
      </g>
    </g>
  )
}

export function Backdrop({ scene = 0, className = '' }: { scene?: number; className?: string }) {
  return (
    <svg className={`backdrop ${className}`} viewBox="0 0 800 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="lakeIce" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7D96C4" />
          <stop offset="1" stopColor="#B4C6E3" />
        </linearGradient>
        <linearGradient id="seaDeep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2C55" />
          <stop offset="1" stopColor="#2C4274" />
        </linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF4C8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFF4C8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {scene === 1 ? <ForestFar /> : scene === 2 ? <CityFar /> : scene === 3 ? <LakeFar /> : scene === 4 ? <MountainFar /> : scene === 5 ? <CoastFar /> : <VillageFar />}
    </svg>
  )
}

/* ---------- Yakın katman ---------- */

// Karlı ayrıntılı çam: üç kat, her katın ucunda kar.
function Pine({ x, y, s, tone = '#1E3B4A' }: { x: number; y: number; s: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-1.2} y={-2} width={2.4} height={4} fill="#4A3426" />
      <path d="M0 -26 L7 -16 L4 -16 L10 -7 L6 -7 L12 2 L-12 2 L-6 -7 L-10 -7 L-4 -16 L-7 -16 Z" fill={tone} />
      <path d="M0 -26 L7 -16 L0 -18 Z M0 -16 L10 -7 L1 -9 Z M0 -7 L12 2 L1 0 Z" fill="#000" opacity={0.18} />
      <path d="M0 -26 L3.4 -21 L1 -22 L-1 -20.5 L-3.4 -21 Z" fill={SNOW} />
      <path d="M-7 -16 L-4.5 -17.3 L-1 -15.8 L3 -17 L7 -16 L4 -15 L0 -15.2 L-4 -14.8 Z" fill={SNOW} />
      <path d="M-10 -7 L-6.5 -8.6 L-2 -6.8 L3 -8.4 L10 -7 L6 -5.8 L0 -6 L-5 -5.6 Z" fill={SNOW} />
      <path d="M-12 2 L-7 0.4 L-2 1.8 L4 0.2 L12 2 Z" fill={SNOW} opacity={0.9} />
    </g>
  )
}

// Kulübe: kalın kar örtülü çatı, buz sarkıtları, kapıda çelenk, saçak altında ışık dizisi.
function Cottage({ x, y, s, flip, lights = true }: { x: number; y: number; s: number; flip?: boolean; lights?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={1.5} rx={20} ry={2.5} fill="#9FB1D3" opacity={0.6} />
      <rect x={-14} y={-16} width={28} height={18} fill="#3A2F4A" />
      <path d="M-14 -16 L14 -16 L14 2 L-14 2 Z" fill="url(#wood)" opacity={0.5} />
      <rect x={6} y={-33} width={5} height={11} fill="#4A3A58" />
      <rect x={5.4} y={-34.5} width={6.2} height={2.2} rx={1} fill={SNOW} />
      <path d="M-17 -15 L0 -30 L17 -15 Z" fill="#5A3A3A" />
      <path d="M-18.5 -14 L0 -31.5 L18.5 -14 L15 -13 L0 -26.5 L-15 -13 Z" fill={SNOW} />
      <path d="M-15 -13 L-14 -10.5 L-13 -13 L-11 -9.5 L-9.6 -13 L-7 -11 L-6 -13 M7 -13 L8 -10 L9.5 -13 L11.5 -11 L13 -13 L14 -9.8 L15 -13" fill="#E3EEFA" stroke="#E3EEFA" strokeWidth={0.6} />
      <g className="window">
        <rect x={-11} y={-11} width={7} height={7} fill={WARM} />
        <circle cx={-7.5} cy={-7.5} r={7} fill={WARM} opacity={0.14} />
      </g>
      <path d="M-7.5 -11 L-7.5 -4 M-11 -7.5 L-4 -7.5" stroke="#5A3A2A" strokeWidth={0.9} />
      <rect x={-11.6} y={-4.4} width={8.2} height={1.4} fill={SNOW} />
      <rect x={1} y={-9} width={7} height={11} rx={1} fill="#6B3E26" />
      <circle cx={4.5} cy={-5.5} r={2.6} fill="none" stroke="#2E7D4F" strokeWidth={1.4} />
      <circle cx={4.5} cy={-3.2} r={0.6} fill="#D7263D" />
      <circle cx={6.6} cy={-3.2} r={0.5} fill={WARM} />
      {lights && (
        <g>
          <path d="M-14 -13 Q-7 -10 0 -13 Q7 -10 14 -13" stroke="#2A2235" strokeWidth={0.4} fill="none" />
          {[-12, -9, -5.5, -2, 2, 5.5, 9, 12].map((lx, i) => (
            <circle key={lx} cx={lx} cy={-12.2 + (i % 2) * 0.8} r={0.9} fill={['#FF5A5A', '#FFE066', '#6BE38B', '#5AB4FF'][i % 4]} className={`bulb b${i % 3}`} />
          ))}
        </g>
      )}
      <g className="smoke">
        <circle cx={8.5} cy={-37} r={1.8} />
        <circle cx={8.5} cy={-37} r={1.8} />
        <circle cx={8.5} cy={-37} r={1.8} />
      </g>
    </g>
  )
}

function Fence({ x, y, n, flip }: { x: number; y: number; n: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <rect x={0} y={-6} width={n * 7} height={1.4} fill="#6B4A32" />
      <rect x={0} y={-3} width={n * 7} height={1.4} fill="#6B4A32" />
      {Array.from({ length: n + 1 }, (_, i) => (
        <g key={i}>
          <rect x={i * 7 - 0.9} y={-9} width={1.8} height={9} fill="#7A5638" />
          <ellipse cx={i * 7} cy={-9.2} rx={1.6} ry={0.9} fill={SNOW} />
        </g>
      ))}
      <rect x={0} y={-6.8} width={n * 7} height={0.8} fill={SNOW} opacity={0.9} />
    </g>
  )
}

function Lamp({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="lamp-glow">
        <circle cx={0} cy={-27} r={9} fill="#FFE7A0" fillOpacity={0.1} />
        <circle cx={0} cy={-27} r={5} fill="#FFE7A0" fillOpacity={0.18} />
      </g>
      <rect x={-0.9} y={-24} width={1.8} height={24} fill="#2A2235" />
      <rect x={-2.2} y={-1.5} width={4.4} height={1.5} fill="#2A2235" />
      <path d="M-3 -24 L3 -24 L2.3 -30 L-2.3 -30 Z" fill="#FFE7A0" />
      <path d="M-3.6 -30 L0 -33.5 L3.6 -30 Z" fill="#2A2235" />
      <path d="M-3.8 -30.3 L0 -33.8 L3.8 -30.3 L2 -30.6 L0 -32.5 L-2 -30.6 Z" fill={SNOW} />
      <path d="M1 -14 C5 -16 5 -11 1 -12 Z" fill="#2E7D4F" />
      <circle cx={2.6} cy={-13} r={0.7} fill="#D7263D" />
    </g>
  )
}

function Snowman({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0.5} rx={8} ry={1.6} fill="#9FB1D3" opacity={0.6} />
      <circle cx={0} cy={-5} r={6} fill={SNOW} />
      <circle cx={0} cy={-14} r={4.4} fill={SNOW} />
      <circle cx={0} cy={-21} r={3.4} fill={SNOW} />
      <path d="M-3.6 -17.6 Q0 -16 3.6 -17.6 L3.4 -16 Q0 -14.6 -3.4 -16 Z M2 -16.4 L3.8 -12 L5.2 -12.6 L3.4 -16.6 Z" fill="#D7263D" />
      <path d="M0 -21 L4.2 -20.2 L0 -20 Z" fill="#F08A24" />
      <circle cx={-1.2} cy={-22.2} r={0.5} fill="#2A2235" />
      <circle cx={1.1} cy={-22.2} r={0.5} fill="#2A2235" />
      <circle cx={0} cy={-13.4} r={0.55} fill="#2A2235" />
      <circle cx={0} cy={-11} r={0.55} fill="#2A2235" />
      <path d="M-3 -24 L3 -24 L2.4 -29 L-2.4 -29 Z M-4 -24.2 L4 -24.2 L4 -23.2 L-4 -23.2 Z" fill="#2A2235" />
      <path d="M-4.2 -14 L-9 -17 M-9 -17 L-10 -19 M4.2 -14 L9 -16.5 M9 -16.5 L10.4 -18" stroke="#6B4A32" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  )
}

function Deer({ x, y, s = 1, flip }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path
        d="M-9 -9 C-9 -12 -2 -12 4 -11 L7 -15 L8 -19 L10 -19 L10 -15 L12 -14 L10 -12 L7 -11 L7 -6 L6 0 L5 0 L5 -6 L-6 -6 L-7 0 L-8 0 L-8 -6 L-10 -8 Z"
        fill="#4A3526"
      />
      <path d="M8.5 -19 L7 -23 M7.6 -21 L5.5 -22 M9.5 -19 L11 -23.5 M10.4 -21.4 L12.6 -22.4" stroke="#4A3526" strokeWidth={0.8} strokeLinecap="round" />
      <path d="M-9 -9 C-9 -11.6 -4 -12 0 -11.8 L-2 -10.6 Z" fill={SNOW} opacity={0.8} />
      <circle cx={10.4} cy={-15.2} r={0.4} fill="#111" />
    </g>
  )
}

function LogCabin({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-15} y={-3.6 * (i + 1) + 1} width={30} height={3.4} rx={1.7} fill={i % 2 ? '#6E4426' : '#7E5030'} />
      ))}
      <path d="M-18 -16 L0 -29 L18 -16 Z" fill="#4A2E1E" />
      <path d="M-19.5 -15.2 L0 -30.5 L19.5 -15.2 L16 -14.4 L0 -26.5 L-16 -14.4 Z" fill={SNOW} />
      <rect x={-10} y={-12} width={7} height={6} fill={WARM} className="window" />
      <circle cx={-6.5} cy={-9} r={7} fill={WARM} opacity={0.12} />
      <path d="M-6.5 -12 L-6.5 -6 M-10 -9 L-3 -9" stroke="#4A2E1E" strokeWidth={0.8} />
      <rect x={3} y={-11} width={7} height={11} fill="#4A2E1E" />
      <rect x={-12} y={-33} width={4.5} height={9} fill="#5E5A62" />
      <g className="smoke">
        <circle cx={-9.8} cy={-35} r={1.7} />
        <circle cx={-9.8} cy={-35} r={1.7} />
        <circle cx={-9.8} cy={-35} r={1.7} />
      </g>
      <path d="M12 0 L12 -6 L18 -6 L18 0" fill="#6E4426" />
      <path d="M11.4 -6 L18.6 -6 L18 -7.4 L12 -7.4 Z" fill={SNOW} />
    </g>
  )
}

function FallenLog({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-4} width={28} height={5} rx={2.5} fill="#6E4426" />
      <ellipse cx={14} cy={-1.5} rx={2.2} ry={2.6} fill="#C69A6B" />
      <path d="M-14 -3.6 Q0 -7 14 -3.8 L13 -2.8 Q0 -5 -13 -2.6 Z" fill={SNOW} />
    </g>
  )
}

function Bench({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-10} y={-6} width={20} height={1.6} fill="#7A5638" />
      <rect x={-10} y={-10} width={20} height={1.4} fill="#7A5638" />
      <rect x={-10} y={-12.6} width={20} height={1.4} fill="#7A5638" />
      <path d="M-8 -4.4 L-8 0 M8 -4.4 L8 0 M-9 -6 L-9 -12.6 M9 -6 L9 -12.6" stroke="#2A2235" strokeWidth={1.2} />
      <path d="M-10.4 -6.4 Q0 -8 10.4 -6.4 L10 -5.6 L-10 -5.6 Z M-10.4 -13 Q0 -14 10.4 -13 L10 -12.4 L-10 -12.4 Z" fill={SNOW} />
    </g>
  )
}

// Ampullerle süslü küçük çam, şehir meydanı için.
function LitPine({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Pine x={0} y={0} s={1} tone="#1F4A36" />
      {[[-4, -18], [3, -14], [-6, -9], [5, -6], [-3, -3], [8, 0], [0, -10]].map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={1} fill={['#FF5A5A', '#FFE066', '#5AB4FF'][i % 3]} className={`bulb b${i % 3}`} />
      ))}
      <path d="M0 -30 L1 -27.6 L3.4 -27.4 L1.6 -25.8 L2.2 -23.4 L0 -24.8 L-2.2 -23.4 L-1.6 -25.8 L-3.4 -27.4 L-1 -27.6 Z" fill="#F2C14E" />
    </g>
  )
}

function Kiosk({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-12} y={-16} width={24} height={16} fill="#5A2A2A" />
      <rect x={-10} y={-13} width={20} height={7} fill={WARM} className="window" />
      <path d="M-14 -16 L14 -16 L12 -22 L-12 -22 Z" fill="#D7263D" />
      <path d="M-14 -16 L-10.5 -16 L-9 -22 L-12 -22 Z M-3.5 -16 L0 -16 L1.5 -22 L-1.5 -22 Z M7 -16 L10.5 -16 L11.5 -22 L8.5 -22 Z" fill="#fff" opacity={0.9} />
      <path d="M-14.5 -22.4 L14.5 -22.4 L13.6 -24 L-13.6 -24 Z" fill={SNOW} />
      <rect x={-8} y={-9} width={5} height={3} fill="#2E8B57" />
      <rect x={2} y={-9} width={5} height={3} fill="#2E5DAA" />
    </g>
  )
}

function Reeds({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#5E5040" strokeWidth={0.8} strokeLinecap="round" fill="none">
      <path d="M0 0 Q-1 -8 -3 -15 M2 0 Q2 -9 3 -17 M4 0 Q6 -7 8 -12 M-2 0 Q-4 -6 -7 -10" />
      <ellipse cx={-3} cy={-15.5} rx={0.9} ry={2.4} fill="#6B4A32" stroke="none" />
      <ellipse cx={3} cy={-17.4} rx={0.9} ry={2.4} fill="#6B4A32" stroke="none" />
    </g>
  )
}

function Pier({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6 0 L22 -18 L30 -18 L4 0 Z" fill="#7A5638" />
      {[0, 7, 14, 21].map((k) => (
        <path key={k} d={`M${k - 4.6 + k * 0.08} ${-k * 0.86} L${k + 3.4} ${-k * 0.86}`} stroke="#5E3F28" strokeWidth={0.6} />
      ))}
      <path d="M-6 0 L22 -18 L30 -18 L4 0 Z" fill={SNOW} opacity={0.45} />
      <path d="M-5 0 L-5 4 M3 0 L3 4 M21 -18 L21 -14 M29 -18 L29 -14" stroke="#4A3426" strokeWidth={1.2} />
    </g>
  )
}

function Chalet({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={1.5} rx={22} ry={2.4} fill="#9FB1D3" opacity={0.6} />
      <path d="M-18 2 L0 -34 L18 2 Z" fill="#6E4426" />
      <path d="M-11 2 L0 -21 L11 2 Z" fill={WARM} className="window" />
      <path d="M0 -21 L0 2 M-5.5 -10 L5.5 -10 M-8.5 -4 L8.5 -4" stroke="#4A2E1E" strokeWidth={0.9} />
      <circle cx={0} cy={-8} r={12} fill={WARM} opacity={0.1} />
      <path d="M-21 3 L0 -37.5 L21 3 L17.5 3 L0 -31 L-17.5 3 Z" fill={SNOW} />
      <path d="M-14 -6 L14 -6 L14 -4.6 L-14 -4.6 Z" fill="#4A2E1E" />
      <path d="M-14 -6.6 L14 -6.6 L14 -5.8 L-14 -5.8 Z" fill={SNOW} />
      <g className="smoke">
        <circle cx={7} cy={-30} r={1.8} />
        <circle cx={7} cy={-30} r={1.8} />
        <circle cx={7} cy={-30} r={1.8} />
      </g>
      {/* Duvara dayalı kayaklar ve odun yığını */}
      <path d="M22 2 L25 -18 M25 2 L28 -18" stroke="#D7263D" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M-30 2 L-20 2 L-20 -6 L-30 -6 Z" fill="#7E5030" />
      {[-28, -25, -22].flatMap((cx) => [-1.6, -4.4].map((cy) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={1.4} fill="#C69A6B" />))}
      <path d="M-30.5 -6.4 Q-25 -8.6 -19.5 -6.4 Z" fill={SNOW} />
    </g>
  )
}

function Sled({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-10} y={-6} width={20} height={2.4} rx={1} fill="#A8743F" />
      <path d="M-8 -3.6 L-8 -1 M8 -3.6 L8 -1" stroke="#7E1A27" strokeWidth={1} />
      <path d="M-12 0 L10 0 C13 0 14 -2 14 -4" stroke="#D7263D" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <rect x={-6} y={-11} width={6} height={5} fill="#2E8B57" />
      <rect x={-3.6} y={-11} width={1.2} height={5} fill="#F2C14E" />
      <rect x={1} y={-9.5} width={5} height={3.5} fill="#2E5DAA" />
    </g>
  )
}

function Boat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-18 -8 L18 -8 L13 0 L-13 0 Z" fill="#2E5DAA" />
      <path d="M-18 -8 L18 -8 L17 -6 L-17 -6 Z" fill="#F4F1EA" />
      <path d="M-17 -8.6 Q0 -11 17 -8.6 L16 -7.6 L-16 -7.6 Z" fill={SNOW} />
      <rect x={-1} y={-24} width={1.6} height={16} fill="#5E3F28" />
      <path d="M-24 1 Q0 -3 24 1 L24 3 L-24 3 Z" fill="#B9C8E0" />
      <path d="M-10 -4 L-6 -4 M3 -4 L7 -4" stroke="#F2C14E" strokeWidth={1.2} />
    </g>
  )
}

function Bollard({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-2} y={-7} width={4} height={7} rx={1.5} fill="#2A2235" />
      <ellipse cx={0} cy={-7} rx={2.6} ry={1.2} fill={SNOW} />
      <path d="M2 -4 Q8 -1 14 -3" stroke="#C69A6B" strokeWidth={0.8} fill="none" />
    </g>
  )
}

function Village() {
  return (
    <g>
      <Pine x={60} y={42} s={0.9} />
      <Cottage x={120} y={42} s={0.95} />
      <Pine x={180} y={40} s={1.1} />
      <Cottage x={240} y={44} s={0.85} flip />
      <Pine x={296} y={44} s={1.15} />
      <Cottage x={338} y={46} s={1.05} />
      <Fence x={250} y={70} n={10} />
      <Snowman x={352} y={76} s={1.1} />
      <Cottage x={474} y={44} s={1} flip />
      <Pine x={508} y={42} s={1.2} />
      <Lamp x={448} y={70} s={1.05} />
      <Fence x={540} y={70} n={9} />
      <Cottage x={600} y={42} s={0.9} />
      <Pine x={650} y={40} s={1} />
      <Cottage x={700} y={40} s={0.85} flip />
      <Pine x={748} y={42} s={0.9} />
    </g>
  )
}

function Forest() {
  return (
    <g>
      {[30, 70, 110, 150, 200, 250, 560, 600, 640, 690, 740, 780].map((x, i) => (
        <Pine key={x} x={x} y={42 + (i % 3) * 2} s={1.1 + (i % 4) * 0.15} />
      ))}
      <LogCabin x={175} y={46} s={1} />
      <LogCabin x={650} y={46} s={0.95} flip />
      <Pine x={300} y={48} s={1.7} tone="#18342A" />
      <Pine x={324} y={46} s={1.2} />
      <FallenLog x={344} y={78} />
      <Deer x={462} y={72} s={1} flip />
      <Pine x={494} y={48} s={1.6} tone="#18342A" />
      <Pine x={520} y={46} s={1.25} />
    </g>
  )
}

function City() {
  return (
    <g>
      <Kiosk x={150} y={50} />
      <LitPine x={230} y={52} s={1.1} />
      <Lamp x={312} y={72} s={1.15} />
      <LitPine x={336} y={54} s={1.25} />
      <Bench x={470} y={76} s={1.05} />
      <Lamp x={492} y={72} s={1.15} />
      <path d="M312 46 Q402 60 492 46" stroke="#2A2235" strokeWidth={0.5} fill="none" />
      {Array.from({ length: 15 }, (_, i) => {
        const t = (i + 0.5) / 15
        const x = 312 + t * 180
        const y = 46 + 4 * 14 * t * (1 - t)
        return <circle key={i} cx={x} cy={y + 1} r={1.2} fill={['#FF5A5A', '#FFE066', '#6BE38B', '#5AB4FF'][i % 4]} className={`bulb b${i % 3}`} />
      })}
      <Kiosk x={630} y={50} s={0.95} />
      <LitPine x={560} y={52} s={1.05} />
      <Lamp x={700} y={70} />
      <Lamp x={100} y={70} />
    </g>
  )
}

function Lake() {
  return (
    <g>
      <Pine x={40} y={42} s={1} />
      <LogCabin x={110} y={44} s={0.9} />
      <Pine x={170} y={42} s={1.15} />
      <Pine x={240} y={44} s={0.95} />
      <Pine x={300} y={46} s={1.35} />
      <Reeds x={322} y={58} s={1.1} />
      <Bench x={350} y={74} />
      <Pier x={440} y={62} />
      <Reeds x={488} y={60} />
      <Pine x={506} y={46} s={1.3} />
      <Pine x={570} y={42} s={1} />
      <Cottage x={640} y={42} s={0.9} flip />
      <Pine x={700} y={42} s={1.1} />
      <Pine x={760} y={44} s={0.95} />
    </g>
  )
}

function MountainNear() {
  return (
    <g>
      <Pine x={40} y={42} s={1.1} />
      <Pine x={90} y={44} s={1.3} />
      <Chalet x={170} y={46} s={0.9} />
      <Pine x={240} y={42} s={1} />
      <Pine x={290} y={46} s={1.4} />
      <Chalet x={340} y={48} s={1.1} />
      <Sled x={468} y={74} s={1.1} />
      <Pine x={498} y={46} s={1.45} />
      <Pine x={560} y={42} s={1.1} />
      <Chalet x={640} y={44} s={0.85} />
      <Pine x={720} y={42} s={1.2} />
      <Pine x={770} y={44} s={1} />
    </g>
  )
}

function Coast() {
  return (
    <g>
      <Cottage x={90} y={42} s={0.85} />
      <Cottage x={140} y={44} s={0.8} flip />
      <Pine x={200} y={42} s={1} />
      <Bollard x={260} y={60} />
      <Cottage x={322} y={46} s={1.05} />
      <Lamp x={448} y={70} s={1.05} />
      <Boat x={478} y={74} s={1.05} />
      <Bollard x={520} y={60} />
      <Pine x={560} y={42} s={1.1} />
      <Cottage x={630} y={42} s={0.9} flip />
      <Cottage x={690} y={44} s={0.8} />
      <Pine x={750} y={42} s={1} />
    </g>
  )
}

export function Ground({ scene = 0, className = '' }: { scene?: number; className?: string }) {
  return (
    <svg className={`ground ${className}`} viewBox="0 0 800 110" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <pattern id="wood" width="4" height="3" patternUnits="userSpaceOnUse">
          <rect width="4" height="0.6" fill="#000" opacity="0.25" />
        </pattern>
      </defs>
      <path d="M0 46 Q90 22 190 40 T400 38 T610 36 T800 42 L800 110 L0 110 Z" fill="#B9C8E0" />
      <path d="M0 52 Q120 40 250 50 T520 46 T800 50 L800 110 L0 110 Z" fill={SNOW_SHADE} opacity={0.5} />
      {scene === 1 ? <Forest /> : scene === 2 ? <City /> : scene === 3 ? <Lake /> : scene === 4 ? <MountainNear /> : scene === 5 ? <Coast /> : <Village />}
      <path d="M0 70 Q110 52 260 64 T530 60 T800 66 L800 110 L0 110 Z" fill="#DCE6F3" />
      <path d="M140 66 q20 -3 40 0 M600 64 q24 -4 48 0" stroke="#FFFFFF" strokeWidth={1} opacity={0.7} fill="none" />
      <path d="M0 88 Q150 74 400 82 T800 84 L800 110 L0 110 Z" fill={SNOW} />
      <g className="cat">
        <path d="M0 -6 C2 -9 9 -9 11 -6 L12 -10 L13.5 -6 C14.5 -5 14.5 -2 13 -1 L1 -1 C-1 -1 -3 -3 -5 -6 C-3 -5 -1 -5 0 -6 Z" fill="#2A2235" />
      </g>
    </svg>
  )
}
