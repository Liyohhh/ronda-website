import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import LineBadge from '../components/LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import { LINES_BY_ID } from '../data/lines'
import { supabase } from '../services/supabase'

type Station = { seq: number; stop_id: string; name: string; lat: number; lon: number }

// Home opens with the End box filled in: /?to=<stop name>&toName=<shown name>
const planHref = (name: string) => `/?to=${encodeURIComponent(name)}&toName=${encodeURIComponent(name)}`

// /lines/:id: a line's stations in running order (public.line_stations)
function LineDetail() {
  const { id = '' } = useParams()
  const { t } = useLanguage()
  const line = LINES_BY_ID[id]
  const [result, setResult] = useState<{ id: string; stations: Station[] | null; error: boolean } | null>(null)

  useEffect(() => {
    if (!line) return
    let cancelled = false
    supabase.rpc('line_stations', { p_feed: line.gtfs.feedId, p_routes: line.gtfs.routeIds }).then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('line_stations', error)
      setResult({ id: line.id, stations: (data as Station[] | null) ?? null, error: !!error })
    })
    return () => {
      cancelled = true
    }
  }, [line])

  const back = (
    <Link to="/?tab=lines" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#002472] hover:underline">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {t('allLines')}
    </Link>
  )

  if (!line) {
    return (
      <SiteLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          {back}
          <h1 className="mt-6 text-2xl font-bold text-[#002472]">{t('lineNotFound')}</h1>
        </div>
      </SiteLayout>
    )
  }

  const current = result?.id === line.id ? result : null
  const stations = current?.stations ?? []

  return (
    <SiteLayout>
      <section className="text-white" style={{ backgroundColor: line.color }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex items-center gap-4">
          <span className="rounded-full ring-4 ring-white/40">
            <LineBadge line={line} size={64} decorative />
          </span>
          <div style={{ color: line.textColor }}>
            <h1 className="text-3xl font-bold">{line.name}</h1>
            {current && !current.error && <p className="mt-1 opacity-85">{t('lineStationCount').replace('{n}', String(stations.length))}</p>}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {back}
        {!current && <p className="mt-6 text-gray-500">{t('loading')}</p>}
        {current?.error && <p className="mt-6 text-red-700">{t('lineLoadError')}</p>}
        {current && !current.error && (
          <ol className="mt-6 relative">
            {stations.map((s, i) => (
              <li key={s.stop_id + s.seq} className="relative flex items-center gap-4 pb-3 last:pb-0">
                {i < stations.length - 1 && (
                  <span className="absolute start-[11px] top-6 bottom-0 w-1 -translate-x-1/2 rtl:translate-x-1/2" style={{ backgroundColor: line.color }} aria-hidden="true" />
                )}
                <span className="relative z-10 w-6 h-6 rounded-full bg-white border-4 flex-shrink-0" style={{ borderColor: line.color }} aria-hidden="true" />
                <div className="flex-1 flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <Link to={planHref(s.name)} className="text-sm font-semibold text-[#002472] hover:underline whitespace-nowrap">
                    {t('planTripHere')}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </SiteLayout>
  )
}

export default LineDetail
