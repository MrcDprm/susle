import { z } from 'zod'
import { TREE_ID_PATTERN } from './ids'
import { lookSchema } from './look'

export const ORNAMENT_KINDS = 20
export const TREE_STYLES = 9
export const MAX_BODY = 500
export const MAX_NAME = 30
export const MAX_TREE_NAME = 40
export const MAX_LINES = 15
export const MAX_NOTE = 80

// Görünmeyen ve yön değiştiren karakterler atılır; satır sonu ve sekme kalır.
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g

function clean(value: string): string {
  return value.normalize('NFC').replace(/\r\n?/g, '\n').replace(INVISIBLE, '')
}

function oneLine(value: string): string {
  return clean(value).replace(/\s+/g, ' ').trim()
}

function length(value: string): number {
  return [...value].length
}

export const langSchema = z.enum(['tr', 'en'])
export const treeIdSchema = z.string().regex(TREE_ID_PATTERN)

// Ağacın altındaki kısa not; boşsa saklanmaz.
const noteSchema = z
  .string()
  .max(400)
  .transform(oneLine)
  .refine((v) => length(v) <= MAX_NOTE, 'long')
  .transform((v) => (v === '' ? null : v))

export const createTreeSchema = z.object({
  name: z
    .string()
    .max(200)
    .transform(oneLine)
    .refine((v) => length(v) >= 1, 'empty')
    .refine((v) => length(v) <= MAX_TREE_NAME, 'long'),
  style: z.number().int().min(0).max(TREE_STYLES - 1),
  lang: langSchema,
  // Ağaç açılırken süsleme adımında seçilenler; gönderilmezse varsayılan görünüm.
  look: lookSchema.optional(),
  note: noteSchema.optional(),
})

export const hangOrnamentSchema = z.object({
  treeId: treeIdSchema,
  authorName: z
    .string()
    .max(200)
    .transform(oneLine)
    .refine((v) => length(v) <= MAX_NAME, 'long')
    .transform((v) => (v === '' ? null : v)),
  kind: z.number().int().min(0).max(ORNAMENT_KINDS - 1),
  body: z
    .string()
    .max(4000)
    .transform((v) =>
      clean(v)
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
    )
    .refine((v) => length(v) >= 1, 'empty')
    .refine((v) => length(v) <= MAX_BODY, 'long')
    .refine((v) => v.split('\n').length <= MAX_LINES, 'lines'),
  isPublic: z.boolean(),
  token: z.string().min(1).max(2048),
})

// Ağacını süsle ekranından gelen görünüm.
export const customizeSchema = z.object({
  style: z.number().int().min(0).max(TREE_STYLES - 1),
  look: lookSchema,
  note: noteSchema,
})

export type CreateTreeInput = z.input<typeof createTreeSchema>
export type HangOrnamentInput = z.input<typeof hangOrnamentSchema>
