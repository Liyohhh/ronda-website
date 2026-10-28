import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PromotionSection from './PromotionSection'
import { PROMO_FEATURE, PROMOTIONS } from '../data/promotions'
import { renderWithLang } from '../test/render'

const banners = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-promo]'))

describe('PromotionSection', () => {
  it('a wide banner plus the smaller cards, each one link with a visible Ad label', () => {
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

  it("the banner photo and the small cards' drawn maps are decorative, with no credit on them (credits are on the About page)", () => {
    const { container } = renderWithLang(<PromotionSection />)
    const imgs = container.querySelectorAll('[data-promo] img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0]).toHaveAttribute('alt', '')
    expect(container.querySelectorAll('[data-promo] svg[aria-hidden="true"]').length).toBeGreaterThanOrEqual(PROMOTIONS.length)
    expect(screen.queryByRole('link', { name: PROMO_FEATURE.photo.author })).toBeNull()
  })

  it('the wide banner comes first, then the three small cards; only the banner shows the ad places', () => {
    const { container } = renderWithLang(<PromotionSection />)
    const all = banners(container)
    expect(all.map((b) => b.dataset.promo)).toEqual([PROMO_FEATURE.id, ...PROMOTIONS.map((p) => p.id)])
    expect(all[0]).toHaveClass('sm:col-span-3')
    expect(within(all[0]).getAllByRole('listitem')).toHaveLength(PROMO_FEATURE.tickets.length)
    expect(within(all[1]).queryAllByRole('listitem')).toHaveLength(0)
  })

  it('Arabic labels', () => {
    const { container } = renderWithLang(<PromotionSection />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'العروض' })).toBeInTheDocument()
    expect(screen.getAllByText('إعلان')).toHaveLength(banners(container).length)
  })
})
