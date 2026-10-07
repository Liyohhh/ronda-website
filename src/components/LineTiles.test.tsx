import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LineGrid } from './LineTiles'
import { LINE_GROUPS, LINES, busLine, type Line } from '../data/lines'
import { renderWithLang } from '../test/render'

const BUSES: Line[] = [
  { ...busLine('#127A78', 'Bandar Tasik Selatan ~ MRT Taman Connaught'), id: 'bus-T410', code: 'T410' },
  { ...busLine('#127A78', 'KL Sentral ~ KLCC'), id: 'bus-400', code: '400' },
]

describe('line data for the picker', () => {
  it('every rail line has a short name and sits in exactly one group', () => {
    const grouped = LINE_GROUPS.flatMap((g) => g.ids)
    expect(grouped).toHaveLength(LINES.length)
    expect(new Set(grouped)).toEqual(new Set(LINES.map((l) => l.id)))
    for (const l of LINES) expect(l.short, l.id).toBeTruthy()
  })
})

describe('LineGrid (option A)', () => {
  it('shows all 17 rail lines under translated group headings, plus a bus tile', () => {
    renderWithLang(<LineGrid buses={BUSES} onPick={() => {}} />)
    const grid = screen.getByTestId('line-grid')
    expect(within(grid).getAllByRole('button')).toHaveLength(LINES.length + 1)
    expect(screen.getByRole('heading', { name: 'Rapid KL rail' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Airport (ERL)' })).toBeInTheDocument()
  })

  it('a tile opens its line (full name for screen readers)', () => {
    const onPick = vi.fn()
    renderWithLang(<LineGrid buses={BUSES} onPick={onPick} />)
    fireEvent.click(screen.getByRole('button', { name: 'LRT Kelana Jaya Line' }))
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: 'lrt-kelana-jaya' }))
  })

  it('the bus tile reveals a bus-only search that finds T410', () => {
    const onPick = vi.fn()
    renderWithLang(<LineGrid buses={BUSES} onPick={onPick} />)
    const tile = screen.getByRole('button', { name: /Bus routes/ })
    expect(tile).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(tile)
    expect(tile).toHaveAttribute('aria-expanded', 'true')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 't410' } })
    const hit = screen.getByRole('button', { name: /T410/ })
    fireEvent.click(hit)
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ code: 'T410' }))
    // rail lines are not offered by the bus search
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'kelana' } })
    expect(screen.queryByRole('button', { name: /^Kelana Jaya$/ })).toBeNull()
  })

  it('Arabic: headings translated, line names stay as proper nouns', () => {
    renderWithLang(<LineGrid buses={BUSES} onPick={() => {}} />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'قطارات Rapid KL' })).toBeInTheDocument()
    expect(screen.getByText('Kelana Jaya')).toBeInTheDocument()
  })
})

describe('LineGrid with onBus (Home search dropdown)', () => {
  it('the Bus routes tile hands over to the caller instead of opening its own search', () => {
    const onPick = vi.fn(), onBus = vi.fn()
    renderWithLang(<LineGrid buses={[]} onPick={onPick} onBus={onBus} />)
    fireEvent.click(screen.getByRole('button', { name: /Bus routes/ }))
    expect(onBus).toHaveBeenCalled()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
})
