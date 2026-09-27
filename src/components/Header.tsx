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
    <header className="relative z-30 bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <Link to="/" className="flex items-center" aria-label="RONDA home">
          <BrandLogo size="sm" />
        </Link>

        <div className="flex items-center gap-5 text-sm text-[#002472]">
          {/* Language selector */}
          <label className="relative flex items-center gap-1.5">
            <GlobeIcon />
            <span className="sr-only">Language</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="appearance-none bg-transparent pe-5 py-1 font-medium cursor-pointer outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute end-0 top-1/2 -translate-y-1/2 w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
            </svg>
          </label>

          {/* Help */}
          <Link to="/help" className="flex items-center gap-1.5 font-medium hover:opacity-70">
            <HelpIcon />
            {t('help')}
          </Link>

          {/* Account access / profile */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 font-medium hover:opacity-80"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-[#002472] text-white flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </span>
                )}
                <span className="max-w-[140px] truncate">{displayName}</span>
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
            <div className="flex items-center gap-2 font-semibold">
              <UserIcon className="w-5 h-5" />
              <Link to="/register" className="hover:opacity-70">
                {t('signUp')}
              </Link>
              <span className="w-px h-4 bg-[#002472]/30" />
              <Link to="/login" className="hover:opacity-70">
                {t('login')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Service options (hover dropdowns) */}
      <ServiceNav />
    </header>
  )
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.3-2.4 3.8" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  )
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

export default Header
