import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PromotionSection from './PromotionSection'
import { PROMOTIONS } from '../data/promotions'
import { renderWithLang } from '../test/render'

const cards = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-promo]'))

describe('PromotionSection', () => {
  it('three arched cards, RONDA 300 lit in the middle, each one link with a visible Ad label', () => {
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
    expect(all[1].dataset.promo).toBe('ronda300')
    expect(within(all[1]).getByText('6,500+')).toBeInTheDocument()
  })

  it('one decorative photo per card (the title says what the card is)', () => {
    const { container } = renderWithLang(<PromotionSection />)
    const imgs = Array.from(container.querySelectorAll('[data-promo] img'))
    expect(imgs).toHaveLength(PROMOTIONS.length)
    for (const img of imgs) expect(img).toHaveAttribute('alt', '')
  })

  it('Arabic labels', () => {
    const { container } = renderWithLang(<PromotionSection />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'العروض' })).toBeInTheDocument()
    expect(screen.getAllByText('إعلان')).toHaveLength(cards(container).length)
  })
})
