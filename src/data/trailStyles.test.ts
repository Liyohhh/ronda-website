import { describe, expect, it } from 'vitest'
import { CATEGORY_STYLE } from './trailStyles'
import { ARABIC_ONLY_CATEGORIES, TRAIL_CATEGORIES, categoriesFor, categoryKey } from './trails'
import { LANGUAGES, translations } from '../i18n/translations'

describe('trail categories', () => {
  it('every category has a cover style and a name in all 4 languages', () => {
    for (const c of [...TRAIL_CATEGORIES, ...ARABIC_ONLY_CATEGORIES]) {
      expect(CATEGORY_STYLE[c], c).toBeTruthy()
      for (const { code } of LANGUAGES) expect(translations[code][categoryKey(c)], `${c} ${code}`).toBeTruthy()
    }
  })

  it('Fun & Activities is shown in every language', () => {
    for (const { code } of LANGUAGES) expect(categoriesFor(code)).toContain('activities')
    expect(translations.en.trailCat_activities).toBe('Fun & Activities')
  })
})
