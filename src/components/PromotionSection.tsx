import { Link } from 'react-router-dom'
import PhotoCredit from './PhotoCredit'
import { PROMOTIONS } from '../data/promotions'
import { useLanguage } from '../hooks/useLanguage'

// Home page: promotions (ads). Every card carries a visible "Ad" label; data in src/data/promotions.ts
function PromotionSection() {
  const { t } = useLanguage()
  return (
    <section aria-labelledby="promo-title" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <h2 id="promo-title" className="text-2xl md:text-3xl font-bold text-[#002472]">{t('promoTitle')}</h2>
      <p className="mt-1 text-gray-500">{t('promoSubtitle')}</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROMOTIONS.map((p) => (
          <li key={p.id} className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
              <img src={p.photo.src} alt={p.alt} loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute top-2 start-2 rounded-md bg-white/95 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-900 shadow">
                {t('promoAdLabel')}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold text-gray-900">
                {/* the whole card is the link (stretched), the photo credit stays separately clickable */}
                <Link to={p.to} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-[#002472] focus-visible:after:rounded-2xl">
                  {t(p.title)}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-600">{t(p.text)}</p>
              <p className="relative z-10 mt-auto pt-3 text-[11px] text-gray-500">
                {t('photoLabel')}: <PhotoCredit photo={p.photo} />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PromotionSection
