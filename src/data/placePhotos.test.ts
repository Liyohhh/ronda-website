import { describe, expect, it } from 'vitest'
import { PLACE_PHOTOS } from './placePhotos'

describe('trail stop photos', () => {
  it('each photo has its credit and secure links (CC BY / BY-SA need the credit)', () => {
    for (const [id, ph] of Object.entries(PLACE_PHOTOS)) {
      if (ph.owner) continue // the owner's own photos: credits kept in docs/RONDA_Photo_Credits.xlsx
      expect(ph.author, id).toBeTruthy()
      expect(ph.license, id).toMatch(/^(CC0|Public domain|CC BY(-SA)? [\d.]+)$/)
      expect(ph.src, id).toMatch(/^https:\/\/(upload\.wikimedia\.org|live\.staticflickr\.com)\//)
      expect(ph.page, id).toMatch(/^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|www\.flickr\.com\/photos\/)/)
      if (ph.licenseUrl) expect(ph.licenseUrl, id).toMatch(/^https:\/\//)
    }
  })

  it("the owner's own photos are files on our site, flagged so they stay out of the credit list", () => {
    const own = Object.entries(PLACE_PHOTOS).filter(([, ph]) => ph.owner)
    expect(own.length).toBeGreaterThan(0)
    for (const [id, ph] of own) expect(ph.src, id).toBe(`/places/${id}.jpg`)
  })
})
