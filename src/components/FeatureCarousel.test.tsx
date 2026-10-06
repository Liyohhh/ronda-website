import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeatureCarousel, { AUTO_MS } from './FeatureCarousel'
import { SLIDES } from '../data/slides'
import { SLIDE_PHOTOS } from '../data/trailPhotos'
import { renderWithLang } from '../test/render'

const current = () => screen.getAllByRole('group', { hidden: true }).findIndex((g) => g.getAttribute('aria-hidden') === 'false')

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
}

describe('FeatureCarousel', () => {
  beforeEach(() => { vi.useFakeTimers(); mockReducedMotion(false) })
  afterEach(() => vi.useRealTimers())

  it('has 5 slides, each with a credited photo', () => {
    expect(AUTO_MS).toBe(5000)
    expect(SLIDES).toHaveLength(5)
    for (const s of SLIDES) expect(SLIDE_PHOTOS[s.key].author).toBeTruthy()
    renderWithLang(<FeatureCarousel onPlan={() => {}} onLines={() => {}} />)
    expect(screen.getAllByRole('group', { hidden: true })).toHaveLength(5)
    expect(screen.getByAltText(/Petronas Twin Towers/)).toBeInTheDocument()
  })

  it('moves on every 5 seconds and wraps round after slide 5', () => {
    renderWithLang(<FeatureCarousel onPlan={() => {}} onLines={() => {}} />)
    expect(current()).toBe(0)
    act(() => { vi.advanceTimersByTime(4999) })
    expect(current()).toBe(0)
    act(() => { vi.advanceTimersByTime(1) })
    expect(current()).toBe(1)
    for (let i = 0; i < 4; i++) act(() => { vi.advanceTimersByTime(AUTO_MS) })
    expect(current()).toBe(0)
  })

  it('pauses while hovered', () => {
    renderWithLang(<FeatureCarousel onPlan={() => {}} onLines={() => {}} />)
    fireEvent.mouseEnter(screen.getByRole('region', { hidden: true }))
    act(() => { vi.advanceTimersByTime(AUTO_MS * 3) })
    expect(current()).toBe(0)
  })

  it('does not move for people who prefer reduced motion', () => {
    mockReducedMotion(true)
    renderWithLang(<FeatureCarousel onPlan={() => {}} onLines={() => {}} />)
    act(() => { vi.advanceTimersByTime(AUTO_MS * 3) })
    expect(current()).toBe(0)
  })

  it('slide 5 links to a trip to KLIA Terminal 1', () => {
    renderWithLang(<FeatureCarousel onPlan={() => {}} onLines={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 5' }))
    expect(current()).toBe(4)
    expect(screen.getByRole('link', { name: /Plan a trip to KLIA T1/ })).toHaveAttribute('href', '/?to=ERL%20KLIA%20T1&toName=KLIA%20Terminal%201')
  })
})
