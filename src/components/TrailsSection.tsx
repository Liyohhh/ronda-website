import { useRef, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useTrails } from '../hooks/useTrails'
import TrailCard from './TrailCard'
import CategoryPills, { type CategoryFilter } from './CategoryPills'
import Icon from './Icon'

// Home page: "Explore Trails" with category pills and a swipeable row of trail cards
function TrailsSection() {
  const { t, lang } = useLanguage()
  const [category, setCategory] = useState<CategoryFilter>('all')
  const rowRef = useRef<HTMLUListElement>(null)
  const { data, error } = useTrails()
  const all = data?.trails ?? []
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
      className="hidden md:flex w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-[#002472] hover:bg-gray-50"
    >
      <Icon name={dir === 1 ? 'chevronRight' : 'chevronLeft'} size={18} className="rtl:rotate-180" />
    </button>
  )

  return (
    <section aria-labelledby="trails-title" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 id="trails-title" className="text-2xl md:text-3xl font-bold text-[#002472]">
            {t('trailsTitle')}
          </h2>
          <p className="mt-1 text-gray-500">{t('trailsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {arrow(-1)}
          {arrow(1)}
        </div>
      </div>

      <CategoryPills value={category} onChange={setCategory} />

      {!data ? (
        <p className="mt-6 text-gray-500" role={error ? 'alert' : 'status'}>{error ? t('trailsLoadError') : t('loading')}</p>
      ) : trails.length === 0 ? (
        <p className="mt-6 text-gray-500">{t('noTrailsInCategory')}</p>
      ) : (
        <ul
          ref={rowRef}
          className="mt-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] -mx-4 px-4 pb-4"
        >
          {trails.map((trail) => (
            <li key={trail.slug} className="snap-start flex-shrink-0 w-[78%] sm:w-[46%] md:w-[31%] lg:w-[23.5%] flex">
              <TrailCard trail={trail} places={data.places} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TrailsSection
