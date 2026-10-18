import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EcrlCard from './EcrlCard'
import { ECRL_STATIONS } from '../data/ecrl'
import { renderWithLang } from '../test/render'

describe('EcrlCard', () => {
  it('shows all 20 stations north to south, both phases and that fares are not announced', () => {
    renderWithLang(<EcrlCard />)
    const card = screen.getByRole('region', { name: /ECRL/ })
    const items = within(card).getAllByRole('listitem').filter((li) => li.closest('ol'))
    expect(items).toHaveLength(20)
    expect(items[0]).toHaveTextContent('Kota Bharu')
    expect(items[19]).toHaveTextContent('Jalan Kastam')
    expect(ECRL_STATIONS.filter((s) => s.phase === 2).map((s) => s.name)).toEqual(['Serendah Baru', 'Puncak Alam', 'Kapar', 'Jalan Kastam'])
    expect(within(card).getByText(/not announced yet/)).toBeInTheDocument()
    // no prices until MRL or the ministry publishes them
    expect(card.textContent).not.toMatch(/RM\s?\d/)
  })

  it('names the interchanges and links every source', () => {
    renderWithLang(<EcrlCard />)
    expect(screen.getByText(/Change to LRT Kelana Jaya Line/)).toBeInTheDocument()
    expect(screen.getByText(/Change to KTM Port Klang Line/)).toBeInTheDocument()
    for (const a of screen.getAllByRole('link')) expect(a.getAttribute('href')).toMatch(/^https:\/\//)
  })
})
