// Müzik kutusu şarkıları. Hepsi kamu malı ya da bu proje için yazılmış ezgiler.
// Notalar metin olarak tutulur: "E5:1" bir vuruş mi, "F#4:0.5" yarım vuruş fa diyez, "r:2" iki vuruş sus.
// Akorlar ölçü başına: "C" bütün ölçü, "F:2 G7:2" ölçünün yarısı fa yarısı sol yedili, "Gm/F" basta fa.

export type Feel = 'march' | 'waltz' | 'compound'

export type SongDef = {
  bpm: number
  beatsPerBar: number
  // Ezgi ilk ölçüden önce başlıyorsa önden gelen vuruş sayısı.
  pickup: number
  feel: Feel
  // İlk satır ana ezgi, diğerleri ikinci ses.
  voices: string[]
  chords: (string | null)[]
}

const rep = (s: string, n: number) => Array.from({ length: n }, () => s).join(' ')

export const SONGS: SongDef[] = [
  {
    // Jingle Bells, 1857. Kıta ve nakarat.
    bpm: 132,
    beatsPerBar: 4,
    pickup: 0,
    feel: 'march',
    voices: [
      [
        'G4:1 E5:1 D5:1 C5:1 G4:3 G4:0.5 G4:0.5 G4:1 E5:1 D5:1 C5:1 A4:4',
        'A4:1 F5:1 E5:1 D5:1 B4:4 G5:1 G5:1 F5:1 D5:1 E5:4',
        'G4:1 E5:1 D5:1 C5:1 G4:4 G4:1 E5:1 D5:1 C5:1 A4:3 A4:1',
        'A4:1 F5:1 E5:1 D5:1 G5:1 G5:1 G5:1 G5:1 A5:1 G5:1 F5:1 D5:1 C5:3 r:1',
        'E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4',
        'F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 E5:1 D5:1 D5:1 E5:1 D5:2 G5:2',
        'E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4',
        'F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 G5:1 G5:1 F5:1 D5:1 C5:4 r:4',
      ].join(' '),
    ],
    chords: [
      'C', 'C', 'C', 'F', 'F', 'G', 'G7', 'C', 'C', 'C', 'C', 'F', 'F', 'G', 'G7', 'C',
      'C', 'C', 'C', 'C', 'F', 'C', 'D7', 'G7', 'C', 'C', 'C', 'C', 'F', 'C', 'G7', 'C', null,
    ],
  },
  {
    // We Wish You a Merry Christmas, geleneksel. Sol majör, 3/4.
    bpm: 138,
    beatsPerBar: 3,
    pickup: 1,
    feel: 'waltz',
    voices: [
      [
        'D5:1',
        'G5:1 G5:0.5 A5:0.5 G5:0.5 F#5:0.5 E5:1 E5:1 E5:1 A5:1 A5:0.5 B5:0.5 A5:0.5 G5:0.5 F#5:1 D5:1 D5:1',
        'B5:1 B5:0.5 C6:0.5 B5:0.5 A5:0.5 G5:1 E5:1 D5:0.5 D5:0.5 E5:1 A5:1 F#5:1 G5:2 D5:1',
        'G5:1 G5:1 G5:1 F#5:2 F#5:1 G5:1 F#5:1 E5:1 D5:2 A5:1',
        'B5:1 A5:1 G5:1 D6:1 D5:1 D5:0.5 D5:0.5 E5:1 A5:1 F#5:1 G5:2 r:1',
      ].join(' '),
    ],
    chords: ['G', 'C', 'A7', 'D', 'B7', 'Em', 'C:1 D7:2', 'G', 'G', 'D', 'Em', 'D', 'G', 'D7', 'C:1 D7:2', 'G'],
  },
  {
    // Deck the Halls, geleneksel Gal ezgisi.
    bpm: 120,
    beatsPerBar: 4,
    pickup: 0,
    feel: 'march',
    voices: [
      [
        'G5:1.5 F5:0.5 E5:1 D5:1 C5:1 D5:1 E5:1 C5:1 D5:0.5 E5:0.5 F5:0.5 D5:0.5 E5:1.5 D5:0.5 C5:1 B4:1 C5:2',
        'G5:1.5 F5:0.5 E5:1 D5:1 C5:1 D5:1 E5:1 C5:1 D5:0.5 E5:0.5 F5:0.5 D5:0.5 E5:1.5 D5:0.5 C5:1 B4:1 C5:2',
        'D5:1.5 E5:0.5 F5:1 D5:1 E5:1.5 F5:0.5 G5:1 D5:1 E5:0.5 F#5:0.5 G5:1 A5:0.5 B5:0.5 C6:1 B5:1 A5:1 G5:2',
        'G5:1.5 F5:0.5 E5:1 D5:1 C5:1 D5:1 E5:1 C5:1 A5:0.5 A5:0.5 A5:0.5 A5:0.5 G5:1.5 F5:0.5 E5:1 D5:1 C5:2 r:4',
      ].join(' '),
    ],
    chords: [
      'C', 'C', 'G7:2 C:2', 'F:1 G7:1 C:2', 'C', 'C', 'G7:2 C:2', 'F:1 G7:1 C:2',
      'G7', 'C:2 G:2', 'D7', 'D7:2 G:2', 'C', 'C', 'F:2 G7:2', 'C:1 G7:1 C:2', null,
    ],
  },
  {
    // Silent Night, Franz Gruber 1818. 6/8, ölçü üç vuruş sayılır.
    bpm: 80,
    beatsPerBar: 3,
    pickup: 0,
    feel: 'compound',
    voices: [
      [
        'G5:0.75 A5:0.25 G5:0.5 E5:1.5 G5:0.75 A5:0.25 G5:0.5 E5:1.5 D6:1 D6:0.5 B5:1.5 C6:1 C6:0.5 G5:1.5',
        'A5:1 A5:0.5 C6:0.75 B5:0.25 A5:0.5 G5:0.75 A5:0.25 G5:0.5 E5:1.5',
        'A5:1 A5:0.5 C6:0.75 B5:0.25 A5:0.5 G5:0.75 A5:0.25 G5:0.5 E5:1.5',
        'D6:1 D6:0.5 F6:0.75 D6:0.25 B5:0.5 C6:1.5 E6:1.5 C6:0.5 G5:0.5 E5:0.5 G5:0.75 F5:0.25 D5:0.5 C5:3 r:3',
      ].join(' '),
    ],
    chords: ['C', 'C', 'G7', 'C', 'F', 'C', 'F', 'C', 'G7', 'C', 'C:1.5 G7:1.5', 'C', null],
  },
  {
    // Auld Lang Syne, İskoç halk ezgisi. Yeni yılın şarkısı.
    bpm: 84,
    beatsPerBar: 4,
    pickup: 1,
    feel: 'march',
    voices: [
      [
        'G4:1',
        'C5:1.5 C5:0.5 C5:1 E5:1 D5:1.5 C5:0.5 D5:1 E5:1 C5:1.5 C5:0.5 E5:1 G5:1 A5:3 A5:1',
        'G5:1.5 E5:0.5 E5:1 C5:1 D5:1.5 C5:0.5 D5:1 E5:1 C5:1.5 A4:0.5 A4:1 G4:1 C5:3 A5:1',
        'G5:1.5 E5:0.5 E5:1 C5:1 D5:1.5 C5:0.5 D5:1 A5:1 G5:1.5 E5:0.5 E5:1 G5:1 A5:3 C6:1',
        'G5:1.5 E5:0.5 E5:1 C5:1 D5:1.5 C5:0.5 D5:1 E5:1 C5:1.5 A4:0.5 A4:1 G4:1 C5:3 r:1',
      ].join(' '),
    ],
    chords: ['C', 'G7', 'C', 'F', 'C', 'G7', 'F:3 G7:1', 'C', 'C', 'G7', 'C', 'F', 'C', 'G7', 'F:3 G7:1', 'C'],
  },
  {
    // Carol of the Bells, Mykola Leontovych 1916. Dört notalık çan motifi hiç durmadan çalar.
    bpm: 168,
    beatsPerBar: 3,
    pickup: 0,
    feel: 'waltz',
    voices: [
      [
        rep('r:3', 4),
        rep('D5:1 C5:0.5 D5:0.5 Bb4:1', 4),
        'G5:1 G5:0.5 G5:0.5 F5:0.5 Eb5:0.5 D5:1 D5:0.5 D5:0.5 C5:0.5 Bb4:0.5 C5:1 C5:0.5 C5:0.5 D5:0.5 C5:0.5 G4:3',
        rep('D5:1 C5:0.5 D5:0.5 Bb4:1', 3),
        'G4:3',
      ].join(' '),
      rep('Bb4:1 A4:0.5 Bb4:0.5 G4:1', 16),
    ],
    chords: [
      'Gm', 'Gm/F', 'Eb', 'D', 'Gm', 'Gm/F', 'Eb', 'D', 'Gm', 'Gm/F', 'Eb', 'D', 'Gm', 'Gm/F', 'Eb', 'Gm',
    ],
  },
  {
    // Good King Wenceslas, 1582 tarihli Tempus adest floridum ezgisi.
    bpm: 112,
    beatsPerBar: 4,
    pickup: 0,
    feel: 'march',
    voices: [
      [
        'C5:1 C5:1 C5:1 D5:1 C5:1 C5:1 G4:2 A4:1 G4:1 A4:1 B4:1 C5:2 C5:2',
        'C5:1 C5:1 C5:1 D5:1 C5:1 C5:1 G4:2 A4:1 G4:1 A4:1 B4:1 C5:2 C5:2',
        'G5:1 F5:1 E5:1 D5:1 E5:1 D5:1 C5:2 A4:1 G4:1 A4:1 B4:1 C5:2 C5:2',
        'G4:1 G4:1 A4:1 B4:1 C5:1 C5:1 D5:2 G5:1 F5:1 E5:1 D5:1 C5:2 F5:2 C5:4 r:4',
      ].join(' '),
    ],
    chords: ['C', 'C', 'F:2 G:2', 'C', 'C', 'C', 'F:2 G:2', 'C', 'G7', 'C', 'F:2 G:2', 'C', 'C:2 G:2', 'Am:2 G:2', 'G7', 'C:2 F:2', 'C', null],
  },
  {
    // Greensleeves, 16. yüzyıl İngiliz ezgisi.
    bpm: 104,
    beatsPerBar: 3,
    pickup: 1,
    feel: 'waltz',
    voices: [
      [
        'A4:1',
        'C5:2 D5:1 E5:1.5 F5:0.5 E5:1 D5:2 B4:1 G4:1.5 A4:0.5 B4:1 C5:2 A4:1 A4:1.5 G#4:0.5 A4:1 B4:2 G#4:1 E4:2 A4:1',
        'C5:2 D5:1 E5:1.5 F5:0.5 E5:1 D5:2 B4:1 G4:1.5 A4:0.5 B4:1 C5:1.5 B4:0.5 A4:1 G#4:1.5 F#4:0.5 G#4:1 A4:3',
        'G5:3 G5:1.5 F#5:0.5 E5:1 D5:2 B4:1 G4:1.5 A4:0.5 B4:1 C5:2 A4:1 A4:1.5 G#4:0.5 A4:1 B4:2 G#4:1 E4:3',
        'G5:3 G5:1.5 F#5:0.5 E5:1 D5:2 B4:1 G4:1.5 A4:0.5 B4:1 C5:1.5 B4:0.5 A4:1 G#4:1.5 F#4:0.5 G#4:1 A4:3 A4:2 r:1',
      ].join(' '),
    ],
    chords: [
      'Am', 'C', 'G', 'Em', 'Am', 'E', 'E', 'Am', 'Am', 'C', 'G', 'Em', 'Am', 'E', 'Am',
      'C', 'Em', 'G', 'Em', 'Am', 'E', 'E', 'E', 'C', 'Em', 'G', 'Em', 'Am', 'E', 'Am', 'Am',
    ],
  },
  {
    // Neşeye Övgü, Beethoven 1824.
    bpm: 112,
    beatsPerBar: 4,
    pickup: 0,
    feel: 'march',
    voices: [
      [
        'E5:1 E5:1 F5:1 G5:1 G5:1 F5:1 E5:1 D5:1 C5:1 C5:1 D5:1 E5:1 E5:1.5 D5:0.5 D5:2',
        'E5:1 E5:1 F5:1 G5:1 G5:1 F5:1 E5:1 D5:1 C5:1 C5:1 D5:1 E5:1 D5:1.5 C5:0.5 C5:2',
        'D5:1 D5:1 E5:1 C5:1 D5:1 E5:0.5 F5:0.5 E5:1 C5:1 D5:1 E5:0.5 F5:0.5 E5:1 D5:1 C5:1 D5:1 G4:2',
        'E5:1 E5:1 F5:1 G5:1 G5:1 F5:1 E5:1 D5:1 C5:1 C5:1 D5:1 E5:1 D5:1.5 C5:0.5 C5:2 r:4',
      ].join(' '),
    ],
    chords: ['C', 'G7', 'C', 'G7', 'C', 'G7', 'C', 'G7:2 C:2', 'G7', 'C', 'G7', 'C:2 G:2', 'C', 'G7', 'C', 'G7:2 C:2', null],
  },
  {
    // Küçük yıldız, 18. yüzyıl Fransız ezgisi. Müzik kutularının en bilinen şarkısı.
    bpm: 104,
    beatsPerBar: 4,
    pickup: 0,
    feel: 'march',
    voices: [
      [
        'C5:1 C5:1 G5:1 G5:1 A5:1 A5:1 G5:2 F5:1 F5:1 E5:1 E5:1 D5:1 D5:1 C5:2',
        'G5:1 G5:1 F5:1 F5:1 E5:1 E5:1 D5:2 G5:1 G5:1 F5:1 F5:1 E5:1 E5:1 D5:2',
        'C5:1 C5:1 G5:1 G5:1 A5:1 A5:1 G5:2 F5:1 F5:1 E5:1 E5:1 D5:1 D5:1 C5:2 r:4',
      ].join(' '),
    ],
    chords: ['C', 'F:2 C:2', 'F:2 C:2', 'G7:2 C:2', 'C:2 F:2', 'C:2 G:2', 'C:2 F:2', 'C:2 G:2', 'C', 'F:2 C:2', 'F:2 C:2', 'G7:2 C:2', null],
  },
  {
    // Kar valsi, Süsle için yazıldı.
    bpm: 126,
    beatsPerBar: 3,
    pickup: 0,
    feel: 'waltz',
    voices: [
      [
        'E5:2 G5:1 C6:2 B5:1 A5:1 G5:1 E5:1 G5:3 F5:2 A5:1 D6:2 C6:1 B5:1 A5:1 F5:1 G5:3',
        'E5:2 G5:1 C6:2 E6:1 D6:1 C6:1 A5:1 G5:2 E5:1 F5:1 A5:1 D6:1 C6:1 B5:1 G5:1 B5:1 D6:1 B5:1 C6:3 r:3',
      ].join(' '),
      [
        'r:3 C5:1 E5:1 G5:1 r:3 E5:1 D5:1 C5:1 r:3 F5:1 A5:1 F5:1 r:3 D5:1 B4:1 D5:1',
        'r:3 C5:1 E5:1 G5:1 r:3 E5:1 C5:1 E5:1 r:3 D5:1 B4:1 D5:1 r:3 C5:3 r:3',
      ].join(' '),
    ],
    chords: ['C', 'C', 'Am', 'C', 'F', 'Dm7', 'G7', 'G', 'C', 'C', 'Dm7', 'C', 'Dm', 'C:1 G7:2', 'G7', 'C', null],
  },
  {
    // Gece yarısı, Süsle için yazıldı. Saat on ikiyi vururken çalan çanları andırır.
    bpm: 96,
    beatsPerBar: 4,
    pickup: 0,
    feel: 'march',
    voices: [
      [
        'C6:0.5 G5:0.5 E5:0.5 G5:0.5 C6:1 G5:1 A5:0.5 F5:0.5 C5:0.5 F5:0.5 A5:2',
        'G5:0.5 E5:0.5 C5:0.5 E5:0.5 G5:1 C6:1 B5:1 D6:1 G5:2',
        'C6:0.5 G5:0.5 E5:0.5 G5:0.5 C6:1 E6:1 D6:0.5 A5:0.5 F5:0.5 A5:0.5 D6:2',
        'C6:1 B5:1 A5:1 B5:1 C6:4 r:4',
      ].join(' '),
    ],
    chords: ['C', 'F', 'C', 'G7', 'C', 'Dm', 'F:2 G7:2', 'C', null],
  },
]

export const SONG_COUNT = SONGS.length

// Nota adı MIDI numarasına: C4 orta do, 60.
const LETTERS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

export function noteToMidi(name: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name)
  if (!m) throw new Error(`bad note ${name}`)
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0
  return (Number(m[3]) + 1) * 12 + LETTERS[m[1]] + acc
}

export type Note = { midi: number | null; beats: number }

export function parseVoice(text: string): Note[] {
  return text
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [name, dur] = token.split(':')
      const beats = Number(dur)
      if (!(beats > 0)) throw new Error(`bad length ${token}`)
      return { midi: name === 'r' ? null : noteToMidi(name), beats }
    })
}

export type Chord = { root: number; bass: number; tones: number[] }

const QUALITIES: Record<string, number[]> = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  dim: [0, 3, 6],
}

function pitchClass(name: string): number {
  const m = /^([A-G])(#|b)?$/.exec(name)
  if (!m) throw new Error(`bad chord root ${name}`)
  return (LETTERS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12
}

export function parseChord(symbol: string): Chord {
  const [main, slash] = symbol.split('/')
  const m = /^([A-G][#b]?)(maj7|m7|m|7|dim)?$/.exec(main)
  if (!m) throw new Error(`bad chord ${symbol}`)
  const root = pitchClass(m[1])
  const tones = QUALITIES[m[2] ?? ''].map((i) => (root + i) % 12)
  return { root, bass: slash ? pitchClass(slash) : root, tones }
}

// Bir ölçünün akorları: [başlangıç vuruşu, uzunluk, akor].
export function parseBar(spec: string, beatsPerBar: number): { at: number; beats: number; chord: Chord }[] {
  const parts = spec.trim().split(/\s+/)
  const fixed = parts.map((p) => (p.includes(':') ? Number(p.split(':')[1]) : null))
  const known = fixed.reduce<number>((s, b) => s + (b ?? 0), 0)
  const free = fixed.filter((b) => b === null).length
  const each = free > 0 ? (beatsPerBar - known) / free : 0
  let at = 0
  return parts.map((p, i) => {
    const beats = fixed[i] ?? each
    const out = { at, beats, chord: parseChord(p.split(':')[0]) }
    at += beats
    return out
  })
}
