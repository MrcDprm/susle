// Türkiye 2016'dan beri yıl boyu UTC+3; yaz saati yok.
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000

// Ağacın açıldığı andan sonraki ilk 1 Ocak 00:00, Türkiye saatiyle.
export function revealAtFor(createdAt: Date): Date {
  const local = new Date(createdAt.getTime() + ISTANBUL_OFFSET_MS)
  const nextYear = local.getUTCFullYear() + 1
  return new Date(Date.UTC(nextYear, 0, 1) - ISTANBUL_OFFSET_MS)
}

// Ağacın hangi yıla girerken süslendiği, ör. 2027.
export function revealYear(revealAt: Date): number {
  return new Date(revealAt.getTime() + ISTANBUL_OFFSET_MS).getUTCFullYear()
}

export function isRevealed(revealAt: Date, now: Date): boolean {
  return now.getTime() >= revealAt.getTime()
}

export type Remaining = { days: number; hours: number; minutes: number }

export function remainingUntil(revealAt: Date, now: Date): Remaining | null {
  const ms = revealAt.getTime() - now.getTime()
  if (ms <= 0) return null
  const totalMinutes = Math.ceil(ms / 60000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }
}
