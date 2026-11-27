import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from './schema'

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

// Next sayfaları ve API rotalarını ayrı paketlerde derleyebiliyor; bağlantı süreç genelinde
// tek olsun diye globalThis'te tutulur. Yerel PGlite'ın iki kopyası birbirinin yazdığını görmez.
const store = globalThis as typeof globalThis & { __susleDb?: Promise<Db> }

export function getDb(): Promise<Db> {
  store.__susleDb ??= open()
  return store.__susleDb
}

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL
  if (url && url.startsWith('postgres')) {
    const { neon } = await import('@neondatabase/serverless')
    const { drizzle } = await import('drizzle-orm/neon-http')
    return drizzle({ client: neon(url), schema }) as unknown as Db
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL tanımlı değil.')
  }
  // Yerel geliştirme: Neon olmadan da çalışsın diye gömülü Postgres.
  const { openLocalDb } = await import('./local')
  return openLocalDb('.pglite')
}

// Neon HTTP ve PGlite sürücüleri ham sorgu sonucunu aynı biçimde, { rows } olarak döndürür.
export function rowsOf<T>(result: unknown): T[] {
  return (result as { rows: T[] }).rows
}
