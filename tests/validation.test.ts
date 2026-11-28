import { describe, expect, it } from 'vitest'
import { newOwnerKey, newTreeId, OWNER_KEY_PATTERN, TREE_ID_PATTERN } from '@/lib/ids'
import { createTreeSchema, hangOrnamentSchema, MAX_BODY, TREE_STYLES } from '@/lib/validation'

const base = { treeId: 'abcdefgh23', authorName: 'Ayşe', kind: 3, body: 'Mutlu yıllar', isPublic: false, token: 't' }

describe('createTreeSchema', () => {
  it('adı tek satıra indirir ve kırpar', () => {
    const r = createTreeSchema.parse({ name: '  Miraç\u2019ın\n  ağacı ', style: 1, lang: 'tr' })
    expect(r.name).toBe('Miraç\u2019ın ağacı')
  })

  it('boş ya da yalnız boşluk olan adı reddeder', () => {
    expect(createTreeSchema.safeParse({ name: '   ', style: 0, lang: 'tr' }).success).toBe(false)
    expect(createTreeSchema.safeParse({ name: '\u200B\u200B', style: 0, lang: 'tr' }).success).toBe(false)
  })

  it('40 karakteri geçen adı, olmayan stili ve dili reddeder', () => {
    expect(createTreeSchema.safeParse({ name: 'a'.repeat(41), style: 0, lang: 'tr' }).success).toBe(false)
    expect(createTreeSchema.safeParse({ name: 'a'.repeat(40), style: 0, lang: 'tr' }).success).toBe(true)
    expect(createTreeSchema.safeParse({ name: 'x', style: TREE_STYLES - 1, lang: 'tr' }).success).toBe(true)
    expect(createTreeSchema.safeParse({ name: 'x', style: TREE_STYLES, lang: 'tr' }).success).toBe(false)
    expect(createTreeSchema.safeParse({ name: 'x', style: 5, lang: 'tr' }).success).toBe(true)
    expect(createTreeSchema.safeParse({ name: 'x', style: 1.5, lang: 'tr' }).success).toBe(false)
    expect(createTreeSchema.safeParse({ name: 'x', style: 0, lang: 'de' }).success).toBe(false)
  })
})

describe('hangOrnamentSchema', () => {
  it('boş adı anonim yapar', () => {
    expect(hangOrnamentSchema.parse({ ...base, authorName: '   ' }).authorName).toBeNull()
  })

  it('boş mesajı reddeder', () => {
    expect(hangOrnamentSchema.safeParse({ ...base, body: ' \n\n ' }).success).toBe(false)
  })

  it('500 karakter sınırını emojiler dahil karakter olarak sayar', () => {
    expect(hangOrnamentSchema.safeParse({ ...base, body: '🎄'.repeat(MAX_BODY) }).success).toBe(true)
    expect(hangOrnamentSchema.safeParse({ ...base, body: 'a'.repeat(MAX_BODY + 1) }).success).toBe(false)
  })

  it('görünmez ve yön değiştiren karakterleri atar, fazla boş satırı sıkıştırır', () => {
    const r = hangOrnamentSchema.parse({ ...base, body: 'a\u202E\u0000b\r\n\r\n\r\n\r\nc  ' })
    expect(r.body).toBe('ab\n\nc')
  })

  it('15 satırı geçen mesajı reddeder', () => {
    expect(hangOrnamentSchema.safeParse({ ...base, body: Array(16).fill('x').join('\n') }).success).toBe(false)
  })

  it('geçersiz ağaç kimliğini ve süs türünü reddeder', () => {
    expect(hangOrnamentSchema.safeParse({ ...base, treeId: "abc'; drop" }).success).toBe(false)
    expect(hangOrnamentSchema.safeParse({ ...base, treeId: 'ABCDEFGH23' }).success).toBe(false)
    expect(hangOrnamentSchema.safeParse({ ...base, kind: 20 }).success).toBe(false)
    expect(hangOrnamentSchema.safeParse({ ...base, kind: -1 }).success).toBe(false)
  })

  it('jetonsuz isteği reddeder', () => {
    expect(hangOrnamentSchema.safeParse({ ...base, token: '' }).success).toBe(false)
  })
})

describe('kimlikler', () => {
  it('ağaç kimliği ve sahip anahtarı beklenen biçimde üretilir', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 500; i++) {
      const id = newTreeId()
      expect(id).toMatch(TREE_ID_PATTERN)
      ids.add(id)
    }
    expect(ids.size).toBe(500)
    expect(newOwnerKey()).toMatch(OWNER_KEY_PATTERN)
  })
})
