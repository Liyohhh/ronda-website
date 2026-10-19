import { lazy, Suspense, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useTrails } from '../hooks/useTrails'
import TrailCard from './TrailCard'
import CategoryPills, { type CategoryFilter } from './CategoryPills'
import Icon from './Icon'
import { isCategoryShown } from '../data/trails'
import { Accent, Eyebrow, Reveal } from './Motion'
import type { Pick } from '../data/suggestions'

// the RONDA 300 map loads only when asked for (it brings the map library with it)
const Ronda300Explorer = lazy(() => import('./Ronda300Explorer'))

// Home page "RONDA 300": a switch between the trails and the station map (both are RONDA 300). Trails: category pills,
// a swipeable row of trail cards and "See all trails", which opens /trails with the same category picked. Station map:
// the same RONDA 300 panel as on /ronda-300 (every rail station; pick one to see its places right here), and
// "Open RONDA 300" opens the page, with the picked station if there is one.
function TrailsSection() {
  const { t, lang } = useLanguage()
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [view, setView] = useState<'trails' | 'map'>('trails')
  const [station, setStation] = useState<Pick | null>(null)
  const rowRef = useRef<HTMLUListElement>(null)
  // which ends of the row are showing: an arrow with nowhere to go is greyed out
  const [edge, setEdge] = useState({ start: true, end: false })
  const onRowScroll = () => {
    const el = rowRef.current
    if (!el) return
    const pos = Math.abs(el.scrollLeft) // negative in RTL
    setEdge({ start: pos < 4, end: pos + el.clientWidth >= el.scrollWidth - 4 })
  }
  const { data, error } = useTrails()
  const all = (data?.trails ?? []).filter((tr) => isCategoryShown(tr.category, lang))
  const trails = category === 'all' ? all : all.filter((tr) => tr.category === category)

  // arrows scroll one "page" of cards; in Arabic (RTL) the row runs the other way
  const scroll = (dir: 1 | -1) => {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: dir * (lang === 'ar' ? -1 : 1) * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      onClick={() => scroll(dir)}
      disabled={dir === 1 ? edge.end : edge.start}
      aria-label={dir === 1 ? t('scrollNext') : t('scrollPrev')}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#222D52] text-white shadow-[0_8px_20px_rgb(34_45_82/0.25)] items-center justify-center hover:bg-[#18203D] active:scale-95 transition disabled:opacity-0 disabled:pointer-events-none ${
        dir === 1 ? 'end-4 xl:end-8' : 'start-4 xl:start-8'
      }`}
    >
      <Icon name={dir === 1 ? 'chevronRight' : 'chevronLeft'} size={18} className="rtl:rotate-180" />
    </button>
  )

  return (
    <section id="explore" aria-labelledby="trails-title" className="scroll-mt-24 pt-24 md:pt-32 overflow-x-clip">
      {/* a centred gold label, one big serif sentence with its last word in italic gold, centred filter pills,
          then the cards across the full width */}
      <div className="wrap text-center">
        <Reveal>
          <h2 id="trails-title" className="inline-flex">
            <Eyebrow center>{t('s2_title')}</Eyebrow>
          </h2>
        </Reveal>
        <p className="mt-6 mx-auto max-w-4xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]">
          <Accent text={t('r3_homeSub')} />
        </p>
      </div>

      {/* trails or the station map */}
      <div className="mt-8 flex justify-center">
        <div className="flex rounded-full bg-gray-100 p-1">
          {([['trails', t('trails'), 'hiking'], ['map', t('r3_viewMap'), 'map']] as const).map(([v, label, icon]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${view === v ? 'bg-[#222D52] text-white shadow-[0_4px_12px_rgb(34_45_82/0.2)]' : 'text-gray-600 hover:text-[#222D52]'}`}
            >
              <Icon name={icon} size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'trails' ? (
        <>
      <div className="wrap mt-6 flex justify-center [&>div]:min-w-0">
        <CategoryPills value={category} onChange={(c) => { setCategory(c); rowRef.current?.scrollTo({ left: 0 }); setEdge({ start: true, end: false }) }} />
      </div>

      {!data ? (
        <p className="mt-6 text-center text-gray-500" role={error ? 'alert' : 'status'}>{error ? t('trailsLoadError') : t('loading')}</p>
      ) : trails.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">{t('noTrailsInCategory')}</p>
      ) : (
        // arrows sit on the left and right edges of the card row (desktop); phones swipe
        <div className="relative max-w-[1440px] mx-auto">
          {arrow(-1)}
          {arrow(1)}
          <ul
            ref={rowRef}
            onScroll={onRowScroll}
            className="wrap mt-8 flex items-start gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-px-4 sm:scroll-px-6 lg:scroll-px-12 xl:scroll-px-20 [scrollbar-width:none] pt-4 pb-12 -mb-6"
          >
            {trails.map((trail) => (
              <li key={trail.slug} className="snap-start flex-shrink-0 w-[82%] sm:w-[46%] lg:w-[31%] flex">
                <TrailCard trail={trail} places={data.places} className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex justify-center px-4">
        <Link
          to={category === 'all' ? '/trails' : `/trails?category=${category}`}
          className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-full bg-gold text-[15px] font-bold text-[#222D52] shadow-[0_6px_16px_rgb(210_182_138/0.35)] hover:bg-gold-hover active:scale-95 transition whitespace-nowrap"
        >
          {t('seeAllTrails')}
          <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
        </Link>
      </div>
        </>
      ) : (
        <>
      <div className="wrap mt-8">
        <Suspense fallback={<div className="h-[380px] sm:h-[480px] lg:h-[560px] rounded-[28px] bg-gray-100" role="status" aria-label={t('loading')} />}>
          <Ronda300Explorer picked={station} onPick={setStation} />
        </Suspense>
      </div>
      <div className="mt-8 flex justify-center px-4">
        <Link
          to={station ? `/ronda-300?${new URLSearchParams({ station: station.name, lat: String(station.lat), lon: String(station.lon) })}` : '/ronda-300'}
          className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-full bg-gold text-[15px] font-bold text-[#222D52] shadow-[0_6px_16px_rgb(210_182_138/0.35)] hover:bg-gold-hover active:scale-95 transition whitespace-nowrap"
        >
          {t('r3_openPage')}
          <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
        </Link>
      </div>
        </>
      )}
    </section>
  )
}

export default TrailsSection
