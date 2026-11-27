// Takvim dosyası, RFC 5545. Metinlerdeki ters bölü, virgül, noktalı virgül ve satır sonu kaçışlanır.
export function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// 75 baytı geçen satırlar bölünür; devam satırı bir boşlukla başlar.
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let current = ''
  for (const ch of line) {
    if (new TextEncoder().encode(current + ch).length > (parts.length === 0 ? 75 : 74)) {
      parts.push(current)
      current = ''
    }
    current += ch
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function reminderIcs(opts: { uid: string; start: Date; title: string; body: string; url: string; now?: Date }): string {
  const end = new Date(opts.start.getTime() + 30 * 60 * 1000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Susle//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${opts.uid}@susle.miracdeprem.com`,
    `DTSTAMP:${stamp(opts.now ?? new Date())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${icsEscape(opts.title)}`,
    `DESCRIPTION:${icsEscape(`${opts.body} ${opts.url}`)}`,
    `URL:${opts.url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(opts.title)}`,
    'TRIGGER:PT0S',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
