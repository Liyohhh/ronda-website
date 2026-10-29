import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PromotionSection from './PromotionSection'
import { PROMOTIONS } from '../data/promotions'
import { renderWithLang } from '../test/render'

const cards = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-promo]'))

describe('PromotionSection', () => {
  it('a wide card then two smaller ones, each one link with a visible Ad label', () => {
    const { container } = renderWithLang(<PromotionSection />)
    const all = cards(container)
    expect(all.map((b) => b.dataset.promo)).toEqual(PROMOTIONS.map((p) => p.id))
    for (const b of all) {
      expect(within(b).getByText('Ad')).toBeVisible()
      expect(within(b).getAllByRole('link')).toHaveLength(1)
    }
    expect(screen.getByRole('link', { name: 'Put your shop near the station' })).toHaveAttribute('href', '/ronda-300')
    expect(screen.getByRole('link', { name: 'Riders on their way to you' })).toHaveAttribute('href', '/help/general#business')
    expect(screen.getByRole('link', { name: 'Give riders a reason to stop' })).toHaveAttribute('href', '/help/general#business')
    expect(within(all[0]).getByText('6,500+')).toBeInTheDocument()
  })

  it('the drawings are decorative; no photos', () => {
    const { container } = renderWithLang(<PromotionSection />)
    expect(container.querySelectorAll('[data-promo] img')).toHaveLength(0)
    expect(container.querySelectorAll('[data-promo] svg[aria-hidden="true"]').length).toBeGreaterThanOrEqual(PROMOTIONS.length)
  })

  it('Arabic labels', () => {
    const { container } = renderWithLang(<PromotionSection />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'العروض' })).toBeInTheDocument()
    expect(screen.getAllByText('إعلان')).toHaveLength(cards(container).length)
  })
})
