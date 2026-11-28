import { z } from 'zod'

// Ağacın görünümü. Her alan bir seçeneğin sırası; seçeneklerin adları i18n.ts'te.
export const LOOK_OPTIONS = {
  topper: 6,
  lights: 6,
  ribbon: 4,
  base: 4,
  scene: 3,
  sky: 3,
  snow: 3,
  music: 3,
} as const

export type LookKey = keyof typeof LOOK_OPTIONS
export type Look = Record<LookKey, number>

export const DEFAULT_LOOK: Look = { topper: 0, lights: 0, ribbon: 0, base: 0, scene: 0, sky: 0, snow: 0, music: 0 }

export const LOOK_KEYS = Object.keys(LOOK_OPTIONS) as LookKey[]

export const lookSchema = z
  .object(
    Object.fromEntries(
      LOOK_KEYS.map((k) => [k, z.number().int().min(0).max(LOOK_OPTIONS[k] - 1)]),
    ) as Record<LookKey, z.ZodNumber>,
  )
  .strict()

// Veritabanından gelen değer eski ya da eksik olabilir; geçersiz alan varsayılana döner.
export function normalizeLook(value: unknown): Look {
  const out: Look = { ...DEFAULT_LOOK }
  if (!value || typeof value !== 'object') return out
  for (const k of LOOK_KEYS) {
    const v = (value as Record<string, unknown>)[k]
    if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < LOOK_OPTIONS[k]) out[k] = v
  }
  return out
}

// Büyüyen ağaç: süs sayısına göre eklenen süslemeler.
export const GROWTH_STEPS = [10, 25, 50] as const

export function growthLevel(total: number): number {
  return GROWTH_STEPS.filter((n) => total >= n).length
}

export function nextGrowth(total: number): { at: number; left: number; level: number } | null {
  const i = GROWTH_STEPS.findIndex((n) => total < n)
  if (i === -1) return null
  return { at: GROWTH_STEPS[i], left: GROWTH_STEPS[i] - total, level: i + 1 }
}
