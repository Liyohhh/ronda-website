import { useEffect, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SuggestionList from '../components/SuggestionList'
import { buildItems, type Pick } from '../data/suggestions'
import { useSmartSearch } from '../hooks/useSmartSearch'
import SiteLayout from '../components/SiteLayout'
import BackButton from '../components/BackButton'
import Icon from '../components/Icon'
import { useLanguage } from '../hooks/useLanguage'
import { formatDuration } from '../i18n/duration'
import { loadHub, planFromHub, type Hub as HubT, type HubDestination } from '../services/hubs'

// /hub/:slug: "from here to anywhere" for an arrival hub. Times and fares come from the trip planner, run every
// night in the database for the next day at 10:00; the button opens the planner with the trip filled in.
function Hub() {
  const { slug = '' } = useParams()
  const { t } = useLanguage()
  const [data, setData] = useState<{ hub: HubT; destinations: HubDestination[] } | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let live = true
    loadHub(slug).then((d) => { if (live) setData(d) }).catch(() => { if (live) setFailed(true) })
    return () => { live = false }
  }, [slug])

  const hub = data?.hub
  return (
    <SiteLayout>
      <section className="bg-[#1F2F5C] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <div className="mb-5">
            <BackButton to="/" label={t('backToHome')} onDark />
          </div>
          <p className="text-sm font-semibold text-accent-light">{t('hubTag')}</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">{hub ? t('hubTitle').replace('{hub}', hub.name) : t('hubTag')}</h1>
          <p className="mt-3 text-white/80 max-w-2xl">{t('hubIntro')}</p>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" aria-live="polite">
        {failed ? (
          <p role="alert" className="text-gray-700">{t('hubError')}</p>
        ) : data === undefined ? (
          <p role="status" className="text-gray-500">{t('loading')}</p>
        ) : data === null ? (
          <p className="text-gray-700">{t('hubNotFound')}</p>
        ) : (
          <>
          <GoAnywhere hub={data.hub} />
          <h2 className="mt-10 text-lg font-semibold text-[#1F2F5C]">{t('hubPopular')}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {data.destinations.map((d) => (
              <li key={d.dest_slug} className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900">{d.dest_name}</h2>
                {d.duration_min !== null ? (
                  <p className="mt-1 text-sm text-gray-700">
                    {t('hubAbout').replace('{time}', formatDuration(d.duration_min, t))}
                    {' · '}
                    {d.transfers === 1 ? t('hubChange1') : d.transfers ? t('hubChanges').replace('{n}', String(d.transfers)) : t('hubDirect')}
                    {d.fare_amount !== null && <> · {d.fare_exact ? '' : t('hubFrom') + ' '}RM{Number(d.fare_amount).toFixed(2)}</>}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">{t('hubNoTime')}</p>
                )}
                {d.hops && d.hops.length > 0 && <p className="mt-1 text-sm text-gray-500">{d.hops.join(' → ')}</p>}
                <Link to={planFromHub(data.hub, d)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1F2F5C] hover:underline">
                  {t('hubPlan')}
                  <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                </Link>
              </li>
            ))}
          </ul>
          </>
        )}
        {data && <p className="mt-6 text-sm text-gray-500">{t('hubNote')}</p>}
      </div>
    </SiteLayout>
  )
}

const LIST_ID = 'hub-go-list'
// "I just landed": type where you're staying (hotel, address, place) and plan from the hub to it
function GoAnywhere({ hub }: { hub: HubT }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const { stops, places, loading } = useSmartSearch(q)
  const items = q.trim() ? buildItems(stops, places) : []
  const listOpen = open && items.length > 0
  const airport = hub.slug.startsWith('klia')
  const go = (p: Pick) => navigate(planFromHub(hub, { lat: p.lat, lon: p.lon, dest_name: p.name }))
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && items.length) { e.preventDefault(); go(items[Math.max(hi, 0)].pick) }
    else if (e.key === 'Escape') setOpen(false)
  }
  return (
    <section aria-labelledby="hub-go" className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 id="hub-go" className="text-lg font-semibold text-[#1F2F5C]">{t(airport ? 'hubLanded' : 'hubElsewhere')}</h2>
      <label htmlFor="hub-go-input" className="mt-1 block text-sm text-gray-600">{t('hubGoLabel')}</label>
      <div className="relative mt-3 max-w-xl">
        <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 focus-within:border-[#1F2F5C]">
          <Icon name="search" size={20} className="text-gray-500" />
          <input
            id="hub-go-input"
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(-1) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded={listOpen}
            aria-controls={LIST_ID}
            aria-autocomplete="list"
            aria-activedescendant={listOpen && hi >= 0 ? `${LIST_ID}-${hi}` : undefined}
            autoComplete="off"
            placeholder={t('hubGoPh')}
            className="w-full text-base outline-none"
          />
        </div>
        {listOpen && (
          <div className="absolute z-20 mt-2 w-full">
            <SuggestionList id={LIST_ID} items={items} query={q} loading={loading} highlighted={hi} onHover={setHi} onPick={go} />
          </div>
        )}
      </div>
    </section>
  )
}

export default Hub
