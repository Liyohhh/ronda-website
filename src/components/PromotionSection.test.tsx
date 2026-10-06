import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PromotionSection from './PromotionSection'
import { PROMOTIONS } from '../data/promotions'
import { renderWithLang } from '../test/render'

describe('PromotionSection', () => {
  it('three cards, each a link with a visible Ad label and a photo credit', () => {
    renderWithLang(<PromotionSection />)
    const cards = screen.getAllByRole('listitem')
    expect(cards).toHaveLength(PROMOTIONS.length)
    for (const card of cards) {
      expect(within(card).getByText('Ad')).toBeVisible()
      expect(within(card).getAllByRole('link').length).toBeGreaterThanOrEqual(2) // the card + the credit
    }
    expect(screen.getByRole('link', { name: 'Advertise with RONDA' })).toHaveAttribute('href', '/help/general#business')
    expect(screen.getByRole('link', { name: 'List your business in RONDA 300' })).toHaveAttribute('href', '/ronda-300')
  })

  it('Arabic labels', () => {
    renderWithLang(<PromotionSection />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'العروض' })).toBeInTheDocument()
    expect(screen.getAllByText('إعلان')).toHaveLength(3)
  })
})
