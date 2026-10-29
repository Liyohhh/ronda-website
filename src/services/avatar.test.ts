import { describe, expect, it } from 'vitest'
import { avatarPath, centreSquare } from './avatar'

describe('profile pictures', () => {
  it('one file per user, in their own folder', () => {
    expect(avatarPath('u-1')).toBe('u-1/avatar.webp')
  })
  it('cuts the centred square out of wide and tall photos', () => {
    expect(centreSquare(4000, 3000)).toEqual({ sx: 500, sy: 0, side: 3000 })
    expect(centreSquare(1080, 1920)).toEqual({ sx: 0, sy: 420, side: 1080 })
    expect(centreSquare(500, 500)).toEqual({ sx: 0, sy: 0, side: 500 })
  })
})
