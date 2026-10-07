import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useSession } from '../hooks/useSession'
import { useLanguage } from '../hooks/useLanguage'
import ServiceNav from './ServiceNav'
import BrandLogo from './BrandLogo'
import LanguageMenu from './LanguageMenu'
import Icon from './Icon'

function Header() {
  const { t } = useLanguage()
  const session = useSession()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  // sticky header: add a shadow once the page has scrolled under it
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
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
    <header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-gray-200 transition-shadow ${
        scrolled ? 'shadow-[0_4px_20px_-8px_rgb(0_36_114/0.25)]' : ''
      }`}
    >
      {/* One row: logo + services on the left, language / help / account on the right.
          The row is the positioning box for the services dropdown, so it spans the full width. */}
      <div className="relative flex items-center h-16 px-4 sm:px-6 gap-3 lg:gap-6">
        <Link to="/" className="flex items-center flex-shrink-0" aria-label={t('homeAria')}>
          <BrandLogo size="sm" wordmarkClassName="hidden sm:block" />
        </Link>

        <ServiceNav className="hidden lg:flex self-stretch" />

        <div className="ms-auto flex items-center gap-0.5 sm:gap-1 text-sm font-medium text-[#1C2B4A]">
          <LanguageMenu compact />

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
                aria-label={displayName || t('myDashboard')}
                className={PILL}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-[#1C2B4A] text-white flex items-center justify-center">
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
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 hover:bg-gray-50"
                  >
                    {t('accountLink')}
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
                className="ms-1 h-9 px-3 sm:px-4 inline-flex items-center rounded-full bg-[#1C2B4A] text-white font-semibold whitespace-nowrap hover:bg-[#14203A] transition-colors"
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
  'h-9 px-3 inline-flex items-center gap-1.5 rounded-full hover:bg-[#1C2B4A]/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1C2B4A]/40'

function HelpIcon() {
  return (
    <Icon name="helpOutline" />
  )
}

function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon name="personOutline" size={size} />
  )
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <Icon name="expandMore" size={14} className={className} />
  )
}

export default Header
