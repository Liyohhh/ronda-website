import { useLanguage } from '../hooks/useLanguage'
import { useCarParks } from '../hooks/useCarParks'
import { carParkName, carParksAt, hasFare, parkAndRide, parkingStationKey, rm, type CarPark } from '../services/parking'
import type { Leg } from './JourneyPanel'

// The blue "P" of Malaysian parking signs
export function ParkingSign({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[5px] bg-[#1E5AA8] font-bold text-white flex-shrink-0 leading-none"
      style={{ width: size, height: size, fontSize: size * 0.65 }}
      aria-hidden="true"
    >
      P
    </span>
  )
}

// Fares of one car park, one short line each; nothing published = "fare not published yet"
export function CarParkFares({ c }: { c: CarPark }) {
  const { t } = useLanguage()
  if (c.is_free) return <div className="text-emerald-700">{t('parkFree')}</div>
  if (!hasFare(c)) return <div className="text-gray-500">{t('parkFareUnknown')}</div>
  const others = [
    c.first_hour_rm !== null && `${rm(c.first_hour_rm)} ${t('parkFirstHour')}`,
    c.next_hour_rm !== null && `${rm(c.next_hour_rm)} ${t('parkNextHour')}`,
    c.daily_max_rm !== null && t('parkMaxDay').replace('{rm}', rm(c.daily_max_rm)),
  ].filter(Boolean)
  return (
    <div className="space-y-0.5">
      {c.train_user_rate_rm !== null && (
        <div>
          <span className="font-semibold text-gray-900">{rm(c.train_user_rate_rm)}</span> {t('parkPerDay')}
          {c.park_ride && <span className="text-gray-500"> · {t('parkTrainUsers')}</span>}
        </div>
      )}
      {others.length > 0 && <div className="text-gray-600">{t('parkOthers')}: {others.join(', ')}</div>}
      {c.monthly_train_user_rm !== null && (
        <div className="text-gray-600">{t('parkMonthly')} ({t('parkTrainUsers')}): {rm(c.monthly_train_user_rm)}</div>
      )}
      {c.monthly_other_rm !== null && <div className="text-gray-600">{t('parkMonthly')}: {rm(c.monthly_other_rm)}</div>}
    </div>
  )
}

const RAIL_FEEDS = new Set(['rapid-rail-kl', 'ktmb', 'erl'])

// Trip plan: parking at the station where the first train is boarded, on its own line under the trip. Not added to
// the trip fare (owner decision 25 Oct 2026).
export function TripParking({ legs }: { legs: Leg[] }) {
  const { t } = useLanguage()
  const all = useCarParks()
  const ride = legs.find((l) => l.mode === 'transit')
  const board = ride?.stops?.[0]
  const key = ride && RAIL_FEEDS.has(ride.feed_id ?? '') ? parkingStationKey(ride.feed_id, board?.stop_id) : undefined
  if (!key || !board || !all || all === 'error') return null
  const list = carParksAt(all, key)
  if (!list.length) return null
  const pr = parkAndRide(list)
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm">
      <ParkingSign size={20} />
      <div className="min-w-0">
        <div className="font-semibold text-gray-900">{t('parkDriving').replace('{station}', board.name)}</div>
        {pr ? (
          <div className="text-gray-700">
            {t('parkRide')}: <span className="font-semibold">{rm(pr.train_user_rate_rm!)}</span> {t('parkPerDay')} ({t('parkTrainUsers')})
          </div>
        ) : (
          <div className="text-gray-500">{t('parkNearbyNoFare')}</div>
        )}
        <div className="text-xs text-gray-500">{t('parkNotInFare')}</div>
      </div>
    </div>
  )
}

// Car parks of one station: operator Park & Ride first, then up to three mapped car parks nearby
function ParkingInfo({ stationKey }: { stationKey: string }) {
  const { t } = useLanguage()
  const all = useCarParks()
  if (all === null) return <div className="text-xs text-gray-500 py-2">{t('loading')}</div>
  if (all === 'error') return <div className="text-xs text-gray-500 py-2">{t('parkLoadError')}</div>
  const list = carParksAt(all, stationKey)
  if (!list.length) return <div className="text-xs text-gray-500 py-2">{t('parkNone')}</div>
  const shown = [...list.filter((c) => c.source === 'operator'), ...list.filter((c) => c.source === 'osm').slice(0, 3)]
  const osm = shown.some((c) => c.source === 'osm')
  return (
    <div className="py-2 space-y-2 text-xs">
      <ul className="space-y-2">
        {shown.map((c) => (
          <li key={c.id} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="flex items-start gap-2">
              <ParkingSign size={16} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-semibold text-gray-900">
                    {carParkName(c.carpark_name, t)}
                  </span>
                  {c.park_ride && (
                    <span className="rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] text-[10px] font-semibold px-1.5 py-0.5">{t('parkRide')}</span>
                  )}
                </div>
                <div className="text-gray-500">
                  {[c.operator, c.distance_m !== null && t('parkAway').replace('{n}', String(c.distance_m)),
                    c.capacity_car !== null && t('parkBays').replace('{n}', String(c.capacity_car))].filter(Boolean).join(' · ')}
                </div>
                <div className="mt-1">
                  <CarParkFares c={c} />
                </div>
                <div className="mt-1 text-[11px] text-gray-400">
                  {t('parkChecked').replace('{date}', c.checked_date)} ·{' '}
                  <a href={c.source_url.split(' ; ').find((u) => u.startsWith('http'))} target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
                    {t('parkSource')}
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {osm && <p className="text-[11px] text-gray-400">{t('parkOsmCredit')}</p>}
    </div>
  )
}

export default ParkingInfo
