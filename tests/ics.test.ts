import { describe, expect, it } from 'vitest'
import { icsEscape, reminderIcs } from '@/lib/ics'

describe('takvim hatırlatıcısı', () => {
  it('ağaç adındaki özel karakterler kaçışlanır', () => {
    expect(icsEscape('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
  })

  it('etkinlik açılış anında başlar ve alarmı tam o anda çalar', () => {
    const ics = reminderIcs({
      uid: 'abcdefgh23',
      start: new Date('2026-12-31T21:00:00Z'),
      title: 'Ayşe, Can; ağacı',
      body: 'Mesajlar açıldı:',
      url: 'https://susle.miracdeprem.com/a/abcdefgh23',
      now: new Date('2026-12-01T10:00:00Z'),
    })
    expect(ics).toContain('DTSTART:20261231T210000Z')
    expect(ics).toContain('TRIGGER:PT0S')
    expect(ics).toContain('SUMMARY:Ayşe\\, Can\\; ağacı')
    expect(ics.split('\r\n').every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true)
  })

  it('kullanıcının yazdığı satır sonu yeni bir takvim alanı açamaz', () => {
    const ics = reminderIcs({ uid: 'x', start: new Date(), title: 'a\nATTENDEE:kotu', body: 'b', url: 'u' })
    expect(ics.split('\r\n').some((line) => line.startsWith('ATTENDEE'))).toBe(false)
  })
})
