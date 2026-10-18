import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LineMarquee from './LineMarquee'
import { LINES } from '../data/lines'
import { renderWithLang } from '../test/render'

describe('LineMarquee', () => {
  it('lists every rail line once for screen readers; the loop copy is hidden', () => {
    renderWithLang(<LineMarquee />)
    const region = screen.getByRole('region', { name: 'Lines' })
    const readable = within(region).getAllByRole('listitem').filter((li) => li.closest('.marquee'))
    expect(readable.map((li) => li.lastElementChild?.textContent).sort()).toEqual(LINES.map((l) => l.name).sort())
    const hidden = region.querySelectorAll('ul[aria-hidden="true"] li')
    expect(hidden).toHaveLength(LINES.length)
  })

  it('shows the promise and the network in numbers', () => {
    renderWithLang(<LineMarquee />)
    expect(screen.getByText(/A map shows you where things are/)).toBeInTheDocument()
    expect(screen.getByText('6,500+')).toBeInTheDocument()
  })
})
