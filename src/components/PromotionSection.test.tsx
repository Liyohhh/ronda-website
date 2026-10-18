import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PromotionSection from './PromotionSection'
import { PROMO_FEATURE, PROMOTIONS } from '../data/promotions'
import { renderWithLang } from '../test/render'

const banners = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-promo]'))

describe('PromotionSection', () => {
  it('a wide banner plus the smaller cards, each one link (besides the photo credit) with a visible Ad label', () => {
    const { container } = renderWithLang(<PromotionSection />)
    const all = banners(container)
    expect(all).toHaveLength(PROMOTIONS.length + 1)
    for (const b of all) {
      expect(within(b).getByText('Ad')).toBeVisible()
      const links = within(b).getAllByRole('link').filter((a) => !a.closest('p')?.textContent?.startsWith('Photo'))
      expect(links).toHaveLength(1)
    }
    expect(screen.getByRole('link', { name: 'Advertise with RONDA' })).toHaveAttribute('href', '/help/general#business')
    expect(screen.getByRole('link', { name: 'List your business in RONDA 300' })).toHaveAttribute('href', '/ronda-300')
    expect(screen.getByRole('link', { name: 'Offers for riders' })).toHaveAttribute('href', '/help/general#business')
    expect(screen.getByText('Ad places opening soon')).toBeInTheDocument()
  })

  it('photos are decorative (the text says it all) and each one is credited', () => {
    const { container } = renderWithLang(<PromotionSection />)
    const imgs = container.querySelectorAll('[data-promo] img')
    expect(imgs).toHaveLength(PROMOTIONS.length + 1)
    for (const img of imgs) expect(img).toHaveAttribute('alt', '')
    for (const p of [PROMO_FEATURE, ...PROMOTIONS]) expect(screen.getAllByRole('link', { name: p.photo.author }).length).toBeGreaterThan(0)
  })

  it('cards come in order, numbered 01 to 04, all the same shape so they stack cleanly', () => {
    const { container } = renderWithLang(<PromotionSection />)
    const all = banners(container)
    expect(all.map((b) => b.dataset.promo)).toEqual([PROMO_FEATURE.id, ...PROMOTIONS.map((p) => p.id)])
    all.forEach((b, i) => {
      expect(within(b).getByText(String(i + 1).padStart(2, '0'))).toHaveAttribute('aria-hidden', 'true')
      // wide screens: every card sticks at the same place and height, so each one covers the one before
      expect(b).toHaveClass('lg:sticky', 'lg:top-[104px]', 'lg:h-[460px]')
    })
    // only the wide banner shows the three ad places and its button text
    expect(within(all[0]).getAllByRole('listitem')).toHaveLength(PROMO_FEATURE.tickets.length)
    expect(within(all[1]).queryAllByRole('listitem')).toHaveLength(0)
  })

  it('Arabic labels', () => {
    const { container } = renderWithLang(<PromotionSection />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'العروض' })).toBeInTheDocument()
    expect(screen.getAllByText('إعلان')).toHaveLength(banners(container).length)
  })
})
