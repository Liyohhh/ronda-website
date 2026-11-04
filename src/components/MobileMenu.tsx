import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES } from '../i18n/translations'
import { NAV_MENUS, type NavMenu } from '../data/serviceOptions'
import BrandLogo from './BrandLogo'
import Icon from './Icon'

// Phones and tablets: one menu button in the header opens a full-screen menu (the way Booking.com, Citymapper,
// Moovit and GOV.UK do it on a phone, owner 5 Nov 2026), instead of a second row of menu names under the header.
// Inside: sign in, the three menus as sections that open in place, help and the language.
function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const { t, lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<NavMenu['key'] | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  // while open: the page behind does not scroll, Escape closes, focus starts on the close button
  useEffect(() => {
    if (!open) return
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = before; document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('menuOpen')}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="xl:hidden h-10 w-10 inline-flex items-center justify-center rounded-full text-[#222D52] hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#222D52]/40"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open && createPortal(
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-white xl:hidden animate-[menu-in_140ms_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-label={t('menuOpen')}
          // a link inside was followed: close
          onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false) }}
        >
          <div className="wrap flex h-14 flex-shrink-0 items-center justify-between border-b border-[#E3E9F1]">
            <Link to="/" aria-label={t('homeAria')}><BrandLogo size="sm" /></Link>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={t('closeAria')} className="h-10 w-10 inline-flex items-center justify-center rounded-full text-[#222D52] hover:bg-gray-100">
              <Icon name="close" size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="wrap py-4">
              {!signedIn && (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="h-11 inline-flex items-center justify-center rounded-full border border-[#D3DCE7] text-sm font-bold text-[#222D52]">{t('login')}</Link>
                  <Link to="/register" className="h-11 inline-flex items-center justify-center rounded-full bg-[#222D52] text-sm font-bold text-white">{t('signUp')}</Link>
                </div>
              )}

              {/* the header's menus, each a section that opens in place */}
              <ul className="mt-2">
                {NAV_MENUS.map((m) => {
                  const isOpen = section === m.key
                  return (
                    <li key={m.key} className="border-b border-[#E6EBF2]">
                      <button
                        type="button"
                        onClick={() => setSection(isOpen ? null : m.key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between py-4 text-start text-[17px] font-semibold text-[#222D52]"
                      >
                        {t(m.key)}
                        <Icon name="expandMore" size={22} className={`text-[#5B6576] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="pb-4">
                          {m.columns.map((col) => (
                            <div key={col.title} className="mt-2 first:mt-0">
                              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2559B8]">{t(col.title)}</p>
                              <ul>
                                {col.items.filter((item) => !item.onlyLang || item.onlyLang === lang).map((item) => (
                                  <li key={item.to}>
                                    <Link to={item.to} className="block rounded-xl px-2 py-2.5 hover:bg-[#F2F6FB]">
                                      <span className="block text-[15px] text-[#222D52]">{item.label ? t(item.label) : item.name}</span>
                                      {(item.detail || item.detailLabel) && (
                                        <span className="block text-xs text-gray-500">{item.detailLabel ? t(item.detailLabel).replace('{n}', '10') : item.detail}</span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
                <li className="border-b border-[#E6EBF2]">
                  <Link to="/help" className="flex items-center justify-between py-4 text-[17px] font-semibold text-[#222D52]">
                    {t('help')}
                    <Icon name="chevronRight" size={22} className="text-[#5B6576] rtl:rotate-180" />
                  </Link>
                </li>
              </ul>

              {/* language: all four shown, one tap */}
              <p className="mt-6 mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2559B8]">{t('language')}</p>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    lang={l.code}
                    onClick={() => setLang(l.code)}
                    aria-pressed={l.code === lang}
                    className={`h-11 rounded-full border text-sm font-semibold ${l.code === lang ? 'border-[#222D52] bg-[#222D52] text-white' : 'border-[#D3DCE7] text-[#222D52]'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export default MobileMenu
