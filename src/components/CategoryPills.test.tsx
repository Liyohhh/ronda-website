import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CategoryPills from './CategoryPills'
import { categoriesFor, isCategoryShown } from '../data/trails'
import { NAV_MENUS } from '../data/serviceOptions'
import { renderWithLang } from '../test/render'

describe('Arabic-only trail category', () => {
  it('halal-fine-dining is listed only for Arabic', () => {
    expect(categoriesFor('en')).not.toContain('halal-fine-dining')
    expect(categoriesFor('ms')).not.toContain('halal-fine-dining')
    expect(categoriesFor('zh')).not.toContain('halal-fine-dining')
    expect(categoriesFor('ar')).toContain('halal-fine-dining')
    expect(isCategoryShown('food', 'en')).toBe(true)
  })

  it('pills: hidden in English, shown and selectable in Arabic', () => {
    const { unmount } = renderWithLang(<CategoryPills value="all" onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Halal fine dining' })).toBeNull()
    unmount()
    const onChange = vi.fn()
    renderWithLang(<CategoryPills value="all" onChange={onChange} />, { lang: 'ar' })
    fireEvent.click(screen.getByRole('button', { name: 'مطاعم حلال راقية' }))
    expect(onChange).toHaveBeenCalledWith('halal-fine-dining')
  })

  it('Explore menu marks the item as Arabic-only', () => {
    const items = NAV_MENUS.find((m) => m.key === 'navExplore')!.columns[0].items
    expect(items.find((i) => i.to.endsWith('halal-fine-dining'))?.onlyLang).toBe('ar')
  })
})
