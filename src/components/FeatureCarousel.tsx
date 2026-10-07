import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import Icon from './Icon'
import PhotoCredit from './PhotoCredit'
import { SLIDE_PHOTOS } from '../data/trailPhotos'
import { SLIDES, type Slide } from '../data/slides'

// "Travel made effortless" slides: a white card on the light page whose lower part sits over the top of
// the navy band below (Home puts the band right after it). Photo on one side, the message on the other.
// Arrows, dots, keyboard, and a gentle auto-advance that pauses on hover / focus and is off for people who
// prefer reduced motion. Photos: Wikimedia Commons, credited on the slide and on the About page.

export const AUTO_MS = 5000
const GOLD_TEXT = '#8E5320' // RONDA gold, dark enough for small text (4.5:1 on white and light tints)

const k = (n: number, part: string) => `s${n}_${part}` as TranslationKey

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
  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      onClick={() => go(index + dir)}
      aria-label={dir === 1 ? t('scrollNext') : t('scrollPrev')}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg ring-1 ring-gray-200 text-[#1C2B4A] hover:bg-gray-50 hidden md:flex items-center justify-center ${
        dir === 1 ? '-end-6' : '-start-6'
      }`}
    >
      <Icon name={dir === 1 ? 'chevronRight' : 'chevronLeft'} size={24} className="rtl:rotate-180" />
    </button>
  )
  const cta = (s: Slide, active: boolean) => {
    const cls = 'inline-flex items-center gap-1.5 rounded-full bg-[#1C2B4A] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#2A3E66] transition-colors'
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

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-labelledby="slides-title"
      className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 md:pt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !rootRef.current?.contains(e.relatedTarget as Node) && setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + (rtl ? -1 : 1))
        if (e.key === 'ArrowLeft') go(index + (rtl ? 1 : -1))
      }}
    >
      <h2 id="slides-title" className="text-center text-2xl md:text-3xl font-bold text-[#1C2B4A]">
        {t('slidesTitle')}
      </h2>

      <div className="relative mt-8">
        {arrow(-1)}
        {arrow(1)}
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-[#16223B]/15 ring-1 ring-gray-100">
          <div
            className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${(rtl ? 1 : -1) * index * 100}%)` }}
          >
            {SLIDES.map((s, i) => {
              const photo = SLIDE_PHOTOS[s.key]
              const active = i === index
              return (
                <div
                  key={s.key}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} / ${n}`}
                  aria-hidden={!active}
                  inert={!active}
                  className="w-full flex-shrink-0 grid md:grid-cols-2 gap-8 md:gap-12 items-center p-6 sm:p-10 md:p-12"
                >
                  <figure className="relative">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg"
                    />
                    <figcaption className="absolute bottom-2 end-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
                      <PhotoCredit photo={photo} />
                    </figcaption>
                  </figure>
                  <div className="text-center md:text-start">
                    <p className="text-sm font-semibold" style={{ color: GOLD_TEXT }}>
                      {t(k(s.n, 'tag'))}
                    </p>
                    <h3 className="mt-2 text-2xl md:text-4xl font-bold leading-tight text-[#1C2B4A]">{t(k(s.n, 'title'))}</h3>
                    <p className="mt-4 text-gray-600 leading-relaxed">{t(k(s.n, 'body'))}</p>
                    <ul className="mt-5 space-y-2.5 text-sm md:text-base text-start inline-block md:block">
                      {[1, 2, 3].map((p) => (
                        <li key={p} className="flex items-start gap-3 text-gray-800">
                          <span className="mt-0.5 w-6 h-6 rounded-full bg-[#1C2B4A]/8 text-[#1C2B4A] flex items-center justify-center flex-shrink-0">
                            <Icon name="check" size={16} />
                          </span>
                          {t(k(s.n, `p${p}`))}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7">{cta(s, active)}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pb-6 flex justify-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => go(i)}
                aria-label={t('goToSlide').replace('{n}', String(i + 1))}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-[#1C2B4A]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureCarousel
