import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import LineBadge from './LineBadge'
import TrailCover from './TrailCover'
import { LINES } from '../data/lines'
import { TRAILS } from '../data/trails'

// "Travel made effortless" slides: a live mini-preview built from real RONDA pieces on one side,
// the message on the other. Arrows, dots, keyboard, and a gentle auto-advance that pauses on
// hover / focus and is off for people who prefer reduced motion.

const AUTO_MS = 7000

function PhoneCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-200 shadow-xl p-5" aria-hidden="true">
      {children}
    </div>
  )
}

// Sample trip, drawn the way the results panel draws it (illustrative, not live data)
function PlanPreview() {
  return (
    <PhoneCard>
      <div className="text-xs text-gray-400">KLIA T1 → Pandan Perdana</div>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-gray-900">78 min</span>
        <span className="text-sm text-gray-500">09:03 – 10:21</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        {['erl-klia-transit', 'lrt-sri-petaling'].map((id) => (
          <span key={id} className="flex items-center gap-1.5">
            <LineBadge line={id} size={26} decorative />
            <span className="text-gray-300">›</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
          <span className="w-[26px] h-[26px] rounded-md bg-[#002472] text-white text-[9px] font-bold flex items-center justify-center">BUS</span>
          400
        </span>
      </div>
      {/* stop names and times only, so the preview reads the same in every language */}
      <ol className="mt-4 space-y-2">
        {[
          ['09:07', 'ERL KLIA T1'],
          ['09:34', 'LRT Bandar Tasik Selatan'],
          ['09:48', 'LRT Pudu'],
          ['10:21', 'Pandan Perdana'],
        ].map(([time, stop]) => (
          <li key={stop} className="flex items-center gap-3 text-sm">
            <span className="w-11 text-gray-400 tabular-nums">{time}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
            <span className="text-gray-700">{stop}</span>
          </li>
        ))}
      </ol>
    </PhoneCard>
  )
}

function LinesPreview() {
  return (
    <PhoneCard>
      <div className="grid grid-cols-5 gap-3">
        {LINES.slice(0, 15).map((l) => (
          <LineBadge key={l.id} line={l} size={44} decorative />
        ))}
      </div>
    </PhoneCard>
  )
}

function FaresPreview() {
  const rows: [string, string, string][] = [
    ['erl-klia-transit', 'klia2 → Putrajaya', 'RM 9.40'],
    ['brt-sunway', 'Sunway-Setia Jaya → Mentari', 'RM 1.30'],
    ['erl-klia-ekspres', 'KL Sentral → KLIA T1', 'RM 55.00'],
  ]
  return (
    <PhoneCard>
      <div className="divide-y divide-gray-100">
        {rows.map(([id, trip, fare]) => (
          <div key={trip} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <LineBadge line={id} size={32} decorative />
            <span className="flex-1 text-sm text-gray-700">{trip}</span>
            <span className="text-sm font-semibold text-gray-900">{fare}</span>
          </div>
        ))}
      </div>
    </PhoneCard>
  )
}

function TrailsPreview() {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm" aria-hidden="true">
      {TRAILS.filter((t) => ['food-hawker', 'heritage', 'nature'].includes(t.slug)).map((t) => (
        <div key={t.slug} className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
          <TrailCover trail={t} />
        </div>
      ))}
    </div>
  )
}

const SLIDES: { key: string; title: TranslationKey; text: TranslationKey; visual: () => ReactNode }[] = [
  { key: 'plan', title: 'slide_plan_title', text: 'slide_plan_text', visual: PlanPreview },
  { key: 'lines', title: 'slide_lines_title', text: 'slide_lines_text', visual: LinesPreview },
  { key: 'fares', title: 'slide_fares_title', text: 'slide_fares_text', visual: FaresPreview },
  { key: 'trails', title: 'slide_trails_title', text: 'slide_trails_text', visual: TrailsPreview },
]

function FeatureCarousel() {
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
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/90 border border-gray-200 shadow-md text-[#002472] hover:bg-white flex items-center justify-center ${
        dir === 1 ? 'end-2 md:-end-5' : 'start-2 md:-start-5'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
        <path d={dir === 1 ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
      </svg>
    </button>
  )

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-labelledby="slides-title"
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !rootRef.current?.contains(e.relatedTarget as Node) && setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + (rtl ? -1 : 1))
        if (e.key === 'ArrowLeft') go(index + (rtl ? 1 : -1))
      }}
    >
      <h2 id="slides-title" className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
        {t('slidesTitle')}
      </h2>

      <div className="relative mt-8">
        {arrow(-1)}
        {arrow(1)}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-[#002472]/[0.04] shadow-sm">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${(rtl ? 1 : -1) * index * 100}%)` }}
          >
            {SLIDES.map((s, i) => {
              const Visual = s.visual
              return (
                <div
                  key={s.key}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} / ${n}`}
                  aria-hidden={i !== index}
                  className="w-full flex-shrink-0 grid md:grid-cols-2 gap-8 md:gap-12 items-center px-8 sm:px-14 md:px-16 py-10 md:py-14"
                >
                  <div className="flex justify-center order-2 md:order-1">
                    <Visual />
                  </div>
                  <div className="order-1 md:order-2 text-center md:text-start">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#002472] leading-tight">{t(s.title)}</h3>
                    <p className="mt-4 text-gray-600 md:text-lg leading-relaxed">{t(s.text)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => go(i)}
            aria-label={t('goToSlide').replace('{n}', String(i + 1))}
            aria-current={i === index}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-7 bg-[#002472]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </section>
  )
}

export default FeatureCarousel
