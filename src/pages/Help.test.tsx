import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import Help from './Help'
import HelpCategory from './HelpCategory'
import { HELP_ARTICLES, HELP_CATEGORIES, articleA, articleQ } from '../data/helpCategories'
import { translations } from '../i18n/translations'
import { renderWithLang } from '../test/render'

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}
const app = (
  <Routes>
    <Route path="/help" element={<><Help /><Where /></>} />
    <Route path="/help/:category" element={<><HelpCategory /><Where /></>} />
  </Routes>
)

describe('Help Centre', () => {
  beforeAll(() => { Element.prototype.scrollIntoView = vi.fn() }) // not in jsdom

  it('three categories, no Returns & Refunds', () => {
    expect(HELP_CATEGORIES.map((c) => c.slug)).toEqual(['payments', 'general', 'policies'])
    renderWithLang(app, { route: '/help' })
    expect(screen.queryByText(/Refund/i)).toBeNull()
  })

  it('/help/returns-refunds goes back to /help', () => {
    renderWithLang(app, { route: '/help/returns-refunds' })
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/help$/)
  })

  it('every article has a question and answer in all 4 languages', () => {
    for (const lang of ['en', 'ms', 'zh', 'ar'] as const)
      for (const a of HELP_ARTICLES) {
        expect(translations[lang][articleQ(a.id)], `${lang} ${a.id} q`).toBeTruthy()
        expect(translations[lang][articleA(a.id)], `${lang} ${a.id} a`).toBeTruthy()
      }
  })

  it('search finds articles with a typo and says when nothing matches', () => {
    renderWithLang(app, { route: '/help' })
    const box = screen.getByRole('searchbox')
    fireEvent.change(box, { target: { value: 'acount' } })
    expect(screen.getByRole('link', { name: 'Do I need an account?' })).toHaveAttribute('href', '/help/general#genAccount')
    fireEvent.change(box, { target: { value: 'zzqqxx' } })
    expect(screen.getByText(/No articles match/)).toBeInTheDocument()
  })

  it('the search button moves focus to the results', () => {
    renderWithLang(app, { route: '/help' })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'fare' } })
    fireEvent.click(screen.getByRole('button', { name: 'Results' }))
    expect(screen.getByRole('heading', { name: 'Results' })).toHaveFocus()
  })

  it('policies are marked as a draft for legal review', () => {
    renderWithLang(app, { route: '/help/policies' })
    expect(screen.getAllByText('Draft for legal review').length).toBeGreaterThan(0)
  })
})
