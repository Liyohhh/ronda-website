import { describe, expect, it } from 'vitest'
import { fold, matchScore } from './smartMatch'

describe('typo-tolerant search', () => {
  it('ignores case, accents, dashes and spaces', () => {
    expect(fold('Café  Lala-Port')).toBe('cafe lala port')
    expect(matchScore('lalaport', ['LaLaport Bukit Bintang'])).toBeGreaterThan(0)
    expect(matchScore('lala port', ['LaLaport'])).toBeGreaterThan(0)
  })
  it('finds a word start, a part of a word, or one letter off', () => {
    expect(matchScore('hawk', ['Food Hawker Trail'])).toBeGreaterThan(0)
    expect(matchScore('awker', ['Food Hawker Trail'])).toBeGreaterThan(0)
    expect(matchScore('hawkr', ['Food Hawker Trail'])).toBeGreaterThan(0)
  })
  it('every word must match; a name that starts with the search ranks first', () => {
    expect(matchScore('hawker klcc', ['Food Hawker Trail'])).toBe(0)
    expect(matchScore('food', ['Food Hawker Trail'])).toBeGreaterThan(matchScore('food', ['Street food on Jalan Alor']))
  })
  it('nothing for an empty search', () => expect(matchScore('  ', ['anything'])).toBe(0))
})
