// Neon veritabanına tabloları kurar. Çalıştırma: node --env-file=.env.local scripts/migrate.mjs
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL tanımlı değil.')
  process.exit(1)
}

const sql = neon(url)
const text = await readFile(new URL('../drizzle/0000_init.sql', import.meta.url), 'utf8')
const statements = text.split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean)

for (const statement of statements) {
  await sql.query(statement)
}
console.log(`${statements.length} komut uygulandı.`)
