// Karlı tepeler, ışığı yanan küçük evler, bacadan tüten duman ve ara sıra geçen bir kedi.
// Çizim 800 birim genişliğinde: telefonda ortası, geniş ekranda tamamı görünür.
function House({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <rect x={-12} y={-14} width={24} height={16} fill="#2A2235" />
      <path d="M-15 -13 L0 -26 L15 -13 Z" fill="#3B2E47" />
      <path d="M-16 -12.5 L0 -27 L16 -12.5 L13 -12.5 L0 -23.5 L-13 -12.5 Z" fill="#F4F8FD" />
      <rect x={6} y={-27} width={4} height={8} fill="#2A2235" />
      <rect x={5.5} y={-28.5} width={5} height={2} fill="#F4F8FD" />
      <rect x={-8} y={-9} width={5} height={5} fill="#FFC861" className="window" />
      <rect x={3} y={-9} width={5} height={5} fill="#FFC861" className="window w2" />
      <rect x={-2} y={-5} width={4} height={7} fill="#5A3C2A" />
      <g className="smoke">
        <circle cx={8} cy={-31} r={1.6} />
        <circle cx={8} cy={-31} r={1.6} />
        <circle cx={8} cy={-31} r={1.6} />
      </g>
    </g>
  )
}

function Pine({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -22 L8 -8 L4 -8 L10 2 L-10 2 L-4 -8 L-8 -8 Z" fill="#1E3B4A" />
      <path d="M0 -22 L4 -15 L-4 -15 Z" fill="#F4F8FD" />
    </g>
  )
}

// Şehir: arkada pencereleri yanan binalar, birkaçı ara sıra söner.
const BUILDINGS: [number, number, number][] = [
  [0, 34, 22], [36, 26, 34], [64, 30, 18], [100, 24, 40], [126, 32, 28], [160, 22, 46], [184, 28, 24], [216, 26, 38],
  [244, 34, 20], [280, 24, 44], [306, 30, 30], [338, 22, 52], [362, 28, 22], [392, 24, 42], [418, 32, 30], [452, 26, 48],
  [480, 30, 24], [512, 22, 40], [536, 34, 30], [572, 24, 46], [598, 28, 26], [628, 26, 38], [656, 32, 22], [690, 22, 44],
  [714, 30, 28], [746, 24, 40], [772, 30, 24],
]

function City() {
  return (
    <g>
      {BUILDINGS.map(([x, w, ht], i) => (
        <g key={i}>
          <rect x={x} y={44 - ht} width={w} height={ht + 10} fill={i % 3 === 0 ? '#2A2F4A' : '#232843'} />
          <rect x={x} y={44 - ht} width={w} height={2.5} fill="#F4F8FD" opacity={0.85} />
          {Array.from({ length: Math.floor(ht / 9) }, (_, r) =>
            Array.from({ length: Math.floor(w / 9) }, (_, c) =>
              (r * 7 + c * 3 + i) % 4 === 0 ? null : (
                <rect
                  key={`${r}-${c}`}
                  x={x + 3 + c * 9}
                  y={44 - ht + 6 + r * 9}
                  width={4}
                  height={4}
                  fill="#FFC861"
                  className={(r + c + i) % 7 === 0 ? 'window w2' : 'window'}
                  opacity={(r + c) % 3 === 0 ? 0.55 : 0.9}
                />
              ),
            ),
          )}
        </g>
      ))}
    </g>
  )
}

function Forest() {
  const pines: [number, number, number][] = []
  for (let i = 0; i < 34; i++) {
    const x = 8 + i * 23.5 + ((i * 37) % 9)
    pines.push([x, 40 + ((i * 13) % 6), 0.75 + ((i * 29) % 5) * 0.12])
  }
  return (
    <g>
      {pines.map(([x, y, s], i) => (
        <Pine key={i} x={x} y={y} s={s} />
      ))}
      <House x={402} y={42} s={0.8} />
    </g>
  )
}

function Village() {
  return (
    <g>
      <Pine x={70} y={40} s={0.8} />
      <Pine x={96} y={38} s={1} />
      <House x={150} y={40} s={0.9} />
      <Pine x={240} y={44} s={0.9} />
      <Pine x={346} y={42} s={0.75} />
      <House x={322} y={42} s={0.85} />
      <House x={486} y={40} s={0.8} flip />
      <Pine x={462} y={40} s={0.8} />
      <Pine x={560} y={38} s={0.85} />
      <House x={650} y={38} s={0.85} flip />
      <Pine x={712} y={40} s={1} />
      <Pine x={736} y={42} s={0.75} />
    </g>
  )
}

// scene: 0 karlı köy, 1 çam ormanı, 2 şehir.
export function Ground({ scene = 0 }: { scene?: number }) {
  return (
    <svg className="ground" viewBox="0 0 800 110" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {scene === 2 && <City />}
      <path d="M0 46 Q90 22 190 40 T400 38 T610 36 T800 42 L800 110 L0 110 Z" fill="#B9C8E0" />
      {scene === 1 ? <Forest /> : scene === 2 ? null : <Village />}
      <path d="M0 70 Q110 52 260 64 T530 60 T800 66 L800 110 L0 110 Z" fill="#DCE6F3" />
      <path d="M0 88 Q150 74 400 82 T800 84 L800 110 L0 110 Z" fill="#F4F8FD" />
      <g className="cat">
        <path d="M0 -6 C2 -9 9 -9 11 -6 L12 -10 L13.5 -6 C14.5 -5 14.5 -2 13 -1 L1 -1 C-1 -1 -3 -3 -5 -6 C-3 -5 -1 -5 0 -6 Z" fill="#2A2235" />
      </g>
    </svg>
  )
}
