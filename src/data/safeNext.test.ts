import { describe, expect, it } from 'vitest'
import { safeNext } from './safeNext'

describe('safeNext (no open redirect after login)', () => {
  it.each(['/admin', '/partner-dashboard?tab=2', '/trails/batu-caves#top'])('keeps the site path %s', (p) => expect(safeNext(p)).toBe(p))
  it.each([
    null, undefined, '', 'admin', 'https://evil.example', '//evil.example', '/\\evil.example',
    'javascript:alert(1)', '/\tadmin', '/\nhttps://evil.example',
  ])('falls back to home for %j', (p) => expect(safeNext(p)).toBe('/'))
})
