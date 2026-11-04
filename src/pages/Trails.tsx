import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import PageHero from '../components/PageHero'
import TrailCard from '../components/TrailCard'
import Icon from '../components/Icon'
import CategoryPills, { type CategoryFilter } from '../components/CategoryPills'
import { categoriesFor, isCategoryShown, trailDescKey, trailNameKey } from '../data/trails'
import { matchScore } from '../data/smartMatch'
import { useTrails } from '../hooks/useTrails'
import { useLanguage } from '../hooks/useLanguage'

// /trails: every trail, filterable by category and by a search (both kept in the URL: /trails?category=food&q=hawker).
// The search is typo-tolerant (data/smartMatch.ts) and looks at the trail's name and description in the reader's
// language, its stops' names and their stations; best matches first.
function Trails() {
  const { t, lang } = useLanguage()
  const [params, setParams] = useSearchParams()
  const raw = params.get('category')
  const category: CategoryFilter = categoriesFor(lang).includes(raw as never) ? (raw as CategoryFilter) : 'all'
  const q = params.get('q') ?? ''
  const { data, error } = useTrails()

  const trails = useMemo(() => {
    const all = (data?.trails ?? []).filter((tr) => isCategoryShown(tr.category, lang) && (category === 'all' || tr.category === category))
    if (!q.trim() || !data) return all
    return all
      .map((tr) => {
        const stops = tr.stops.map((s) => data.places[s.placeId]).filter(Boolean)
        const name = matchScore(q, [t(trailNameKey(tr))]) * 3 // a hit in the name counts most
        const rest = matchScore(q, [t(trailDescKey(tr)), ...stops.map((p) => p.name), ...stops.map((p) => p.station?.name ?? '')])
        return { tr, score: name + rest }
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.tr)
  }, [data, lang, category, q, t])

  const update = (next: { category?: CategoryFilter; q?: string }) => {
    const c = next.category ?? category, query = next.q ?? q
    setParams({ ...(c === 'all' ? {} : { category: c }), ...(query ? { q: query } : {}) }, { replace: true })
  }

  return (
    <SiteLayout>
      <PageHero back={{ to: '/', label: t('backToHome') }} eyebrow={t('trails')} title={t('trailsTitle')} intro={t('trailsSubtitle')} />

      <div className="wrap py-8">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative max-w-xl">
          <label htmlFor="trail-search" className="sr-only">{t('trailsSearchLabel')}</label>
          <Icon name="search" size={20} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#5B6576]" />
          <input
            id="trail-search"
            type="search"
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder={t('trailsSearchPh')}
            autoComplete="off"
            className="h-12 w-full rounded-full border border-[#D3DCE7] bg-white ps-12 pe-4 text-[15px] text-[#222D52] outline-none transition placeholder:text-[#7B8494] focus:border-[#2F6BD8] focus:ring-2 focus:ring-[#2F6BD8]/30"
          />
        </form>

        <div className="mt-5"><CategoryPills value={category} onChange={(c) => update({ category: c })} /></div>

        {!data ? (
          <p className="mt-8 text-gray-500" role={error ? 'alert' : 'status'}>{error ? t('trailsLoadError') : t('loading')}</p>
        ) : trails.length === 0 ? (
          <div className="mt-8 border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
            {q ? (
              <>
                <p>{t('trailsNoMatch').replace('{q}', q)}</p>
                <button type="button" onClick={() => update({ q: '' })} className="mt-3 font-semibold text-[#222D52] underline decoration-[#2F6BD8] underline-offset-4">{t('trailsClearSearch')}</button>
              </>
            ) : t('noTrailsInCategory')}
          </div>
        ) : (
          <>
            {q && <p role="status" className="mt-6 text-sm text-[#5B6576]">{t('trailsFound').replace('{n}', String(trails.length))}</p>}
            <ul className={`${q ? 'mt-3' : 'mt-6'} grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
              {trails.map((trail) => (
                <li key={trail.slug} className="flex">
                  <TrailCard trail={trail} places={data.places} className="w-full" />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </SiteLayout>
  )
}

export default Trails
