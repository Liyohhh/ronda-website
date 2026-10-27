import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Accent, Eyebrow, Reveal, WordFill } from './Motion'

// jsdom has no IntersectionObserver, like an old browser: everything must show in its finished state
describe('Motion', () => {
  it('Reveal renders its content as the chosen element, with no hidden starting state on the page', () => {
    render(<ul><Reveal as="li" delay={0.2}>Stat</Reveal></ul>)
    const li = screen.getByText('Stat')
    expect(li.tagName).toBe('LI')
    expect(li).toHaveClass('reveal')
    expect(li.style.getPropertyValue('--reveal-delay')).toBe('0.2s')
    expect(document.documentElement).not.toHaveClass('js-reveal')
  })

  it('WordFill keeps the whole text and shows every word filled', () => {
    render(<h2><WordFill text="Look closer: Malaysia is easier" /></h2>)
    const h = screen.getByRole('heading')
    expect(h).toHaveTextContent('Look closer: Malaysia is easier')
    const fill = h.querySelector<HTMLElement>('.word-fill')!
    const words = Array.from(fill.querySelectorAll<HTMLElement>(':scope > span'))
    expect(words.length).toBe(5)
    // fully filled; each word knows its place in the heading
    expect(fill.style.getPropertyValue('--p')).toBe('1')
    expect(fill.style.getPropertyValue('--n')).toBe('5')
    expect(words.map((w) => w.style.getPropertyValue('--i'))).toEqual(['0', '1', '2', '3', '4'])
  })

  it('WordFill splits Chinese text, which has no spaces', () => {
    render(<h2><WordFill text="马来西亚比你想的更容易出行" /></h2>)
    expect(screen.getByRole('heading')).toHaveTextContent('马来西亚比你想的更容易出行')
  })

  it('Eyebrow shows its label after a decorative dot', () => {
    render(<Eyebrow>Why RONDA?</Eyebrow>)
    const label = screen.getByText('Why RONDA?')
    expect(label).toBeVisible()
    expect(label.querySelector('span')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Accent with a number at the end', () => {
  it('keeps the number with the word before it ("Terminal 1")', () => {
    const { container } = render(<p><Accent text="From KLIA Terminal 1" /></p>)
    expect(container.querySelector('.accent-word')?.textContent).toBe('Terminal 1')
  })
})
