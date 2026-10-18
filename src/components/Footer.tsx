import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import AppDownloadBanner from './AppDownloadBanner'
import BrandLogo from './BrandLogo'
import { LINES } from '../data/lines'

// every official line colour once, for the thin rail stripe across the top of the footer
const STRIPE = [...new Set(LINES.map((l) => l.color))]

// Blaze-style footer: the app call to action on the left, link columns on the right, a thin bar with the copyright,
// sources and "Back to top", then the tagline.
// flush: the page above already ends in the dark band (Home), so no white gap before the footer.
function Footer({ flush = false }: { flush?: boolean }) {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  const columns = [
    {
      title: t('footerTravel'),
      links: [
        { to: '/', label: t('directions') },
        { to: '/?tab=lines', label: t('lines') },
        { to: '/trails', label: t('trails') },
      ],
    },
    {
      title: t('footerAccount'),
      links: [
        { to: '/login', label: t('login') },
        { to: '/register', label: t('signUp') },
      ],
    },
    {
      title: t('footerSupport'),
      links: [
        { to: '/about', label: t('about') },
        { to: '/help', label: t('helpCentre') },
        { to: '/help/policies', label: t('policies') },
      ],
    },
  ]

  return (
    <footer className={`bg-black text-white overflow-hidden selection:bg-gold selection:text-[#14213D] ${flush ? '' : 'mt-24'}`}>
      {!flush && (
        <div className="flex h-1.5" aria-hidden="true">
          {STRIPE.map((c) => <span key={c} className="flex-1" style={{ backgroundColor: c }} />)}
        </div>
      )}
      <div className="wrap pt-16 md:pt-20 pb-14 grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <AppDownloadBanner />
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-white/60 mb-5">{c.title}</h2>
            <ul className="space-y-3.5 text-base text-white">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white/70 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-y border-white/10">
        <div className="wrap py-5 flex flex-col md:flex-row gap-3 md:items-center justify-between text-xs text-white/70">
          <span className="flex items-center gap-3">
            <BrandLogo tone="light" size="sm" wordmark={false} />
            © {year} RONDA. {t('footerRights')}
          </span>
          <span>
            <Link to="/credits" className="underline hover:text-white">{t('footerCredits')}</Link>
            {' · '}
            {t('footerMapData')}{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">
              © OpenStreetMap contributors
            </a>
          </span>
          {/* back to the top; keyboard focus goes to the first link in the header, so it starts from the top too */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              document.querySelector<HTMLElement>('header a')?.focus({ preventScroll: true })
            }}
            className="self-start md:self-auto hover:text-gold"
          >
            {t('backToTop')} ↑
          </button>
        </div>
      </div>

      <div className="wrap py-6">
        <p className="text-center text-sm text-white/70">{t('footerTagline')}</p>
      </div>
    </footer>
  )
}

export default Footer
