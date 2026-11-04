import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from '../services/auth'
import { useAuth } from '../hooks/useSession'
import { useLanguage } from '../hooks/useLanguage'
import ServiceNav from './ServiceNav'
import BrandLogo from './BrandLogo'
import LanguageMenu from './LanguageMenu'
import Icon from './Icon'

function Header() {
  const { t } = useLanguage()
  const { session, loading } = useAuth()
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
  const initials = (displayName || user?.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const role = user?.app_metadata?.role as string | undefined // set by the server only
  const hoverClose = useRef<ReturnType<typeof setTimeout> | null>(null)
  // the menu opens on hover where there is a mouse, on a tap everywhere
  const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
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
          {loading ? (
            // session not read yet: keep the space, so Login / Sign Up don't flash for a signed-in person
            <span className="w-24 sm:w-44 h-9" aria-hidden="true" />
          ) : user ? (
            <div
              className="relative ms-1"
              ref={menuRef}
              onMouseEnter={() => { if (hoverClose.current) clearTimeout(hoverClose.current); if (canHover()) setMenuOpen(true) }}
              onMouseLeave={() => { if (canHover()) hoverClose.current = setTimeout(() => setMenuOpen(false), 180) }}
            >
              <button
                onClick={() => setMenuOpen((o) => (canHover() ? true : !o))} // with a mouse it is already open from the hover
                aria-expanded={menuOpen}
                aria-label={displayName || t('accountLink')}
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
                // the account menu: who is signed in (to the account page), the account's parts, the admin or partner
                // page for those roles, help, sign out
                <div className="absolute end-0 top-full z-50 w-[300px] pt-2">
                  <div className="overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white shadow-[0_18px_40px_-16px_rgb(34_45_82/0.35)]">
                    <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 bg-gradient-to-br from-[#EAF1FB] to-white px-4 py-4 hover:from-[#E2EBF7]">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                        : <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#222D52] font-display text-[17px] text-[#8AB4F8]">{initials}</span>}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold text-[#222D52]">{displayName}</span>
                        <span className="block truncate text-xs text-[#5B6576]">{user.email}</span>
                      </span>
                      <Icon name="chevronRight" size={18} className="text-[#5B6576] rtl:rotate-180" />
                    </Link>
                    <nav aria-label={t('accountLink')} className="p-1.5 text-[14px]">
                      {([
                        ['personOutline', 'accountProfile', '/account'],
                        ['tune', 'acctTrips', '/account#trips'],
                        ['language', 'acctPrefs', '/account#preferences'],
                        ['lockOutline', 'accountSecurity', '/account#security'],
                      ] as const).map(([icon, label, to]) => (
                        <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#222D52] hover:bg-[#F2F6FB]">
                          <Icon name={icon} size={19} className="text-[#5B6576]" />{t(label)}
                        </Link>
                      ))}
                      {(role === 'admin' || role === 'merchant') && (
                        <>
                          <div className="mx-3 my-1.5 border-t border-[#E6EBF2]" />
                          <Link to={role === 'admin' ? '/admin' : '/partner-dashboard'} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-[#222D52] hover:bg-[#F2F6FB]">
                            <Icon name="spaceDashboardOutline" size={19} className="text-[#2559B8]" />{t(role === 'admin' ? 'menuAdmin' : 'menuPartner')}
                          </Link>
                        </>
                      )}
                      <div className="mx-3 my-1.5 border-t border-[#E6EBF2]" />
                      <Link to="/help" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#222D52] hover:bg-[#F2F6FB]">
                        <Icon name="helpOutline" size={19} className="text-[#5B6576]" />{t('help')}
                      </Link>
                      <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[#222D52] hover:bg-[#F2F6FB]">
                        <Icon name="logout" size={19} className="text-[#5B6576] rtl:rotate-180" />{t('signOut')}
                      </button>
                    </nav>
                  </div>
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
                className="ms-1 h-9 px-4 sm:px-5 inline-flex items-center rounded-full bg-[#222D52] text-white font-bold whitespace-nowrap shadow-[0_6px_16px_-6px_rgb(34_45_82/0.45)] hover:bg-[#18203D] active:scale-95 transition"
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
