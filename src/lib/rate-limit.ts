import { sql } from 'drizzle-orm'
import { rowsOf, type Db } from './db/client'

export const LIMITS = {
  ornament: { max: 10, windowSec: 3600 },
  tree: { max: 5, windowSec: 86400 },
} as const

// Sabit pencereli sayaç. Tek SQL komutu olduğu için aynı anda gelen iki istek sayacı atlatamaz.
export async function hit(
  db: Db,
  key: string,
  limit: { max: number; windowSec: number },
  now = new Date(),
): Promise<boolean> {
  const since = new Date(now.getTime() - limit.windowSec * 1000)
  const result = await db.execute(sql`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (${key}, ${now.toISOString()}, 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start <= ${since.toISOString()} THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start <= ${since.toISOString()} THEN ${now.toISOString()}::timestamptz ELSE rate_limits.window_start END
    RETURNING count
  `)
  const count = Number(rowsOf<{ count: number }>(result)[0]?.count ?? Infinity)

  // Süresi geçmiş sayaçlar ara sıra temizlenir; tablo büyümez.
  if (Math.random() < 0.02) {
    const old = new Date(now.getTime() - 2 * 86400 * 1000)
    await db.execute(sql`DELETE FROM rate_limits WHERE window_start < ${old.toISOString()}`)
  }
  return count <= limit.max
}
