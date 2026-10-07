import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import BrandLogo from './BrandLogo'

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
      ],
    },
  ]

  return (
    <footer className="bg-[#08333A] text-white">
      {/* the app banner sits right above; a thin line separates the two */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-white/10 grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <BrandLogo tone="light" size="md" />
          <p className="mt-4 text-sm text-white/70 max-w-xs">{t('footerTagline')}</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold mb-3">{c.title}</h2>
            <ul className="space-y-2 text-sm text-white/70">
              {c.links.map((l) => (
                <li key={l.to}>
                  {/* in-page anchor (the app banner is on every page) vs. route */}
                  {l.to.startsWith('#') ? (
                    <a href={l.to} className="hover:text-white">
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.to} className="hover:text-white">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/60">
          <span>© {year} RONDA. {t('footerRights')}</span>
          <span>
            <Link to="/credits" className="underline hover:text-white">{t('footerCredits')}</Link>
            {' · '}
            {t('footerMapData')}{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">
              © OpenStreetMap contributors
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
