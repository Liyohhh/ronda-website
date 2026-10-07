import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PromotionSection from './PromotionSection'
import { PROMOTIONS } from '../data/promotions'
import { renderWithLang } from '../test/render'

const banners = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-promo]'))

describe('PromotionSection', () => {
  it('a wide banner plus the smaller banners, each a link with a visible Ad label', () => {
    const { container } = renderWithLang(<PromotionSection />)
    const all = banners(container)
    expect(all).toHaveLength(PROMOTIONS.length + 1)
    for (const b of all) {
      expect(within(b).getByText('Ad')).toBeVisible()
      expect(within(b).getAllByRole('link')).toHaveLength(1)
    }
    expect(screen.getByRole('link', { name: 'Advertise with RONDA' })).toHaveAttribute('href', '/help/general#business')
    expect(screen.getByRole('link', { name: 'List your business in RONDA 300' })).toHaveAttribute('href', '/ronda-300')
    expect(screen.getByRole('link', { name: 'Explore Trails' })).toHaveAttribute('href', '/trails')
    expect(screen.getByText('Ad places opening soon')).toBeInTheDocument()
  })

  it('pictures are drawings, not photos, and hidden from screen readers', () => {
    const { container } = renderWithLang(<PromotionSection />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
    for (const svg of container.querySelectorAll('[data-promo] svg')) expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('Arabic labels', () => {
    const { container } = renderWithLang(<PromotionSection />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'العروض' })).toBeInTheDocument()
    expect(screen.getAllByText('إعلان')).toHaveLength(banners(container).length)
  })
})
