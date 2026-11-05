import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { usePoll } from '../hooks/usePoll'
import { approachingBuses, kmText, LIVE_POLL_MS, type ApproachingBus } from '../services/live'
import Icon from './Icon'

// On a bus step of a journey (leaving now): the buses of this route on their way to the boarding stop, from
// their live positions. "In 8 min" only when the operator publishes an arrival time; otherwise how many
// stops away the bus is. Refreshed every 30 s while shown.
type Props = { feedId: string; routeId: string; stopId: string; nextStopId: string }

function LiveApproach({ feedId, routeId, stopId, nextStopId }: Props) {
  const { t } = useLanguage()
  const [state, setState] = useState<{ key: string; buses: ApproachingBus[] | null; error: boolean } | null>(null)
  const key = `${feedId}|${routeId}|${stopId}|${nextStopId}`

  usePoll(() => {
    approachingBuses({ feed_id: feedId, route_id: routeId, stop_id: stopId, next_stop_id: nextStopId })
      .then((r) => setState({ key, buses: r.buses, error: false }))
      .catch(() => setState((s) => ({ key, buses: s?.key === key ? s.buses : null, error: true })))
  }, LIVE_POLL_MS, key)

  const cur = state?.key === key ? state : null
  const where = (b: ApproachingBus) => {
    if (b.eta_secs !== null) return b.eta_secs < 60 ? t('liveDue') : t('liveMinAway').replace('{n}', String(Math.round(b.eta_secs / 60)))
    if (b.stops_away === 0) return t('liveAtStop')
    if (b.stops_away === 1) return t('liveOneStopAway')
    if (b.stops_away !== null) return t('liveStopsAway').replace('{n}', String(b.stops_away))
    return ''
  }

  // the second line: stops and distance, whichever the big value does not already say
  const detail = (b: ApproachingBus) => {
    const parts: string[] = []
    if (b.eta_secs !== null && b.stops_away !== null && b.stops_away > 0) parts.push(b.stops_away === 1 ? t('liveOneStopAway') : t('liveStopsAway').replace('{n}', String(b.stops_away)))
    if (b.distance_m !== null && b.distance_m > 0) parts.push(t('liveKmAway').replace('{d}', kmText(b.distance_m)))
    return parts.join(' · ')
  }

  // one card: a "Live" header, then a row per bus with the big value on the left, the details under it, and the
  // bus plate and wheelchair sign on the right; the nearest bus first and stronger (owner, 5 Nov 2026)
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-emerald-200 bg-white text-sm" aria-live="polite">
      <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        {t('liveNow')}
      </div>
      {!cur && <div className="px-3 py-2.5 text-gray-500">{t('liveLoading')}</div>}
      {cur && !cur.buses?.length && <div className="px-3 py-2.5 text-gray-500">{cur.error ? t('liveError') : t('liveNoBuses')}</div>}
      {cur?.buses && cur.buses.length > 0 && (
        <ul className="divide-y divide-emerald-100">
          {cur.buses.map((b, i) => (
            <li key={b.vehicle_id} className="flex items-center gap-3 px-3 py-2">
              <span aria-hidden="true" className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                <Icon name="bus" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block leading-tight ${i === 0 ? 'text-[15px] font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>{where(b)}</span>
                {detail(b) && <span className="block text-xs text-gray-500">{detail(b)}</span>}
              </span>
              <span className="flex flex-shrink-0 items-center gap-1.5">
                {b.wheelchair && <Icon name="accessible" size={16} className="text-[#222D52]" label={t('liveWheelchair')} />}
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600">{b.vehicle_id}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LiveApproach
