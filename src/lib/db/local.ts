import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import type { Db } from './client'
import * as schema from './schema'

// Yerel geliştirme ve testler için gömülü Postgres. dataDir verilmezse bellekte açılır.
export async function openLocalDb(dataDir?: string): Promise<Db> {
  const client = new PGlite(dataDir)
  const file = path.join(process.cwd(), 'drizzle', '0000_init.sql')
  const text = await readFile(file, 'utf8')
  for (const statement of text.split('--> statement-breakpoint')) {
    if (statement.trim()) await client.exec(statement)
  }
  return drizzle({ client, schema }) as unknown as Db
}
