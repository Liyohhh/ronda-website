import { describe, it, expect } from 'vitest'
import { canonicalUrl } from './seo'

describe('canonicalUrl', () => {
  it('always points at https://ronda2go.com without a trailing slash', () => {
    expect(canonicalUrl('/')).toBe('https://ronda2go.com/')
    expect(canonicalUrl('')).toBe('https://ronda2go.com/')
    expect(canonicalUrl('/trails')).toBe('https://ronda2go.com/trails')
    expect(canonicalUrl('/trails/heritage/')).toBe('https://ronda2go.com/trails/heritage')
  })
})
