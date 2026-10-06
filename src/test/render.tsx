import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageContext } from '../i18n/context'
import { translations, type Lang, type TranslationKey } from '../i18n/translations'

// Render with a fixed language (and a router, for components with links). setLang is a no-op unless given.
export function renderWithLang(ui: ReactElement, { lang = 'en', route = '/', setLang = () => {} }: { lang?: Lang; route?: string; setLang?: (l: Lang) => void } = {}) {
  const t = (key: TranslationKey) => translations[lang][key] ?? translations.en[key]
  return render(
    <MemoryRouter initialEntries={[route]}>
      <LanguageContext.Provider value={{ lang, setLang, t }}>{ui}</LanguageContext.Provider>
    </MemoryRouter>,
  )
}

export const tr = (lang: Lang, key: TranslationKey) => translations[lang][key]
