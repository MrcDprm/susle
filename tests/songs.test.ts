import { describe, expect, it } from 'vitest'
import { eventsOf } from '@/lib/music'
import { noteToMidi, parseBar, parseChord, parseVoice, SONGS } from '@/lib/songs'

describe('nota yazısı', () => {
  it('nota adlarını MIDI numarasına çevirir', () => {
    expect(noteToMidi('C4')).toBe(60)
    expect(noteToMidi('A4')).toBe(69)
    expect(noteToMidi('Bb4')).toBe(70)
    expect(noteToMidi('F#5')).toBe(78)
  })

  it('bozuk notayı ve uzunluğu reddeder', () => {
    expect(() => noteToMidi('H4')).toThrow()
    expect(() => parseVoice('C4:0')).toThrow()
    expect(() => parseVoice('C4')).toThrow()
  })

  it('akorları ve bas notasını çözer', () => {
    expect(parseChord('Gm/F')).toEqual({ root: 7, bass: 5, tones: [7, 10, 2] })
    expect(parseChord('G7').tones).toEqual([7, 11, 2, 5])
    expect(() => parseChord('Q')).toThrow()
  })

  it('ölçüyü akorlar arasında böler', () => {
    expect(parseBar('F:2 G7:2', 4).map((p) => [p.at, p.beats])).toEqual([
      [0, 2],
      [2, 2],
    ])
    expect(parseBar('C:1 D7', 3).map((p) => [p.at, p.beats])).toEqual([
      [0, 1],
      [1, 2],
    ])
  })
})

describe('şarkılar', () => {
  SONGS.forEach((song, i) => {
    const length = song.pickup + song.chords.length * song.beatsPerBar

    it(`${i}. şarkının her sesi ölçülerle aynı uzunlukta`, () => {
      for (const voice of song.voices) {
        const beats = parseVoice(voice).reduce((s, n) => s + n.beats, 0)
        expect(beats).toBeCloseTo(length, 6)
      }
    })

    it(`${i}. şarkının her akoru ölçüyü tam dolduruyor`, () => {
      for (const spec of song.chords) {
        if (spec === null) continue
        const parts = parseBar(spec, song.beatsPerBar)
        expect(parts.reduce((s, p) => s + p.beats, 0)).toBeCloseTo(song.beatsPerBar, 6)
      }
    })

    it(`${i}. şarkının notaları duyulur aralıkta ve döngü süresi doğru`, () => {
      const { events, loop } = eventsOf(song)
      expect(events.length).toBeGreaterThan(20)
      expect(loop).toBeCloseTo((length * 60) / song.bpm, 6)
      for (const e of events) {
        expect(e.midi).toBeGreaterThanOrEqual(36)
        expect(e.midi).toBeLessThanOrEqual(102)
        expect(e.at).toBeLessThan(loop)
      }
    })
  })
})
