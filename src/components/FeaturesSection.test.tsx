import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeaturesSection from './FeaturesSection'
import { FEATURES, OPEN_LANGUAGE_MENU } from '../data/features'
import { renderWithLang } from '../test/render'

describe('FeaturesSection', () => {
  it('one heading, no photo card (RONDA 300 has its own section above)', () => {
    const { container } = renderWithLang(<FeaturesSection />)
    expect(screen.getByRole('heading', { name: 'Everything you need for the journey' })).toBeInTheDocument()
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('feature cards: each a whole-card link with a one-line description, except the languages button', () => {
    renderWithLang(<FeaturesSection />)
    const grid = screen.getByTestId('feature-tiles')
    expect(within(grid).getAllByRole('listitem')).toHaveLength(FEATURES.length)
    expect(within(grid).getAllByRole('link')).toHaveLength(FEATURES.length - 1)
    expect(within(grid).getByRole('link', { name: /RONDA 300/ })).toHaveAttribute('href', '/ronda-300')
    expect(within(grid).getByRole('link', { name: /RONDA 300/ })).toHaveTextContent('Cafés, food and sights within 300 m of every station.')
    expect(within(grid).getByRole('link', { name: /Last-train alerts/ })).toHaveTextContent('Coming soon')
  })

  it('the languages card asks the language menu to open', () => {
    const heard = vi.fn()
    window.addEventListener(OPEN_LANGUAGE_MENU, heard)
    renderWithLang(<FeaturesSection />)
    fireEvent.click(screen.getByRole('button', { name: /4 languages/ }))
    expect(heard).toHaveBeenCalled()
    window.removeEventListener(OPEN_LANGUAGE_MENU, heard)
  })
})
