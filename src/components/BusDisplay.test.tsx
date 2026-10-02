import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BusStopName from './BusStopName'
import RouteChip from './RouteChip'

describe('RouteChip', () => {
  it('shows the route code on the teal chip', () => {
    render(<RouteChip code="T352" />)
    const chip = screen.getByText('T352')
    expect(chip).toHaveStyle({ backgroundColor: '#127A78' })
    expect(chip).toHaveClass('text-white')
  })

  it('bus icon is optional and decorative', () => {
    const { container, rerender } = render(<RouteChip code="T410" />)
    expect(container.querySelector('svg')).toBeNull()
    rerender(<RouteChip code="T410" icon />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // the code is the accessible text; the icon is hidden from screen readers and has no <title>
    expect(svg?.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(svg?.querySelector('title')).toBeNull()
  })
})

describe('BusStopName', () => {
  it('reads like the pole: code, then name', () => {
    const { container } = render(<BusStopName code="KL1483" name="Pasar Seni" />)
    expect(container).toHaveTextContent(/^KL1483\s*Pasar Seni$/)
  })

  it('no code (rail, or none given): just the name', () => {
    const { container } = render(<BusStopName code={null} name="KLCC" />)
    expect(container).toHaveTextContent(/^KLCC$/)
  })

  it('logo only when asked', () => {
    const { container, rerender } = render(<BusStopName code="KL1483" name="Pasar Seni" />)
    expect(container.querySelector('svg')).toBeNull()
    rerender(<BusStopName code="KL1483" name="Pasar Seni" logo />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
