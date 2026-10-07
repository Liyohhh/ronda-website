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

  return (
    <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm" aria-live="polite">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        {t('liveNow')}
      </div>
      {!cur && <div className="mt-1 text-gray-500">{t('liveLoading')}</div>}
      {cur && !cur.buses?.length && <div className="mt-1 text-gray-500">{cur.error ? t('liveError') : t('liveNoBuses')}</div>}
      {cur?.buses && cur.buses.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {cur.buses.map((b) => (
            <li key={b.vehicle_id} className="flex flex-wrap items-center gap-x-2 text-gray-800">
              <span className="font-semibold text-gray-900">{where(b)}</span>
              {b.eta_secs !== null && b.stops_away !== null && b.stops_away > 0 && (
                <span className="text-gray-500">· {b.stops_away === 1 ? t('liveOneStopAway') : t('liveStopsAway').replace('{n}', String(b.stops_away))}</span>
              )}
              {b.eta_secs === null && b.distance_m !== null && b.distance_m > 0 && (
                <span className="text-gray-500">· {t('liveKmAway').replace('{d}', kmText(b.distance_m))}</span>
              )}
              <span className="text-xs text-gray-500 tabular-nums">{b.vehicle_id}</span>
              {b.wheelchair && <Icon name="accessible" size={14} className="text-[#1C2B4A]" label={t('liveWheelchair')} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LiveApproach
