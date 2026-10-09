import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useTrails } from '../hooks/useTrails'
import TrailCover from './TrailCover'
import Icon from './Icon'
import { categoryKey, firstStation, isCategoryShown, trailNameKey, type Trail, type TrailCategory } from '../data/trails'
import { CATEGORY_STYLE } from '../data/trailStyles'
import { TRAIL_PHOTOS } from '../data/trailPhotos'

// Home page "RONDA 300" (trails are part of RONDA 300; "Explore stations" opens the RONDA 300 page): three big category cards (the categories with the most trails: photo, trail names as
// tags, count; they open /trails?category=…), then a swipeable "Featured trails" row of small cards.
function TrailsSection() {
  const { t, lang } = useLanguage()
  const rowRef = useRef<HTMLUListElement>(null)
  const { data, error } = useTrails()
  const trails = (data?.trails ?? []).filter((tr) => isCategoryShown(tr.category, lang))

  const byCategory = new Map<TrailCategory, Trail[]>()
  for (const tr of trails) byCategory.set(tr.category, [...(byCategory.get(tr.category) ?? []), tr])
  const big = [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 3)

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
      aria-label={dir === 1 ? t('scrollNext') : t('scrollPrev')}
      className="hidden md:flex w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-[#1F2F5C] hover:bg-gray-50"
    >
      <Icon name={dir === 1 ? 'chevronRight' : 'chevronLeft'} size={18} className="rtl:rotate-180" />
    </button>
  )

  return (
    <section id="explore" aria-labelledby="trails-title" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="trails-title" className="text-2xl md:text-3xl font-bold text-[#1F2F5C]">
            {t('s2_title')}
          </h2>
          <p className="mt-1 text-gray-500">{t('r3_homeSub')}</p>
        </div>
        <Link
          to="/ronda-300"
          className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 h-9 px-4 rounded-full border border-gray-300 bg-white text-sm font-semibold text-[#1F2F5C] hover:bg-gray-50"
        >
          {t('s2_cta')}
          <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
        </Link>
      </div>

      {!data ? (
        <p className="text-gray-500" role={error ? 'alert' : 'status'}>{error ? t('trailsLoadError') : t('loading')}</p>
      ) : (
        <>
          {/* big category cards: a swipeable row on phones, three across from tablet up */}
          <ul className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 md:scroll-px-0 [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0 pb-1">
            {big.map(([cat, list]) => {
              const cover = list.find((tr) => TRAIL_PHOTOS[tr.slug]) ?? list[0]
              return (
                <li key={cat} className="snap-start flex-shrink-0 w-[85%] sm:w-[60%] md:w-auto">
                  <Link
                    to={`/trails?category=${cat}`}
                    className="group relative block aspect-[5/4] rounded-2xl overflow-hidden bg-[#18243F] border-t-4 shadow-sm hover:shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2F5C]"
                    style={{ borderTopColor: CATEGORY_STYLE[cat].to }}
                  >
                    <TrailCover trail={cover} className="absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                    <p className="absolute top-3 inset-x-4 text-[11px] text-white/90 truncate [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">
                      {list.slice(0, 3).map((tr) => t(trailNameKey(tr))).join(' · ')}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
                      <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t(categoryKey(cat))}</h3>
                      <p className="mt-1 text-sm text-white/90">{t('trailsInCategory').replace('{n}', String(list.length))}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-8 mb-3 flex items-center justify-between gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">{t('featuredTrails')}</h3>
            <div className="flex items-center gap-2">
              {arrow(-1)}
              {arrow(1)}
              <Link
                to="/trails"
                className="inline-flex items-center gap-1 h-9 px-4 rounded-full border border-gray-300 bg-white text-sm font-semibold text-[#1F2F5C] hover:bg-gray-50"
              >
                {t('seeAllTrails')}
                <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>

          <ul ref={rowRef} className="flex gap-3 overflow-x-auto snap-x scroll-smooth scroll-px-4 [scrollbar-width:none] -mx-4 px-4 pb-4">
            {trails.map((trail) => {
              const station = firstStation(trail, data.places)
              return (
                <li key={trail.slug} className="snap-start flex-shrink-0 w-44 sm:w-48 flex">
                  <Link
                    to={`/trails/${trail.slug}`}
                    className="group w-full flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F2F5C]"
                  >
                    <div className="relative h-28 overflow-hidden">
                      <TrailCover trail={trail} className="group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute bottom-2 start-2 inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <Icon name={CATEGORY_STYLE[trail.category].icon} size={12} />
                        {t(categoryKey(trail.category))}
                      </span>
                    </div>
                    <div className="flex-1 p-3">
                      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{t(trailNameKey(trail))}</p>
                      {station && <p className="mt-1 text-xs text-gray-500 truncate">{station.name}</p>}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}

export default TrailsSection
