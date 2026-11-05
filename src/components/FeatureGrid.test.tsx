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
  it('every feature colour is at least 4.5:1 against its white icon square, and no two features share one', () => {
    for (const f of FEATURES) expect(contrast(f.color, '#FFFFFF'), `${f.key} ${f.color}`).toBeGreaterThanOrEqual(4.5)
    expect(new Set(FEATURES.map((f) => f.color)).size).toBe(FEATURES.length)
  })

  it('10 tiles: 8 whole-card links, the languages button, and Saved trips as plain "Coming soon" (not built yet)', () => {
    renderWithLang(<FeatureGrid />)
    const grid = screen.getByTestId('feature-tiles')
    expect(within(grid).getAllByRole('link')).toHaveLength(8)
    expect(within(grid).queryByRole('link', { name: /Saved trips/ })).toBeNull()
    expect(within(grid).getByText('Saved trips').closest('li')).toHaveTextContent('Coming soon')
    expect(within(grid).getByRole('link', { name: /^Trails\./ })).toHaveAttribute('href', '/trails')
    expect(within(grid).getByRole('link', { name: /^RONDA 300\./ })).toHaveAttribute('href', '/ronda-300')
    expect(within(grid).getByRole('link', { name: /Last-train alerts/ })).toHaveTextContent('Coming soon')
  })

  it('the card pointed at or tabbed to is the lit one; leaving the row lights RONDA 300 again', () => {
    renderWithLang(<FeatureGrid />)
    const card = (name: RegExp) => screen.getByRole('link', { name }).closest('li')!
    const lit = (name: RegExp) => card(name).firstElementChild!.className.includes('bg-[#2F6BD8]')
    expect(lit(/^RONDA 300\./)).toBe(true)
    fireEvent.mouseEnter(card(/^Trails\./))
    expect(lit(/^Trails\./)).toBe(true)
    expect(lit(/^RONDA 300\./)).toBe(false)
    fireEvent.mouseLeave(card(/^Trails\./).parentElement!)
    expect(lit(/^RONDA 300\./)).toBe(true)
    fireEvent.focus(screen.getByRole('link', { name: /^Lines\./ }))
    expect(lit(/^Lines\./)).toBe(true)
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
