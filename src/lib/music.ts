// Müzik kutusu: şarkılar Web Audio ile çan tınısında çalınır. Ana ezginin altında bas, akor ve
// arpej eşliği akorlardan üretilir. Ses dosyası yok, notalar songs.ts'te.
import { parseBar, parseVoice, SONGS, type SongDef } from './songs'

type Event = { at: number; midi: number; volume: number; length: number }

const PENTATONIC = [79, 81, 84, 86, 88, 91]

// Akor notasını belli bir aralığa yerleştirir: bas 40-51, eşlik 55-66.
function place(pc: number, low: number): number {
  return low + ((pc - low) % 12 + 12) % 12
}

// Bir döngünün bütün notaları, döngü başından saniye cinsinden.
export function eventsOf(song: SongDef): { events: Event[]; loop: number } {
  const beat = 60 / song.bpm
  const list: Event[] = []
  let total = 0

  song.voices.forEach((text, v) => {
    let t = 0
    for (const n of parseVoice(text)) {
      if (n.midi !== null) {
        const lead = v === 0
        list.push({ at: t * beat, midi: n.midi, volume: lead ? 0.5 : 0.28, length: Math.min(1.8, n.beats * beat + 0.5) })
        // Uzun ezgi notalarına bir oktav yukarıdan ince bir parıltı eklenir.
        if (lead && n.beats >= 1.5) list.push({ at: t * beat + 0.02, midi: n.midi + 12, volume: 0.07, length: 1.2 })
      }
      t += n.beats
    }
    total = Math.max(total, t)
  })

  song.chords.forEach((spec, bar) => {
    if (spec === null) return
    const start = song.pickup + bar * song.beatsPerBar
    for (const part of parseBar(spec, song.beatsPerBar)) {
      const { chord } = part
      const bass = place(chord.bass, 40)
      const mid = chord.tones.slice(1).map((pc) => place(pc, 55))
      const fifth = place(chord.tones[2] ?? chord.root, 52)
      const at = (b: number) => (start + part.at + b) * beat
      const step = song.feel === 'compound' ? 0.5 : 1
      for (let b = 0; b < part.beats - 1e-9; b += step) {
        const first = b === 0
        if (song.feel === 'compound') {
          // Altı sekizlik akış: bas, beşli, kök, üçlü, kök, beşli.
          const k = Math.round((part.at + b) / 0.5) % 6
          const arp = [bass, fifth, place(chord.root, 60), place(chord.tones[1], 64), place(chord.root, 60), fifth]
          list.push({ at: at(b), midi: arp[k], volume: k === 0 ? 0.2 : 0.11, length: k === 0 ? 1.4 : 0.9 })
        } else if (song.feel === 'waltz') {
          if (first || (part.at + b) % song.beatsPerBar === 0) list.push({ at: at(b), midi: bass, volume: 0.2, length: 1.2 })
          else for (const m of mid) list.push({ at: at(b), midi: m, volume: 0.08, length: 0.7 })
        } else {
          const beatInBar = Math.round(part.at + b) % song.beatsPerBar
          if (beatInBar % 2 === 0) {
            const note = first || beatInBar === 0 ? bass : place(chord.tones[2] ?? chord.root, 40)
            list.push({ at: at(b), midi: note, volume: 0.2, length: 1.1 })
          } else {
            for (const m of mid) list.push({ at: at(b), midi: m, volume: 0.08, length: 0.7 })
          }
        }
      }
    }
  })

  const loop = Math.max(total, song.pickup + song.chords.length * song.beatsPerBar) * beat
  return { events: list.sort((x, y) => x.at - y.at), loop }
}

let songIndex = 0
let current = eventsOf(SONGS[0])

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
function bell(midi: number, at: number, volume: number, length = 1.4, dest?: AudioNode) {
  const ac = audio()
  const out = ac.createGain()
  out.connect(dest ?? master!)
  out.gain.setValueAtTime(0.0001, at)
  out.gain.exponentialRampToValueAtTime(volume, at + 0.008)
  out.gain.exponentialRampToValueAtTime(0.0001, at + length)
  // Pes notalar daha yumuşak: üst tonlar azalır.
  const bright = midi >= 60 ? 1 : 0.4
  for (const [ratio, level] of [
    [1, 1],
    [2.01, 0.28 * bright],
    [3.98, 0.08 * bright],
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
  const { events, loop } = current
  while (true) {
    const e = events[cursor]
    const at = loopStart + e.at
    if (at >= horizon) break
    bell(e.midi, at, e.volume, e.length)
    cursor++
    if (cursor === events.length) {
      cursor = 0
      loopStart += loop
    }
  }
}

// Ağacın müziği değişince çalan ezgi baştan başlar.
export function setSong(index: number): void {
  const next = SONGS[index] ? index : 0
  if (next === songIndex) return
  songIndex = next
  current = eventsOf(SONGS[next])
  if (playing && ctx) {
    cursor = 0
    loopStart = ctx.currentTime + 0.1
  }
}

let preview: GainNode | null = null

// Müzik kapalıyken şarkı seçilirse ilk birkaç saniyesi bir kez çalınır; açıksa şarkı değişir.
export function previewSong(index: number): void {
  if (playing) {
    setSong(index)
    return
  }
  stopPreview()
  const ac = audio()
  void ac.resume()
  const out = ac.createGain()
  out.gain.value = 0.16
  out.connect(ac.destination)
  preview = out
  const { events } = eventsOf(SONGS[index] ?? SONGS[0])
  const start = ac.currentTime + 0.08
  for (const e of events) {
    if (e.at > 7) break
    bell(e.midi, start + e.at, e.volume, e.length, out)
  }
  out.gain.setValueAtTime(0.16, start + 6.5)
  out.gain.linearRampToValueAtTime(0.0001, start + 8)
}

export function stopPreview(): void {
  if (!preview || !ctx) return
  const p = preview
  preview = null
  p.gain.cancelScheduledValues(ctx.currentTime)
  p.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08)
  setTimeout(() => p.disconnect(), 600)
}

export function isPlaying(): boolean {
  return playing
}

export async function startMusic(): Promise<void> {
  if (playing) return
  stopPreview()
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
