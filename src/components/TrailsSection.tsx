import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useTrails } from '../hooks/useTrails'
import TrailCardClassic from './TrailCardClassic'
import CategoryPills, { type CategoryFilter } from './CategoryPills'
import Icon from './Icon'
import { isCategoryShown } from '../data/trails'

// Home page "RONDA 300" (trails are part of RONDA 300; "Explore stations" opens the RONDA 300 page):
// category pills and a swipeable row of trail cards
function TrailsSection() {
  const { t, lang } = useLanguage()
  const [category, setCategory] = useState<CategoryFilter>('all')
  const rowRef = useRef<HTMLUListElement>(null)
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
      aria-label={dir === 1 ? t('scrollNext') : t('scrollPrev')}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-[#1F2F5C] hover:bg-gray-50 ${
        dir === 1 ? '-end-5' : '-start-5'
      }`}
    >
      <Icon name={dir === 1 ? 'chevronRight' : 'chevronLeft'} size={18} className="rtl:rotate-180" />
    </button>
  )

  return (
    <section id="explore" aria-labelledby="trails-title" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 id="trails-title" className="text-2xl md:text-3xl font-bold text-[#1F2F5C]">
            {t('s2_title')}
          </h2>
          <p className="mt-1 text-gray-500">{t('r3_homeSub')}</p>
        </div>
        <div className="flex items-center flex-shrink-0">
          <Link
            to="/ronda-300"
            className="hidden sm:inline-flex items-center gap-1 h-10 px-4 rounded-full border border-gray-200 bg-white text-sm font-semibold text-[#1F2F5C] shadow-sm hover:bg-gray-50"
          >
            {t('s2_cta')}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>

      <CategoryPills value={category} onChange={setCategory} />

      {!data ? (
        <p className="mt-6 text-gray-500" role={error ? 'alert' : 'status'}>{error ? t('trailsLoadError') : t('loading')}</p>
      ) : trails.length === 0 ? (
        <p className="mt-6 text-gray-500">{t('noTrailsInCategory')}</p>
      ) : (
        // arrows sit on the left and right edges of the card row (desktop); phones swipe
        <div className="relative">
          {arrow(-1)}
          {arrow(1)}
          <ul
            ref={rowRef}
            className="mt-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-px-4 [scrollbar-width:none] -mx-4 px-4 pb-4"
          >
            {trails.map((trail) => (
              <li key={trail.slug} className="snap-start flex-shrink-0 w-[78%] sm:w-[46%] md:w-[31%] lg:w-[23.5%] flex">
                <TrailCardClassic trail={trail} places={data.places} className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default TrailsSection
