import { describe, expect, it } from 'vitest'
import { formatDuration } from './duration'
import { translations, type TranslationKey } from './translations'

const t = (key: TranslationKey) => translations.en[key]

describe('formatDuration', () => {
  it.each([
    [0, '0 min'],
    [45, '45 min'],
    [60, '1 hr'],
    [90, '1 hr 30 min'],
    [125.4, '2 hr 5 min'],
    [-5, '0 min'],
  ])('%s min -> %s', (min, want) => {
    expect(formatDuration(min, t)).toBe(want)
  })

  it('uses the current language', () => {
    const ms = (key: TranslationKey) => translations.ms[key]
    expect(formatDuration(90, ms)).not.toBe(formatDuration(90, t))
    expect(formatDuration(90, ms)).toMatch(/1.*30/)
  })
})
