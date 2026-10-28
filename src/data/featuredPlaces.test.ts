import { describe, expect, it } from 'vitest'
import { FEATURED_PLACES, matchFeatured } from './featuredPlaces'

const names = (q: string) => matchFeatured(q).map((p) => p.id)

describe('featured places (UDA buildings near the trains)', () => {
  it('found by name, old name, building name or area', () => {
    expect(names('lalaport')).toEqual(['lalaportBbcc'])
    expect(names('puduraya')).toEqual(['puduSentral'])
    expect(names('kompleks pertama')).toEqual(['pertamaComplex'])
    expect(names('petaling street')).toEqual(['chinatown1974'])
    expect(names('bbcc')).toEqual(['lalaportBbcc'])
  })
  it('forgives one wrong, missing or extra letter, and spaces or dashes', () => {
    expect(names('lalapot')).toEqual(['lalaportBbcc'])
    expect(names('lala port')).toEqual(['lalaportBbcc'])
    expect(names('pertma')).toEqual(['pertamaComplex'])
    expect(names('china town')).toEqual(['chinatown1974'])
  })
  it('nothing for short or unrelated searches', () => {
    expect(names('kl')).toEqual([])
    expect(names('klcc')).toEqual([])
    expect(names('mid valley')).toEqual([])
  })
  it('every place has an OpenStreetMap id and sits in Kuala Lumpur; photos are credited', () => {
    for (const p of FEATURED_PLACES) {
      expect(p.osm).toMatch(/^(node|way|relation)\/\d+$/)
      expect(p.lat).toBeGreaterThan(3.1); expect(p.lat).toBeLessThan(3.2)
      expect(p.lon).toBeGreaterThan(101.66); expect(p.lon).toBeLessThan(101.73)
      if (p.photo) { expect(p.photo.src).toMatch(/^https:\/\/upload\.wikimedia\.org\//); expect(p.photo.author).not.toBe('') }
    }
  })
})
