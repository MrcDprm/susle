import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import type { Db } from './client'
import * as schema from './schema'

// Yerel geliştirme ve testler için gömülü Postgres. dataDir verilmezse bellekte açılır.
// drizzle klasöründeki SQL dosyaları ad sırasıyla uygulanır; hepsi tekrar çalıştırılabilir.
export async function openLocalDb(dataDir?: string): Promise<Db> {
  const client = new PGlite(dataDir)
  const dir = path.join(process.cwd(), 'drizzle')
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    const text = await readFile(path.join(dir, file), 'utf8')
    for (const statement of text.split('--> statement-breakpoint')) {
      if (statement.trim()) await client.exec(statement)
    }
  }
  return drizzle({ client, schema }) as unknown as Db
}
