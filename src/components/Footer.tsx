import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import AppDownloadBanner from './AppDownloadBanner'
import BrandLogo from './BrandLogo'

// Footer like the Ainaa site's: the navy app band first, then a white footer with the logo and tagline, link
// columns under gold labels, and a thin bar with the copyright, sources and "Back to top".
function Footer() {
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
        { to: '/advertise', label: t('promoAdvertiseLink') },
      ],
    },
  ]

  return (
    <footer className="bg-white text-[#222D52] overflow-x-clip">
      <AppDownloadBanner />
      {/* phone: the logo across, then the link groups two to a row so the footer stays short */}
      <div className="wrap pt-12 md:pt-20 pb-10 md:pb-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <BrandLogo size="md" />
          <p className="mt-4 md:mt-5 max-w-xs text-[15px] leading-relaxed text-gray-600">{t('footerTagline')}</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-[#2559B8] mb-3 md:mb-5">{c.title}</h2>
            <ul className="space-y-1 md:space-y-2 text-[15px] text-gray-700">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="inline-block py-1.5 hover:text-[#222D52] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="wrap"><div className="border-t border-gray-200">
        <div className="py-6 flex flex-col md:flex-row gap-3 md:items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-3">
            © {year} Ronda2Go. {t('footerRights')}
          </span>
          <span>
            <Link to="/credits" className="underline hover:text-[#222D52]">{t('footerCredits')}</Link>
            {' · '}
            {t('footerMapData')}{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-[#222D52]">
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
            className="self-start md:self-auto hover:text-[#222D52]"
          >
            {t('backToTop')} ↑
          </button>
        </div>
      </div></div>
    </footer>
  )
}

export default Footer
