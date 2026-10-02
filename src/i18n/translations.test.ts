import { describe, expect, it } from 'vitest'
import { LANGUAGES, translations } from './translations'

// Every language must have every key, nothing empty, and the same {placeholders} as English,
// otherwise a screen shows a raw key or "{n}" to riders.
const en = translations.en
const keys = Object.keys(en) as (keyof typeof en)[]
const holes = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe.each(LANGUAGES.map((l) => l.code))('%s translations', (lang) => {
  const tr = translations[lang]

  it('has every English key and no extra keys', () => {
    expect(Object.keys(tr).sort()).toEqual([...keys].sort())
  })

  it('has no empty strings', () => {
    expect(keys.filter((k) => !tr[k]?.trim())).toEqual([])
  })

  it('keeps the same placeholders as English', () => {
    const wrong = keys.filter((k) => holes(tr[k]).join() !== holes(en[k]).join())
    expect(wrong).toEqual([])
  })
})
