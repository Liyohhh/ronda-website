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
      className={`sticky top-0 z-40 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 transition-shadow ${
        scrolled ? 'shadow-[0_8px_30px_-12px_rgb(34_45_82/0.18)]' : ''
      }`}
    >
      {/* One row: logo + services on the left, language / help / account on the right.
          The row is the positioning box for the services dropdown, so it spans the full width. */}
      <div className="wrap relative flex items-center h-16 xl:h-[72px] gap-3 lg:gap-6">
        <Link to="/" className="flex items-center flex-shrink-0" aria-label={t('homeAria')}>
          <BrandLogo size="sm" wordmarkClassName="hidden sm:block" />
        </Link>

        {/* menus sit in the middle of the row, like the centre line of the Blaze header */}
        <ServiceNav className="hidden xl:flex absolute inset-0 items-center justify-center pointer-events-none [&>*]:pointer-events-auto" />

        <div className="ms-auto flex items-center gap-1 sm:gap-2 text-[13px] font-medium text-[#222D52]">
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
                  <span className="w-7 h-7 rounded-full bg-[#222D52] text-white flex items-center justify-center">
                    <UserIcon size={16} />
                  </span>
                )}
                <span className="hidden sm:inline max-w-[140px] truncate">{displayName}</span>
                <ChevronIcon />
              </button>
              {menuOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden p-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl hover:bg-gray-100"
                  >
                    {t('myDashboard')}
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl hover:bg-gray-100"
                  >
                    {t('accountLink')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-gray-100"
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
                className="ms-1 h-9 px-4 sm:px-5 inline-flex items-center rounded-full bg-gold text-[#222D52] font-bold whitespace-nowrap shadow-[0_4px_12px_rgb(210_182_138/0.35)] hover:bg-gold-hover active:scale-95 transition"
              >
                {t('signUp')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Small screens: services get their own scrollable row */}
      <ServiceNav className="wrap flex xl:hidden overflow-x-auto [scrollbar-width:none]" />
    </header>
  )
}

// Shared look for the right-side controls: same height, padding, hover and icon gap
const PILL =
  'h-9 px-3 inline-flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-[#222D52] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#222D52]/40'

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
