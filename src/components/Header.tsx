import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useSession } from '../hooks/useSession'
import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES, type Lang } from '../i18n/translations'
import ServiceNav from './ServiceNav'
import BrandLogo from './BrandLogo'

function Header() {
  const { lang, setLang, t } = useLanguage()
  const session = useSession()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const user = session?.user
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    ''
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="relative z-30 bg-white border-b border-gray-200">
      {/* One row: logo + services on the left, language / help / account on the right.
          The row is the positioning box for the services dropdown, so it spans the full width. */}
      <div className="relative flex items-center h-16 px-4 sm:px-6 gap-3 lg:gap-6">
        <Link to="/" className="flex items-center flex-shrink-0" aria-label="RONDA home">
          <BrandLogo size="sm" wordmarkClassName="hidden sm:block" />
        </Link>

        <ServiceNav className="hidden lg:flex self-stretch" />

        <div className="ms-auto flex items-center gap-0.5 sm:gap-1 text-sm font-medium text-[#002472]">
          {/* Language selector */}
          <label className={`${PILL} relative cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-[#002472]/40`}>
            <GlobeIcon />
            <span className="hidden sm:inline">{LANGUAGES.find((l) => l.code === lang)?.label}</span>
            <ChevronIcon />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              aria-label="Language"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          {/* Help */}
          <Link to="/help" className={PILL} aria-label={t('help')}>
            <HelpIcon />
            <span className="hidden sm:inline">{t('help')}</span>
          </Link>

          {/* Account access / profile */}
          {user ? (
            <div className="relative ms-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                className={PILL}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-[#002472] text-white flex items-center justify-center">
                    <UserIcon size={16} />
                  </span>
                )}
                <span className="hidden sm:inline max-w-[140px] truncate">{displayName}</span>
                <ChevronIcon />
              </button>
              {menuOpen && (
                <div className="absolute end-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 hover:bg-gray-50"
                  >
                    {t('myDashboard')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-start px-4 py-2.5 hover:bg-gray-50"
                  >
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={PILL} aria-label={t('login')}>
                <UserIcon />
                <span className="hidden sm:inline">{t('login')}</span>
              </Link>
              <Link
                to="/register"
                className="ms-1 h-9 px-3 sm:px-4 inline-flex items-center rounded-full bg-[#002472] text-white font-semibold whitespace-nowrap hover:bg-[#001a55] transition-colors"
              >
                {t('signUp')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Small screens: services get their own scrollable row */}
      <ServiceNav className="flex lg:hidden overflow-x-auto [scrollbar-width:none] border-t border-gray-100 px-4 sm:px-6" />
    </header>
  )
}

// Shared look for the right-side controls: same height, padding, hover and icon gap
const PILL =
  'h-9 px-3 inline-flex items-center gap-1.5 rounded-full hover:bg-[#002472]/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#002472]/40'

// 20px outline icons, 1.75 stroke, so the set looks even
const ICON = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

function GlobeIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.3 2.5 3.5 5.5 3.5 9s-1.2 6.5-3.5 9c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3z" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.2-2.4 3.7" />
      <path d="M12 17.2h.01" strokeWidth={2.4} />
    </svg>
  )
}

function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <svg {...ICON} width={size} height={size}>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.75 20a7.25 7.25 0 0 1 14.5 0" />
    </svg>
  )
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg {...ICON} width={14} height={14} strokeWidth={2} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default Header
