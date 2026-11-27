import { boolean, integer, pgTable, smallint, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

// drizzle/0000_init.sql ile birebir aynı olmalı; testler tabloları o dosyadan kurar.
export const trees = pgTable('trees', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  style: smallint('style').notNull(),
  lang: text('lang').notNull(),
  ownerKeyHash: text('owner_key_hash').notNull().unique(),
  accepting: boolean('accepting').notNull().default(true),
  revealAt: timestamp('reveal_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const ornaments = pgTable(
  'ornaments',
  {
    id: uuid('id').primaryKey(),
    treeId: text('tree_id')
      .notNull()
      .references(() => trees.id, { onDelete: 'cascade' }),
    slot: integer('slot').notNull(),
    kind: smallint('kind').notNull(),
    authorName: text('author_name'),
    body: text('body').notNull(),
    isPublic: boolean('is_public').notNull().default(false),
    ipHash: text('ip_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.treeId, t.slot)],
)

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull(),
})
