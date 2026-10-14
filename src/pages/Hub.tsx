import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
          <ul className="grid gap-3 sm:grid-cols-2">
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
        )}
        {data && <p className="mt-6 text-sm text-gray-500">{t('hubNote')}</p>}
      </div>
    </SiteLayout>
  )
}

export default Hub
