import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PromoArtwork, { PercentTicket, PinArt, Sparkle, TrainArt } from './PromoArt'
import { PROMO_FEATURE, PROMOTIONS, type PromoTheme } from '../data/promotions'
import { useLanguage } from '../hooks/useLanguage'

// Home page: promotions (ads) as ad-style banners: one wide banner, then a row of smaller ones that scrolls
// sideways on small screens. Every banner carries a visible "Ad" label; data in src/data/promotions.ts.
// Colours (Selat dan senja palette): senja coral (dark text), deep sea teal, daun green, merah bata; text passes 4.5:1 on every stop.
const THEME: Record<PromoTheme | 'senja', string> = {
  senja: 'from-[#F3C45A] to-[#E3A21A]',
  blue: 'from-[#5E1F15] to-[#A14532]',
  gold: 'from-[#76291C] to-[#8E3424]',
  teal: 'from-[#2F5A1E] to-[#47722C]',
  coral: 'from-[#7A2A22] to-[#A23B2C]',
}

// the whole banner is the link (stretched over it)
const STRETCH = 'after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-4 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#FFC72C]'

function AdLabel({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-md bg-white/95 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-900 shadow">
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
    // a sea-foam band behind the section, so the page alternates light and warm instead of one flat colour
    <section aria-labelledby="promo-title" className="mt-12 bg-cream py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <h2 id="promo-title" className="text-2xl md:text-3xl font-bold text-[#8E3424]">{t('promoTitle')}</h2>
      <p className="mt-1 text-gray-500">{t('promoSubtitle')}</p>

      {/* wide banner */}
      <div data-promo={f.id} className={`relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br ${THEME.senja} p-5 sm:p-7 shadow-sm transition hover:shadow-lg`}>
        <Sparkle className="pointer-events-none absolute top-4 end-[42%] h-5 w-5 text-white/80" />
        <Sparkle className="pointer-events-none absolute bottom-6 start-[38%] h-3 w-3 text-white/70" />
        <PercentTicket className="pointer-events-none absolute -top-1 end-6 h-9 w-12 rotate-12 opacity-90" />
        <TrainArt className="pointer-events-none absolute -bottom-3 end-2 hidden h-24 w-36 md:block" />
        <div className="relative grid items-center gap-5 md:grid-cols-[1fr_1.5fr]">
          <div>
            <AdLabel text={t('promoAdLabel')} />
            <h3 className="mt-3 text-3xl sm:text-4xl font-black leading-tight text-[#5E1F15]">
              <Link to={f.to} className={STRETCH}>{t(f.title)}</Link>
            </h3>
            <p className="mt-3 inline-block -skew-x-6 bg-[#E3242B] px-3 py-1 text-sm font-bold text-white shadow">
              <span className="inline-block skew-x-6">{t(f.ribbon)}</span>
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-[#5E1F15]">
              <PinArt className="h-4 w-3 shrink-0" />
              {t(f.foot)}
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:pe-10">
            {f.tickets.map((k) => (
              <li key={k} className="overflow-hidden rounded-xl bg-white text-center shadow-md">
                <div className="h-2.5 bg-accent" />
                <p className="px-2 py-3 sm:py-5 text-xs sm:text-base font-extrabold leading-snug text-[#5E1F15]">{t(k)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* smaller banners */}
      <div className="relative mt-4">
        <ul ref={rowRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {PROMOTIONS.map((p) => (
            <li key={p.id} data-promo={p.id} className={`relative flex min-w-[85%] snap-start overflow-hidden rounded-2xl bg-gradient-to-br ${THEME[p.theme]} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:min-w-[60%] lg:min-w-0`}>
              <div className="flex w-3/5 flex-col">
                <div><AdLabel text={t('promoAdLabel')} /></div>
                <h3 className="mt-2 text-lg font-extrabold leading-snug text-white">
                  <Link to={p.to} className={STRETCH}>{t(p.title)}</Link>
                </h3>
                {p.big && <p className="text-4xl font-black leading-none text-[#FFC72C] [text-shadow:0_2px_0_rgba(0,0,0,.25)]"><span dir="ltr">{p.big}</span></p>}
                <p className="mt-2 text-sm text-white/95">{t(p.text)}</p>
              </div>
              <div className="pointer-events-none ms-auto flex w-2/5 items-center">
                <PromoArtwork art={p.art} />
              </div>
            </li>
          ))}
        </ul>
        {canPrev && (
          <button type="button" onClick={() => scroll(-1)} aria-label={t('promoPrev')}
            className="absolute start-1 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white text-[#8E3424] shadow-lg ring-1 ring-gray-200 hover:bg-gray-50 lg:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 rtl:rotate-180"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
        {canNext && (
          <button type="button" onClick={() => scroll(1)} aria-label={t('promoNext')}
            className="absolute end-1 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white text-[#8E3424] shadow-lg ring-1 ring-gray-200 hover:bg-gray-50 lg:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 rtl:rotate-180"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>
      </div>
    </section>
  )
}

export default PromotionSection
