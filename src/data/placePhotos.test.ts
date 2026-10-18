import { describe, expect, it } from 'vitest'
import { PLACE_PHOTOS } from './placePhotos'

describe('trail stop photos', () => {
  it('each photo has its credit and secure links (CC BY / BY-SA need the credit)', () => {
    for (const [id, ph] of Object.entries(PLACE_PHOTOS)) {
      expect(ph.author, id).toBeTruthy()
      expect(ph.license, id).toMatch(/^(CC0|Public domain|CC BY(-SA)? [\d.]+)$/)
      expect(ph.src, id).toMatch(/^https:\/\/upload\.wikimedia\.org\//)
      expect(ph.page, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
      if (ph.licenseUrl) expect(ph.licenseUrl, id).toMatch(/^https:\/\//)
    }
  })
})
