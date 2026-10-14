import { useEffect, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useLocate } from '../hooks/useLocate'
import LineBadge from './LineBadge'
import Icon from './Icon'
import { linesForStop } from '../data/lines'
import type { Pick } from '../data/suggestions'
import { distanceText, loadNearestTransit, walkable, walkMinutes, type NearStop } from '../services/nearby'

// One line under the Home search bar: the nearest train station (line badge, name, distance) and the nearest bus
// stop (name, stop code, distance), however far. The location is asked for only when the rider presses the button,
// or straight away when this site already has the permission. Pressing a stop makes it the Start.
function NearbyTransit({ onPick }: { onPick: (p: Pick) => void }) {
  const { t } = useLanguage()
  const [near, setNear] = useState<{ train: NearStop | null; bus: NearStop | null } | null>(null)
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
    loadNearestTransit(state.lat, state.lon).then((n) => { if (live) { setFailed(false); setNear(n) } }).catch(() => { if (live) setFailed(true) })
    return () => { live = false }
  }, [state])

  const dist = (m: number) => walkable(m) ? t('nearWalk').replace('{m}', distanceText(m)).replace('{min}', String(walkMinutes(m))) : distanceText(m)
  const item = (s: NearStop, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => onPick({ name: s.name, lat: s.lat, lon: s.lon })}
      title={t('nearUse')}
      className="inline-flex items-center gap-1.5 min-w-0 max-w-full rounded-full px-1.5 py-0.5 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F2F5C]"
    >
      {icon}
      <span className="truncate font-medium text-gray-900">{label}</span>
      <span className="whitespace-nowrap text-gray-600">· {dist(s.distance_m)}</span>
    </button>
  )

  const found = state.status === 'found' && near && !failed
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-sm" aria-live="polite">
      <span className="inline-flex items-center gap-1.5 font-semibold text-[#1F2F5C]">
        <Icon name="myLocation" size={16} />
        {t('nearTitle')}:
      </span>
      {found ? (
        <>
          {near.train && item(
            near.train,
            <span className="flex flex-shrink-0" aria-hidden="true">
              {linesForStop(near.train.feed_id, near.train.route_ids ?? []).slice(0, 1).map((l) => <LineBadge key={l.id} line={l} size={20} decorative />)}
            </span>,
            near.train.name,
          )}
          {near.train && near.bus && <span aria-hidden="true" className="hidden sm:inline text-gray-300">|</span>}
          {near.bus && item(
            near.bus,
            <span aria-hidden="true" className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#1F2F5C] text-white">
              <Icon name="bus" size={14} />
            </span>,
            near.bus.code ? `${near.bus.name} (${near.bus.code})` : near.bus.name,
          )}
        </>
      ) : failed ? (
        <span className="text-gray-600">{t('nearError')}</span>
      ) : state.status === 'error' ? (
        <span className="text-gray-600">{t(state.reason === 'denied' ? 'nearDenied' : 'nearUnavailable')}</span>
      ) : state.status === 'locating' || state.status === 'found' ? (
        <span className="text-gray-500">{t('nearLocating')}</span>
      ) : (
        <button type="button" onClick={locate} className="font-semibold text-[#1D4ED8] hover:underline">{t('nearFind')}</button>
      )}
    </div>
  )
}

export default NearbyTransit
