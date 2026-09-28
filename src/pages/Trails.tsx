import { useSearchParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import TrailCard from '../components/TrailCard'
import CategoryPills, { type CategoryFilter } from '../components/CategoryPills'
import { TRAILS, TRAIL_CATEGORIES } from '../data/trails'
import { useLanguage } from '../hooks/useLanguage'

// /trails: every trail, filterable by category (kept in the URL: /trails?category=food)
function Trails() {
  const { t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const raw = params.get('category')
  const category: CategoryFilter = TRAIL_CATEGORIES.includes(raw as never) ? (raw as CategoryFilter) : 'all'
  const trails = category === 'all' ? TRAILS : TRAILS.filter((tr) => tr.category === category)

  const setCategory = (c: CategoryFilter) => setParams(c === 'all' ? {} : { category: c }, { replace: true })

  return (
    <SiteLayout>
      <section className="bg-[#002472] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold">{t('trailsTitle')}</h1>
          <p className="mt-2 text-white/75 max-w-xl">{t('trailsSubtitle')}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <CategoryPills value={category} onChange={setCategory} />

        {trails.length === 0 ? (
          <div className="mt-8 border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
            {t('noTrailsInCategory')}
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trails.map((trail) => (
              <li key={trail.slug} className="flex">
                <TrailCard trail={trail} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  )
}

export default Trails
