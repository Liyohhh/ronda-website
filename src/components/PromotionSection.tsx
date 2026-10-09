import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import PhotoCredit from './PhotoCredit'
import { PROMO_FEATURE, PROMOTIONS } from '../data/promotions'
import { useLanguage } from '../hooks/useLanguage'

// Home page: promotions (ads), in the same style as Explore Trails: one wide photo banner with a navy fade,
// then a row of white photo cards that scrolls sideways on small screens. Every banner carries one quiet "Ad" tag
// in the same corner; the only bright colour is the banner's button. Data in src/data/promotions.ts.

// the whole card is the link (stretched over it)
const STRETCH = 'after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-4 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#1F2F5C]'

function AdTag({ text }: { text: string }) {
  return (
    <span className="inline-block rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm">
      {text}
    </span>
  )
}

function PromotionSection() {
  const { t } = useLanguage()
  const rowRef = useRef<HTMLUListElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = rowRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pos = Math.abs(el.scrollLeft) // negative in right-to-left pages
    setCanPrev(max > 1 && pos > 1)
    setCanNext(max > 1 && pos < max - 1)
  }, [])

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scroll = (dir: 1 | -1) => {
    const el = rowRef.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * (step + 16), behavior: 'smooth' })
  }

  const f = PROMO_FEATURE
  return (
    // a light grey band behind the section, so the page alternates instead of one flat colour
    <section aria-labelledby="promo-title" className="mt-12 bg-band py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id="promo-title" className="text-2xl md:text-3xl font-bold text-[#1F2F5C]">{t('promoTitle')}</h2>
            <p className="mt-1 text-gray-500">{t('promoSubtitle')}</p>
          </div>
          <Link
            to={f.to}
            className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 h-9 px-4 rounded-full border border-gray-300 bg-white text-sm font-semibold text-[#1F2F5C] hover:bg-gray-50"
          >
            {t('promoAdvertiseLink')}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </Link>
        </div>

        {/* wide banner: photo, navy fade from the text side */}
        <div data-promo={f.id} className="relative overflow-hidden rounded-2xl bg-[#18243F] shadow-sm transition hover:shadow-lg">
          <img src={f.photo.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#18243F] via-[#18243F]/85 to-[#18243F]/10 max-md:bg-[#18243F]/80 max-md:bg-none" />
          <div className="relative p-6 sm:p-8 md:w-3/5">
            <AdTag text={t('promoAdLabel')} />
            <h3 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-white">
              <Link to={f.to} className={STRETCH}>{t(f.title)}</Link>
            </h3>
            <p className="mt-2 text-white/85">{t(f.text)}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {f.tickets.map((k) => (
                <li key={k} className="rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-[#18243F]">{t(k)}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span aria-hidden="true" className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-accent text-sm font-bold text-[#18243F] shadow">
                {t(f.cta)}
                <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
              </span>
              <span className="text-sm text-white/80">{t(f.note)}</span>
            </div>
          </div>
          <p className="absolute bottom-1.5 end-3 text-[10px] text-white/70 [&_a]:relative [&_a]:z-10">
            {t('photoLabel')}: <PhotoCredit photo={f.photo} />
          </p>
        </div>

        {/* smaller cards: photo on top, white body */}
        <div className="relative mt-4">
          <ul ref={rowRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
            {PROMOTIONS.map((p) => (
              <li key={p.id} data-promo={p.id} className="relative flex min-w-[80%] snap-start flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:min-w-[55%] lg:min-w-0">
                <div className="relative h-36 overflow-hidden">
                  <img src={p.photo.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute top-2 start-2"><AdTag text={t('promoAdLabel')} /></span>
                  <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-[9px] text-white/90 [&_a]:relative [&_a]:z-10">
                    {t('photoLabel')}: <PhotoCredit photo={p.photo} />
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold leading-snug text-gray-900">
                    <Link to={p.to} className={STRETCH}>{t(p.title)}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{t(p.text)}</p>
                </div>
              </li>
            ))}
          </ul>
          {canPrev && (
            <button type="button" onClick={() => scroll(-1)} aria-label={t('promoPrev')}
              className="absolute start-1 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white text-[#1F2F5C] shadow-lg ring-1 ring-gray-200 hover:bg-gray-50 lg:hidden">
              <Icon name="chevronLeft" size={20} className="rtl:rotate-180" />
            </button>
          )}
          {canNext && (
            <button type="button" onClick={() => scroll(1)} aria-label={t('promoNext')}
              className="absolute end-1 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white text-[#1F2F5C] shadow-lg ring-1 ring-gray-200 hover:bg-gray-50 lg:hidden">
              <Icon name="chevronRight" size={20} className="rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default PromotionSection
