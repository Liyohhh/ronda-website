import { useEffect, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useLocate } from '../hooks/useLocate'
import LineBadge from './LineBadge'
import Icon from './Icon'
import { busLine, linesForStop } from '../data/lines'
import type { Pick } from '../data/suggestions'
import { loadNearbyTransit, splitNearby, type NearStop } from '../services/nearby'
import { walkMinutes } from '../services/places'

// "Near you" under the Home search bar: the nearest train stations (line badge + name) and bus stops (stop code and
// routes), with walking distance. The location is asked for only when the rider presses the button, or straight
// away when this site already has the permission. Picking a stop makes it the Start.
function NearbyTransit({ onPick }: { onPick: (p: Pick) => void }) {
  const { t } = useLanguage()
  const [stops, setStops] = useState<NearStop[] | null>(null)
  const [failed, setFailed] = useState(false)
  const { state, locate } = useLocate()

  // permission already given: no prompt, so look straight away
  useEffect(() => {
    let live = true
    navigator.permissions?.query({ name: 'geolocation' as PermissionName })
      .then((p) => { if (live && p.state === 'granted') locate() })
      .catch(() => {})
    return () => { live = false }
  }, [locate])

  useEffect(() => {
    if (state.status !== 'found') return
    let live = true
    loadNearbyTransit(state.lat, state.lon).then((s) => { if (live) { setFailed(false); setStops(s) } }).catch(() => { if (live) setFailed(true) })
    return () => { live = false }
  }, [state])

  const { trains, buses } = splitNearby(stops ?? [])
  const walk = (m: number) => t('nearWalk').replace('{m}', String(m)).replace('{min}', String(walkMinutes(m)))

  if (state.status === 'idle' || state.status === 'locating' || state.status === 'error') {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={locate}
          disabled={state.status === 'locating'}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-gray-200 bg-white text-sm font-semibold text-[#1F2F5C] shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          <Icon name="myLocation" size={18} />
          {state.status === 'locating' ? t('nearLocating') : t('nearFind')}
        </button>
        {state.status === 'error' && (
          <p role="status" className="text-sm text-gray-600">{t(state.reason === 'denied' ? 'nearDenied' : 'nearUnavailable')}</p>
        )}
      </div>
    )
  }

  const row = (s: NearStop, badge: React.ReactNode, sub: string) => (
    <li key={`${s.feed_id}:${s.stop_id}`}>
      <button
        type="button"
        onClick={() => onPick({ name: s.name, lat: s.lat, lon: s.lon })}
        aria-label={`${s.name}, ${walk(s.distance_m)}. ${t('nearUse')}`}
        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-start hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F2F5C]"
      >
        {badge}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-gray-900">{s.name}</span>
          {sub && <span className="block truncate text-xs text-gray-500">{sub}</span>}
          {/* phones: the walk under the name, so nothing runs off the screen */}
          <span className="block text-xs font-medium text-gray-700 sm:hidden">{walk(s.distance_m)}</span>
        </span>
        <span className="hidden sm:block flex-shrink-0 text-sm text-gray-600 whitespace-nowrap">{walk(s.distance_m)}</span>
      </button>
    </li>
  )

  return (
    <section aria-labelledby="near-title" className="mt-4 min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 id="near-title" className="flex items-center gap-2 text-base font-semibold text-[#1F2F5C]">
          <Icon name="myLocation" size={18} />
          {t('nearTitle')}
        </h2>
        <button type="button" onClick={locate} className="text-sm font-semibold text-[#1D4ED8] hover:underline">{t('nearRefresh')}</button>
      </div>
      {failed ? (
        <p role="alert" className="mt-3 text-sm text-gray-700">{t('nearError')}</p>
      ) : !stops ? (
        <p role="status" className="mt-3 text-sm text-gray-500">{t('loading')}</p>
      ) : (
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('nearTrains')}</h3>
            {trains.length ? (
              <ul className="mt-1">
                {trains.map((s) => {
                  const lines = linesForStop(s.feed_id, s.route_ids ?? [])
                  const badge = (
                    <span className="flex flex-shrink-0 -space-x-1.5" aria-hidden="true">
                      {(lines.length ? lines : [busLine(null, s.name)]).slice(0, 3).map((l) => <LineBadge key={l.id} line={l} size={30} decorative />)}
                    </span>
                  )
                  return row(s, badge, lines.map((l) => l.name).join(' · '))
                })}
              </ul>
            ) : <p className="mt-1 px-3 text-sm text-gray-600">{t('nearNoTrains')}</p>}
          </div>
          <div>
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('nearBuses')}</h3>
            {buses.length ? (
              <ul className="mt-1">
                {buses.map((s) => {
                  const badge = (
                    <span aria-hidden="true" className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-md bg-[#1F2F5C] text-white">
                      <Icon name="directionsBusOutline" size={18} />
                    </span>
                  )
                  const routes = s.routes ?? []
                  const sub = [s.code, routes.slice(0, 5).join(' · ') + (routes.length > 5 ? ` +${routes.length - 5}` : '')].filter(Boolean).join(' · ')
                  return row(s, badge, sub)
                })}
              </ul>
            ) : <p className="mt-1 px-3 text-sm text-gray-600">{t('nearNoBuses')}</p>}
          </div>
        </div>
      )}
    </section>
  )
}

export default NearbyTransit
