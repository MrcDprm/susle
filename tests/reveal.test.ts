import { describe, expect, it } from 'vitest'
import { isRevealed, remainingUntil, revealAtFor, revealYear } from '@/lib/reveal'

describe('revealAtFor', () => {
  it('Aralık ortasında açılan ağaç 1 Ocak 00:00 Türkiye saatinde açılır', () => {
    const at = revealAtFor(new Date('2026-12-15T12:00:00Z'))
    expect(at.toISOString()).toBe('2026-12-31T21:00:00.000Z')
    expect(revealYear(at)).toBe(2027)
  })

  it('31 Aralık 23:59 Türkiye saatinde açılan ağaç bir dakika sonra açılır', () => {
    const at = revealAtFor(new Date('2026-12-31T20:59:00Z'))
    expect(at.toISOString()).toBe('2026-12-31T21:00:00.000Z')
  })

  it('1 Ocak 00:00 Türkiye saatinde açılan ağaç bir sonraki yılbaşını bekler', () => {
    const at = revealAtFor(new Date('2026-12-31T21:00:00Z'))
    expect(at.toISOString()).toBe('2027-12-31T21:00:00.000Z')
  })

  it('UTC tarihi henüz 31 Aralık olsa da Türkiye saati 1 Ocak ise yıl ilerler', () => {
    const at = revealAtFor(new Date('2026-12-31T22:30:00Z'))
    expect(revealYear(at)).toBe(2028)
  })
})

describe('isRevealed ve remainingUntil', () => {
  const reveal = new Date('2026-12-31T21:00:00Z')

  it('tam açılış anında açılmış sayılır', () => {
    expect(isRevealed(reveal, new Date('2026-12-31T20:59:59.999Z'))).toBe(false)
    expect(isRevealed(reveal, reveal)).toBe(true)
  })

  it('kalan süreyi gün, saat ve dakika olarak verir', () => {
    expect(remainingUntil(reveal, new Date('2026-12-29T19:30:00Z'))).toEqual({ days: 2, hours: 1, minutes: 30 })
    expect(remainingUntil(reveal, new Date('2026-12-31T20:59:30Z'))).toEqual({ days: 0, hours: 0, minutes: 1 })
    expect(remainingUntil(reveal, reveal)).toBeNull()
  })
})
