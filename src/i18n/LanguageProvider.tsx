import { useEffect, useState, type ReactNode } from 'react'
import { LanguageContext } from './context'
import { translations, type Lang, type TranslationKey } from './translations'

const STORAGE_KEY = 'ronda-lang'

function readSavedLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in translations) return saved as Lang
  } catch {
    // storage unavailable, fall back to English
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readSavedLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [lang])

  const t = (key: TranslationKey) => translations[lang][key] ?? translations.en[key]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
