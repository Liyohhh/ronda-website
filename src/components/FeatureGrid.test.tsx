import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeatureGrid from './FeatureGrid'
import { FEATURES, OPEN_LANGUAGE_MENU } from '../data/features'
import { renderWithLang } from '../test/render'

// WCAG relative luminance / contrast
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

describe('FeatureGrid', () => {
  it('every icon colour is at least 3:1 against the white tile', () => {
    for (const f of FEATURES) expect(contrast(f.color, '#FFFFFF'), `${f.key} ${f.color}`).toBeGreaterThanOrEqual(3)
  })

  it('10 tiles: 9 whole-card links and the languages button', () => {
    renderWithLang(<FeatureGrid />)
    const grid = screen.getByTestId('feature-tiles')
    expect(within(grid).getAllByRole('link')).toHaveLength(9)
    expect(within(grid).getByRole('link', { name: /Trails/ })).toHaveAttribute('href', '/trails')
    expect(within(grid).getByRole('link', { name: /RONDA 300/ })).toHaveAttribute('href', '/ronda-300')
    expect(within(grid).getByRole('link', { name: /Last-train alerts/ })).toHaveTextContent('Coming soon')
  })

  it('the languages tile asks the language menu to open', () => {
    const heard = vi.fn()
    window.addEventListener(OPEN_LANGUAGE_MENU, heard)
    renderWithLang(<FeatureGrid />)
    fireEvent.click(screen.getByRole('button', { name: /4 languages/ }))
    expect(heard).toHaveBeenCalled()
    window.removeEventListener(OPEN_LANGUAGE_MENU, heard)
  })
})
