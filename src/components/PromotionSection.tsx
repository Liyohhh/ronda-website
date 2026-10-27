import { Link } from 'react-router-dom'
import Icon from './Icon'
import { Accent, Eyebrow, Reveal } from './Motion'
import { PROMO_FEATURE, PROMOTIONS } from '../data/promotions'
import { useLanguage } from '../hooks/useLanguage'

// Home page: promotions (ads), compact: one wide banner (photo beside the words, the three ad places and the button),
// then three small cards in a row (photo on top). Every banner carries one quiet "Ad" tag in the same corner.
// Data in src/data/promotions.ts.

// the whole card is the link (stretched over it: the card is the nearest positioned box)
const STRETCH = 'after:absolute after:inset-0 after:z-[1] after:rounded-[28px] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-4 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#222D52]'

function AdTag({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm">
      {text}
    </span>
  )
}

function PromotionSection() {
  const { t } = useLanguage()
  const f = PROMO_FEATURE

  const photo = (p: typeof f | (typeof PROMOTIONS)[number], className: string) => (
    <div className={`relative overflow-hidden rounded-[20px] bg-[#222D52] ${className}`}>
      <img src={p.photo.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      <span className="absolute top-3 start-3"><AdTag text={t('promoAdLabel')} /></span>
    </div>
  )

  return (
    <section aria-labelledby="promo-title" className="mt-24 md:mt-32 bg-cream py-20 md:py-28">
      <div className="wrap">
        <Reveal className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h2 id="promo-title"><Eyebrow>{t('promoTitle')}</Eyebrow></h2>
            <p className="mt-5 max-w-3xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]"><Accent text={t('promoSubtitle')} /></p>
          </div>
          <Link
            to={f.to}
            className="inline-flex self-start sm:self-auto flex-shrink-0 items-center gap-1.5 h-11 px-5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-[#222D52] hover:bg-[#222D52] hover:text-white hover:border-[#222D52] transition-colors whitespace-nowrap"
          >
            {t('promoAdvertiseLink')}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </Link>
        </Reveal>

        <ul className="grid gap-3 sm:grid-cols-3">
          {/* the wide banner: photo beside the words */}
          <li data-promo={f.id} className="group relative sm:col-span-3 grid md:grid-cols-[1fr_1.15fr] gap-2 p-2 rounded-[28px] bg-white ring-1 ring-inset ring-[#DCD4C8]">
            {photo(f, 'min-h-[200px] md:min-h-[260px]')}
            <div className="flex flex-col justify-center gap-5 p-4 md:p-6">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold tracking-[-0.01em] text-[#222D52]">
                  <Link to={f.to} className={STRETCH}>{t(f.title)}</Link>
                </h3>
                <p className="mt-2 text-gray-600">{t(f.text)}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {f.tickets.map((k) => (
                    <li key={k} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-[#222D52]">{t(k)}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span aria-hidden="true" className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-gold text-sm font-bold text-[#222D52] group-hover:bg-gold-hover transition-colors">
                  {t(f.cta)}
                  <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                </span>
                <span className="text-sm text-gray-600">{t(f.note)}</span>
              </div>
            </div>
          </li>

          {/* the smaller cards: photo on top, words below */}
          {PROMOTIONS.map((p) => (
            <li key={p.id} data-promo={p.id} className="group relative flex flex-col gap-2 p-2 rounded-[28px] bg-white ring-1 ring-inset ring-[#DCD4C8]">
              {photo(p, 'h-40')}
              <div className="flex flex-1 items-start justify-between gap-3 p-3">
                <div>
                  <h3 className="font-semibold leading-snug text-[#222D52]">
                    <Link to={p.to} className={STRETCH}>{t(p.title)}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{t(p.text)}</p>
                </div>
                <span aria-hidden="true" className="mt-0.5 w-8 h-8 flex-shrink-0 rounded-full bg-[#222D52] text-white flex items-center justify-center transition-colors group-hover:bg-gold group-hover:text-[#222D52]">
                  <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default PromotionSection
