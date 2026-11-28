// Neon veritabanına tabloları kurar. Çalıştırma: node --env-file=.env.local scripts/migrate.mjs
// drizzle klasöründeki SQL dosyaları ad sırasıyla uygulanır; hepsi tekrar çalıştırılabilir.
import { readdir, readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL tanımlı değil.')
  process.exit(1)
}

const sql = neon(url)
const dir = new URL('../drizzle/', import.meta.url)
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()
let count = 0
for (const file of files) {
  const text = await readFile(new URL(file, dir), 'utf8')
  for (const statement of text.split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean)) {
    await sql.query(statement)
    count++
  }
}
console.log(`${count} komut uygulandı.`)
