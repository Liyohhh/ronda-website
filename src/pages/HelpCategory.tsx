import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { HelpLayout, CategoryIcon } from '../components/HelpLayout'
import { HELP_ARTICLES, articleA, articleQ, findCategory } from '../data/helpCategories'

// links shown under an answer (pages the answer mentions)
const MORE: Record<string, { to: string; label: 'footerCredits' | 'liveMapTitle' | 'navRonda300' }> = {
  genData: { to: '/credits', label: 'footerCredits' },
  genLive: { to: '/live', label: 'liveMapTitle' },
  business: { to: '/ronda-300', label: 'navRonda300' },
}

// Business and service enquiries: an @ronda.com address, set at build time once it exists (VITE_CONTACT_EMAIL)
const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? ''
const CONTACT_ARTICLES = ['business', 'services']

function HelpCategory() {
  const { t } = useLanguage()
  const { category } = useParams()
  const { hash } = useLocation()
  const cat = findCategory(category)

  // /help/general#business: open that article and bring it into view
  useEffect(() => {
    const el = hash ? document.getElementById(hash.slice(1)) : null
    if (el instanceof HTMLDetailsElement) {
      el.open = true
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash, category])

  // unknown categories (and the removed /help/returns-refunds) go back to the Help home
  if (!cat) return <Navigate to="/help" replace />
  const articles = HELP_ARTICLES.filter((a) => a.category === cat.slug)

  return (
    <HelpLayout>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/help" className="text-sm text-[#8E3424] hover:underline">
          ← {t('backToHelp')}
        </Link>

        <div className="flex items-center gap-4 mt-6 mb-8">
          <CategoryIcon icon={cat.icon} />
          <h1 className="text-2xl font-semibold text-gray-900">{t(cat.labelKey)}</h1>
        </div>

        <div className="border-t border-gray-200">
          {articles.map((a) => (
            <details key={a.id} id={a.id} className="group border-b border-gray-200 scroll-mt-24">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-2 py-5 text-gray-900 hover:text-[#8E3424]">
                <span className="font-medium">{t(articleQ(a.id))}</span>
                <span aria-hidden="true" className="text-xl text-gray-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-2 pb-6 text-gray-700 leading-relaxed">
                {a.draft && (
                  <p className="mb-2 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                    {t('helpDraftLegal')}
                  </p>
                )}
                <p>{t(articleA(a.id))}</p>
                {CONTACT_EMAIL && CONTACT_ARTICLES.includes(a.id) && (
                  <p className="mt-3 text-sm">
                    {t('helpEmailUs')}{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#8E3424] underline" dir="ltr">{CONTACT_EMAIL}</a>
                  </p>
                )}
                {MORE[a.id] && (
                  <Link to={MORE[a.id].to} className="mt-3 inline-block text-sm font-semibold text-[#8E3424] underline">
                    {t(MORE[a.id].label)}
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </main>
    </HelpLayout>
  )
}

export default HelpCategory
