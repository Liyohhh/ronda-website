import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import type { IconName } from '../data/icons'
import Icon from './Icon'
import PhotoCredit from './PhotoCredit'
import { SLIDE_PHOTOS } from '../data/trailPhotos'
import { SLIDES, type Slide } from '../data/slides'
import { Reveal } from './Motion'

// "Travel made effortless" slides in the Blaze "guides" layout: on the left a row of chips (one per slide, they switch
// slides) above a grey card with the slide's words; on the right the big heading, the slide's photo (cross-fading) and
// its one-line tag as a quote. A gentle auto-advance pauses on hover / focus and is off for people who prefer reduced
// motion; arrow keys move too. Photos: Wikimedia Commons, credited on the photo and on the About page.

export const AUTO_MS = 5000

const k = (n: number, part: string) => `s${n}_${part}` as TranslationKey
const CHIP_ICON: Record<Slide['key'], IconName> = { plan: 'route', ronda300: 'myLocation', fares: 'payments', saved: 'bookmark', airport: 'flight' }

function FeatureCarousel({ onPlan, onLines }: { onPlan: () => void; onLines: () => void }) {
  const { t, lang } = useLanguage()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const n = SLIDES.length
  const go = (i: number) => setIndex((i + n) % n)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (paused || reduce) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % n), AUTO_MS)
    return () => window.clearTimeout(id)
  }, [index, paused, n])

  const rtl = lang === 'ar'
  const cta = (s: Slide, active: boolean) => {
    const cls = 'inline-flex items-center gap-1.5 rounded-full bg-[#14213D] px-7 py-3.5 text-[15px] font-bold text-white shadow-md hover:bg-[#0B1528] active:scale-95 transition'
    const label = (
      <>
        {t(k(s.n, 'cta'))}
        <Icon name="chevronRight" size={18} className="rtl:rotate-180" />
      </>
    )
    const tab = active ? 0 : -1
    if (typeof s.action === 'object') return <Link to={s.action.to} className={cls} tabIndex={tab}>{label}</Link>
    return (
      <button type="button" onClick={s.action === 'plan' ? onPlan : onLines} className={cls} tabIndex={tab}>
        {label}
      </button>
    )
  }
  const cur = SLIDES[index]

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-labelledby="slides-title"
      className="wrap relative z-10 pt-24 md:pt-32 grid gap-10 lg:gap-16 lg:grid-cols-[1.1fr_1fr] items-start"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !rootRef.current?.contains(e.relatedTarget as Node) && setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + (rtl ? -1 : 1))
        if (e.key === 'ArrowLeft') go(index + (rtl ? 1 : -1))
      }}
    >
      {/* right column first on phones: the heading leads */}
      <div className="lg:order-2">
        <Reveal>
          <h2 id="slides-title" className="text-[40px] md:text-[56px] leading-[1.08] font-bold tracking-[-0.05em] text-[#14213D]">
            {t('slidesTitle')}
          </h2>
        </Reveal>
        <div className="mt-8 grid sm:grid-cols-[1.15fr_1fr] gap-6 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-gray-100 shadow-[0_24px_48px_-20px_rgb(20_33_61/0.35)]">
            {SLIDES.map((s, i) => {
              const photo = SLIDE_PHOTOS[s.key]
              return (
                <figure key={s.key} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${i === index ? 'opacity-100' : 'opacity-0'}`} aria-hidden={i !== index} inert={i !== index}>
                  <img src={photo.src} alt={photo.alt} loading={i === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
                  <figcaption className="absolute bottom-2 end-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
                    <PhotoCredit photo={photo} />
                  </figcaption>
                </figure>
              )
            })}
          </div>
          <div aria-hidden="true">
            <span className="inline-block rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <p className="mt-5 text-xl font-semibold italic leading-snug text-[#14213D]">“{t(k(cur.n, 'tag'))}”</p>
            <div className="mt-5 h-px w-12 bg-gray-300" />
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-[#14213D]">— RONDA</p>
          </div>
        </div>
      </div>

      <div className="lg:order-1 min-w-0">
        {/* one chip per slide: they switch slides */}
        <div className="flex flex-wrap gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => go(i)}
              aria-label={t('goToSlide').replace('{n}', String(i + 1))}
              aria-current={i === index}
              className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium transition-colors ${
                i === index ? 'bg-[#14213D] text-white shadow-[0_4px_12px_rgb(20_33_61/0.18)]' : 'bg-gray-100 text-[#14213D] hover:bg-gray-200'
              }`}
            >
              <Icon name={CHIP_ICON[s.key]} size={15} />
              {t(k(s.n, 'title'))}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-[32px] border border-gray-200 bg-gray-50">
          <div
            className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${(rtl ? 1 : -1) * index * 100}%)` }}
          >
            {SLIDES.map((s, i) => {
              const active = i === index
              return (
                <div
                  key={s.key}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} / ${n}`}
                  aria-hidden={!active}
                  inert={!active}
                  className="w-full flex-shrink-0 p-6 sm:p-10"
                >
                  <h3 className="text-2xl md:text-[30px] font-bold tracking-[-0.02em] leading-tight text-[#14213D]">{t(k(s.n, 'title'))}</h3>
                  <p className="mt-4 text-gray-600 leading-relaxed">{t(k(s.n, 'body'))}</p>
                  <ul className="mt-6 space-y-3 text-[15px]">
                    {[1, 2, 3].map((p) => (
                      <li key={p} className="flex items-start gap-3 text-gray-800">
                        <span className="mt-0.5 w-6 h-6 rounded-full bg-[#14213D] text-white flex items-center justify-center flex-shrink-0">
                          <Icon name="check" size={16} />
                        </span>
                        {t(k(s.n, `p${p}`))}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">{cta(s, active)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureCarousel
