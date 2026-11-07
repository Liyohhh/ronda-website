import { describe, it, expect } from 'vitest'
import { getPageMeta, TRAIL_KEYS, DEFAULT_META } from './pageMeta'

describe('getPageMeta', () => {
  it('uses the hand-written title for listed pages', () => {
    expect(getPageMeta('/help').title).toBe('Help Centre – Ronda2Go')
  })

  it('ignores a trailing slash', () => {
    expect(getPageMeta('/help/').title).toBe('Help Centre – Ronda2Go')
  })

  it('builds trail titles from the translations', () => {
    expect(getPageMeta('/trails/street-art').title).toBe('Street Art & Mural Trail – Ronda2Go')
  })

  it('finds a name and description for every trail', () => {
    for (const slug of Object.keys(TRAIL_KEYS)) {
      const meta = getPageMeta(`/trails/${slug}`)
      expect(meta.title, slug).not.toBe(DEFAULT_META.title)
    }
  })

  it('falls back to the default for unknown pages', () => {
    expect(getPageMeta('/trails/not-a-trail')).toEqual(DEFAULT_META)
    expect(getPageMeta('/something-else')).toEqual(DEFAULT_META)
  })
})