import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HeroVideos from './HeroVideos'
import { HERO_SLIDE_MS, HERO_VIDEOS } from '../data/heroVideos'
import { renderWithLang } from '../test/render'

const current = () => screen.getAllByRole('button').findIndex((b) => b.getAttribute('aria-current') === 'true')

describe('HeroVideos', () => {
  beforeEach(() => { vi.useFakeTimers(); HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve()) })
  afterEach(() => vi.useRealTimers())

  it('one station per video; the next video comes after a while and wraps round', () => {
    renderWithLang(<HeroVideos />)
    expect(screen.getAllByRole('button')).toHaveLength(HERO_VIDEOS.length)
    expect(current()).toBe(0)
    act(() => { vi.advanceTimersByTime(HERO_SLIDE_MS) })
    expect(current()).toBe(1)
    for (let i = 1; i < HERO_VIDEOS.length; i++) act(() => { vi.advanceTimersByTime(HERO_SLIDE_MS) })
    expect(current()).toBe(0)
  })

  it('picking a station shows that video, with no credit on it (credits are on the About page); only the showing and next videos are loaded', () => {
    const { container } = renderWithLang(<HeroVideos />)
    fireEvent.click(screen.getByRole('button', { name: /Go to slide 3/ }))
    expect(current()).toBe(2)
    expect(screen.queryByRole('link', { name: /Pexels/ })).toBeNull()
    expect(container.querySelectorAll('video')).toHaveLength(2)
  })
})
