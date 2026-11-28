// Müzik kutusu: üç yılbaşı ezgisi, Web Audio ile çan tınısında çalınır. Ağacın sahibi birini seçer.
// Üçü de kamu malı: Jingle Bells 1857, We Wish You a Merry Christmas ve Deck the Halls geleneksel.
// Ses dosyası yok, notalar kodda üretilir.

type Note = [midi: number | null, beats: number]

type Song = {
  bpm: number
  beatsPerBar: number
  // Ezgi ilk ölçüden önce başlıyorsa önden gelen vuruş sayısı.
  pickup: number
  melody: Note[]
  // Her ölçünün kök notası; null o ölçüde eşlik yok demektir.
  bass: (number | null)[]
}

const E = 76, F = 77, G = 79, C5 = 72, D = 74, A = 81, B = 83, C6 = 84, Fs = 78

const SONGS: Song[] = [
  {
    bpm: 118,
    beatsPerBar: 4,
    pickup: 0,
    melody: [
      [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2], [E, 1], [G, 1], [C5, 1.5], [D, 0.5], [E, 4],
      [F, 1], [F, 1], [F, 1.5], [F, 0.5], [F, 1], [E, 1], [E, 1], [E, 0.5], [E, 0.5], [E, 1], [D, 1], [D, 1], [E, 1], [D, 2], [G, 2],
      [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2], [E, 1], [G, 1], [C5, 1.5], [D, 0.5], [E, 4],
      [F, 1], [F, 1], [F, 1.5], [F, 0.5], [F, 1], [E, 1], [E, 1], [E, 0.5], [E, 0.5], [G, 1], [G, 1], [F, 1], [D, 1], [C5, 4],
      [null, 4],
    ],
    bass: [48, 48, 48, 48, 53, 48, 50, 43, 48, 48, 48, 48, 53, 48, 43, 48, null],
  },
  {
    // We Wish You a Merry Christmas, 3/4, sol majör.
    bpm: 132,
    beatsPerBar: 3,
    pickup: 1,
    melody: [
      [D, 1],
      [G, 1], [G, 0.5], [A, 0.5], [G, 0.5], [Fs, 0.5],
      [E, 1], [E, 1], [E, 1],
      [A, 1], [A, 0.5], [B, 0.5], [A, 0.5], [G, 0.5],
      [Fs, 1], [D, 1], [D, 1],
      [B, 1], [B, 0.5], [C6, 0.5], [B, 0.5], [A, 0.5],
      [G, 1], [E, 1], [D, 0.5], [D, 0.5],
      [E, 1], [A, 1], [Fs, 1],
      [G, 3],
      [null, 2],
    ],
    bass: [43, 48, 45, 50, 47, 52, 48, 43, null],
  },
  {
    // Deck the Halls, 4/4, do majör.
    bpm: 120,
    beatsPerBar: 4,
    pickup: 0,
    melody: [
      [G, 1.5], [F, 0.5], [E, 1], [D, 1], [C5, 1], [D, 1], [E, 1], [C5, 1],
      [D, 0.5], [E, 0.5], [F, 0.5], [D, 0.5], [E, 1.5], [D, 0.5], [C5, 1], [71, 1], [C5, 2],
      [G, 1.5], [F, 0.5], [E, 1], [D, 1], [C5, 1], [D, 1], [E, 1], [C5, 1],
      [D, 0.5], [E, 0.5], [F, 0.5], [D, 0.5], [E, 1.5], [D, 0.5], [C5, 1], [71, 1], [C5, 2],
      [D, 1.5], [E, 0.5], [F, 1], [D, 1], [E, 1.5], [F, 0.5], [G, 1], [D, 1],
      [E, 0.5], [Fs, 0.5], [G, 1], [A, 0.5], [B, 0.5], [C6, 1], [B, 1], [A, 1], [G, 2],
      [G, 1.5], [F, 0.5], [E, 1], [D, 1], [C5, 1], [D, 1], [E, 1], [C5, 1],
      [A, 0.5], [A, 0.5], [A, 0.5], [A, 0.5], [G, 1.5], [F, 0.5], [E, 1], [D, 1], [C5, 2],
      [null, 4],
    ],
    bass: [48, 48, 43, 48, 48, 48, 43, 48, 43, 43, 50, 43, 48, 48, 53, 48, null],
  },
]

const PENTATONIC = [79, 81, 84, 86, 88, 91]

type Event = { at: number; midi: number; volume: number; length: number }

// Bir döngünün bütün notaları, döngü başından saniye cinsinden.
function eventsOf(song: Song): { events: Event[]; loop: number } {
  const beat = 60 / song.bpm
  const list: Event[] = []
  let t = 0
  for (const [midi, beats] of song.melody) {
    if (midi !== null) list.push({ at: t * beat, midi, volume: 0.55, length: Math.min(1.6, beats * beat + 0.6) })
    t += beats
  }
  song.bass.forEach((midi, bar) => {
    if (midi === null) return
    const start = song.pickup + bar * song.beatsPerBar
    list.push({ at: start * beat, midi, volume: 0.22, length: 1.1 })
    const offsets = song.beatsPerBar === 3 ? [1, 2] : [2]
    for (const o of offsets) list.push({ at: (start + o) * beat, midi: midi + 7, volume: 0.16, length: 1 })
  })
  return { events: list.sort((x, y) => x.at - y.at), loop: t * beat }
}

let current = eventsOf(SONGS[0])
let songIndex = 0
let EVENTS = current.events
let LOOP = current.loop

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

// Ağacın müziği değişince çalan ezgi baştan başlar.
export function setSong(index: number): void {
  const next = SONGS[index] ? index : 0
  if (next === songIndex) return
  songIndex = next
  current = eventsOf(SONGS[next])
  EVENTS = current.events
  LOOP = current.loop
  if (playing && ctx) {
    cursor = 0
    loopStart = ctx.currentTime + 0.1
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
