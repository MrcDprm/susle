// Müzik kutusu: Jingle Bells nakaratı, Web Audio ile çan tınısında çalınır.
// Beste 1857 tarihli ve kamu malı; ses dosyası yok, notalar kodda üretilir.

type Note = [midi: number | null, beats: number]

const E = 76, F = 77, G = 79, C5 = 72, D = 74
const MELODY: Note[] = [
  [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2], [E, 1], [G, 1], [C5, 1.5], [D, 0.5], [E, 4],
  [F, 1], [F, 1], [F, 1.5], [F, 0.5], [F, 1], [E, 1], [E, 1], [E, 0.5], [E, 0.5], [E, 1], [D, 1], [D, 1], [E, 1], [D, 2], [G, 2],
  [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2], [E, 1], [G, 1], [C5, 1.5], [D, 0.5], [E, 4],
  [F, 1], [F, 1], [F, 1.5], [F, 0.5], [F, 1], [E, 1], [E, 1], [E, 0.5], [E, 0.5], [G, 1], [G, 1], [F, 1], [D, 1], [C5, 4],
  [null, 4],
]
// Her ölçünün ilk ve üçüncü vuruşunda alçak bir eşlik notası.
const BASS = [48, 48, 48, 48, 53, 48, 50, 43, 48, 48, 48, 48, 53, 48, 43, 48, null]

const BEAT = 60 / 118
const LOOP_BEATS = MELODY.reduce((sum, [, b]) => sum + b, 0)
const PENTATONIC = [79, 81, 84, 86, 88, 91]

type Event = { at: number; midi: number; volume: number; length: number }

// Bir döngünün bütün notaları, döngü başından saniye cinsinden.
const EVENTS: Event[] = (() => {
  const list: Event[] = []
  let t = 0
  for (const [midi, beats] of MELODY) {
    if (midi !== null) list.push({ at: t * BEAT, midi, volume: 0.55, length: Math.min(1.6, beats * BEAT + 0.6) })
    t += beats
  }
  BASS.forEach((midi, bar) => {
    if (midi === null) return
    list.push({ at: bar * 4 * BEAT, midi, volume: 0.22, length: 1.1 })
    list.push({ at: (bar * 4 + 2) * BEAT, midi: midi + 7, volume: 0.18, length: 1.1 })
  })
  return list.sort((x, y) => x.at - y.at)
})()
const LOOP = LOOP_BEATS * BEAT

let ctx: AudioContext | null = null
let master: GainNode | null = null
let playing = false
let timer: ReturnType<typeof setInterval> | null = null
let cursor = 0
let loopStart = 0

function freq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

function audio(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.16
    master.connect(ctx.destination)
    // Telefon tarayıcıları klavye açılınca, bildirim gelince ya da sekme arkaya düşünce
    // sesi askıya alabiliyor. Müzik açıksa bir sonraki dokunuşta kaldığı yerden sürer.
    ctx.addEventListener('statechange', () => {
      if (playing && ctx?.state !== 'running') resumeOnNextGesture()
    })
    document.addEventListener('visibilitychange', () => {
      if (playing && !document.hidden && ctx?.state !== 'running') void ctx?.resume()
    })
  }
  return ctx
}

let waitingForGesture = false

function resumeOnNextGesture() {
  if (waitingForGesture) return
  waitingForGesture = true
  const resume = () => {
    waitingForGesture = false
    for (const type of ['pointerdown', 'keydown', 'touchend'] as const) window.removeEventListener(type, resume, true)
    if (playing) void ctx?.resume()
  }
  for (const type of ['pointerdown', 'keydown', 'touchend'] as const) window.addEventListener(type, resume, true)
}

// Çan sesi: temel ton ve iki üst ton, hızla sönümlenir.
function bell(midi: number, at: number, volume: number, length = 1.4) {
  const ac = audio()
  const out = ac.createGain()
  out.connect(master!)
  out.gain.setValueAtTime(0.0001, at)
  out.gain.exponentialRampToValueAtTime(volume, at + 0.008)
  out.gain.exponentialRampToValueAtTime(0.0001, at + length)
  for (const [ratio, level] of [
    [1, 1],
    [2.01, 0.28],
    [3.98, 0.08],
  ]) {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq(midi) * ratio
    g.gain.value = level
    osc.connect(g).connect(out)
    osc.start(at)
    osc.stop(at + length + 0.05)
  }
}

// Yarım saniye ileriyi planlar; zamanlayıcı her çeyrek saniyede bir çağırır.
function schedule() {
  const horizon = audio().currentTime + 0.5
  while (true) {
    const e = EVENTS[cursor]
    const at = loopStart + e.at
    if (at >= horizon) break
    bell(e.midi, at, e.volume, e.length)
    cursor++
    if (cursor === EVENTS.length) {
      cursor = 0
      loopStart += LOOP
    }
  }
}

export function isPlaying(): boolean {
  return playing
}

export async function startMusic(): Promise<void> {
  if (playing) return
  const ac = audio()
  await ac.resume()
  playing = true
  cursor = 0
  loopStart = ac.currentTime + 0.1
  schedule()
  timer = setInterval(schedule, 250)
}

// Bağlam askıya alınınca planlanmış notalar da hemen susar.
export function stopMusic(): void {
  playing = false
  if (timer) clearInterval(timer)
  timer = null
  void ctx?.suspend()
}

// Süse dokununca ya da süs asılınca çalan kısa çan. Müzik kapalıysa ses de çıkmaz.
export function chime(kind: 'tap' | 'hang' = 'tap'): void {
  if (!playing || !ctx) return
  const now = ctx.currentTime
  if (kind === 'tap') {
    bell(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)], now, 0.45, 1.2)
  } else {
    ;[84, 88, 91, 96].forEach((m, i) => bell(m, now + i * 0.09, 0.4, 1.4))
  }
}
