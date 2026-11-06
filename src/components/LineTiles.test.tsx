import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LineGrid } from './LineTiles'
import { BUS_LINES_ID, LINE_GROUPS, LINES } from '../data/lines'
import { renderWithLang, tr } from '../test/render'

describe('line data for the picker', () => {
  it('every rail line has a short name and sits in exactly one group', () => {
    const grouped = LINE_GROUPS.flatMap((g) => g.ids)
    expect(grouped).toHaveLength(LINES.length)
    expect(new Set(grouped)).toEqual(new Set(LINES.map((l) => l.id)))
    for (const l of LINES) expect(l.short, l.id).toBeTruthy()
  })
})

describe('LineGrid (option A)', () => {
  it('shows every rail line under translated group headings, plus one Bus tile', () => {
    renderWithLang(<LineGrid onPick={() => {}} />)
    const grid = screen.getByTestId('line-grid')
    expect(within(grid).getAllByRole('button')).toHaveLength(LINES.length + 1)
    expect(screen.getByRole('heading', { name: 'Rapid KL rail' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Airport (ERL)' })).toBeInTheDocument()
  })

  it('a tile opens its line (full name for screen readers)', () => {
    const onPick = vi.fn()
    renderWithLang(<LineGrid onPick={onPick} />)
    fireEvent.click(screen.getByRole('button', { name: 'LRT Kelana Jaya Line' }))
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: 'lrt-kelana-jaya' }))
  })

  it('Arabic: headings translated, line names stay as proper nouns', () => {
    renderWithLang(<LineGrid onPick={() => {}} />, { lang: 'ar' })
    expect(screen.getByRole('heading', { name: 'قطارات Rapid KL' })).toBeInTheDocument()
    expect(screen.getByText('Kelana Jaya')).toBeInTheDocument()
  })
})

describe('Bus tile', () => {
  it.each(['en', 'ms', 'zh', 'ar'] as const)('%s: opens the bus lines list', (lang) => {
    const onPick = vi.fn()
    renderWithLang(<LineGrid onPick={onPick} />, { lang })
    fireEvent.click(screen.getByRole('button', { name: tr(lang, 'busLinesTile') }))
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: BUS_LINES_ID, name: tr(lang, 'busLinesTile') }))
  })
})
