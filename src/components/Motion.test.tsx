import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Eyebrow, Reveal, WordFill } from './Motion'

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

  it('Eyebrow shows its label next to a decorative icon', () => {
    render(<Eyebrow icon={<svg data-testid="i" />}>Why RONDA?</Eyebrow>)
    expect(screen.getByText('Why RONDA?')).toBeVisible()
    expect(screen.getByTestId('i').parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})
