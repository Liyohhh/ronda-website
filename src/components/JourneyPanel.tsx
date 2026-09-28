import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import LineBadge from './LineBadge'
import { busLine, lineForRoute, type Line } from '../data/lines'
import { formatDuration } from '../i18n/duration'

export type Place = { name: string; lat: number; lon: number }

export type Fare = { amount: number; currency?: string; exact: boolean; basis?: 'od' | 'flat' | 'zone_min' | 'joined'; joined_rides?: number }

// Whose fares to show: Malaysians ride GoKL / Smart Selangor free, tourists pay
export type Resident = 'citizen' | 'non_citizen'

export type Leg = {
  mode: 'walk' | 'transit'
  from: Place
  to: Place
  start: string
  end: string
  duration_min: number
  distance_m?: number
  hop?: string | null
  route_short_name?: string | null
  route_long_name?: string | null
  route_type?: number | null
  colour?: string | null
  feed_id?: string
  route_id?: string
  fare?: Fare | null
  fare_included?: boolean // covered by the previous ride's fare (line change inside the paid area)
  headsign?: string | null
  num_stops?: number
  stops?: { name: string; time: string }[]
}

export type TripOption = {
  departure: string
  arrival: string
  duration_min: number
  transfers: number
  walk_min: number
  fare?: Fare | null
  hops: string[]
  legs: Leg[]
  next_day?: boolean   // tomorrow's first services, shown when nothing runs tonight
}

// No trains / buses right now: 'tomorrow' = last one has gone, 'resumes' = early morning before the first one
export type ServiceNotice = { kind: 'tomorrow' | 'resumes'; time: string } | null

type Props = {
  open: boolean
  from: string
  to: string
  loading: boolean
  error: string
  options: TripOption[]
  notice?: ServiceNotice
  resident: Resident
  onResidentChange: (r: Resident) => void
  onClose: () => void
}

type SortKey = 'fastest' | 'priceLow' | 'priceHigh' | 'transfers' | 'walking'

const GOLD = '#C9A45C'

// ---------- helpers ----------

const isBus = (leg: Leg) => leg.route_type === 3

// Badge artwork for a ride: the rail line's official badge, or a bus badge in the route's GTFS colour
function legLine(leg: Leg): Line {
  const line = leg.feed_id && leg.route_id ? lineForRoute(leg.feed_id, leg.route_id) : undefined
  if (line) return line
  return busLine(isBus(leg) ? leg.colour : null, legLabel(leg))
}

// Full label: the line name ("MRT Kajang Line"), or "BUS" + number ("BUS T789")
function legLabel(leg: Leg) {
  if (isBus(leg)) return leg.route_short_name ? `BUS ${leg.route_short_name}` : leg.hop ?? 'BUS'
  return leg.hop || leg.route_short_name || ''
}

// Short label for the route preview: "Kajang", "Ampang", "400", "KLIA Transit"
function legShort(leg: Leg) {
  if (isBus(leg)) return leg.route_short_name ?? 'BUS'
  const line = leg.feed_id && leg.route_id ? lineForRoute(leg.feed_id, leg.route_id) : undefined
  const name = line?.name ?? leg.hop ?? leg.route_short_name ?? ''
  return name.replace(/^(MRT|LRT|KTM|ERL|BRT|KL)\s+/, '').replace(/\s+Line$/, '') || name
}

// Secondary label in the steps: the network for buses; the branch for rail when it's a real name
function legSubLabel(leg: Leg) {
  const sub = isBus(leg) ? leg.hop : leg.route_short_name?.includes(' ') ? leg.route_short_name : null
  return sub && sub !== legLabel(leg) ? sub : null
}

function formatDistance(m?: number) {
  if (!m) return ''
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`
}

const money = (n: number) => `RM ${n.toFixed(2)}`

// Unknown fares sort last, whatever the direction
function sortOptions(list: TripOption[], key: SortKey) {
  const arrive = (o: TripOption) => o.arrival
  const price = (o: TripOption) => o.fare?.amount
  return [...list].sort((a, b) => {
    const day = Number(!!a.next_day) - Number(!!b.next_day)
    if (day) return day
    switch (key) {
      case 'priceLow':
      case 'priceHigh': {
        const pa = price(a), pb = price(b)
        if (pa == null || pb == null) return pa == null ? (pb == null ? 0 : 1) : -1
        return key === 'priceLow' ? pa - pb : pb - pa
      }
      case 'transfers':
        return a.transfers - b.transfers || a.duration_min - b.duration_min
      case 'walking':
        return a.walk_min - b.walk_min || a.duration_min - b.duration_min
      default:
        return arrive(a).localeCompare(arrive(b)) || a.duration_min - b.duration_min
    }
  })
}

// ---------- small pieces ----------

function FareText({ fare, t }: { fare?: Fare | null; t: (k: TranslationKey) => string }) {
  if (!fare) return <span className="text-gray-400">{t('fareUnknown')}</span>
  if (fare.amount === 0 && fare.exact) return <span className="text-emerald-700">{t('fareFree')}</span>
  return (
    <span className="text-gray-900">
      {!fare.exact && <span className="text-xs font-normal text-gray-500 me-1">{t('fareFrom')}</span>}
      {money(fare.amount)}
    </span>
  )
}

// "(badge) Kajang › (badge) 400"
function RoutePreview({ option }: { option: TripOption }) {
  const { t } = useLanguage()
  const rides = option.legs.filter((l) => l.mode === 'transit')
  if (!rides.length) {
    return <span className="text-sm text-gray-600">🚶 {formatDuration(option.duration_min, t)}</span>
  }
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {rides.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
              <path d="M9 6l6 6-6 6" />
            </svg>
          )}
          <span className="inline-flex items-center gap-1">
            <LineBadge line={legLine(l)} size={22} decorative />
            <span className="text-sm font-medium text-gray-800">{legShort(l)}</span>
          </span>
        </Fragment>
      ))}
    </div>
  )
}

// ---------- panel ----------

function JourneyPanel({ open, from, to, loading, error, options, notice, resident, onResidentChange, onClose }: Props) {
  const { t } = useLanguage()
  const [sort, setSort] = useState<SortKey>('fastest')
  const [detail, setDetail] = useState<TripOption | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (detail) setDetail(null)
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, detail])

  const sorted = useMemo(() => sortOptions(options, sort), [options, sort])
  const anyFare = options.some((o) => o.fare)

  if (!open) return null

  // The planner names the ends "Start" / "Destination"; show the picked names instead
  const placeName = (p: Place) => (p.name === 'Start' ? from : p.name === 'Destination' ? to : p.name)

  const pills: { key: SortKey; label: string }[] = [
    { key: 'fastest', label: t('sortFastest') },
    { key: sort === 'priceHigh' ? 'priceHigh' : 'priceLow', label: sort === 'priceHigh' ? t('sortPriceHigh') : t('sortPriceLow') },
    { key: 'transfers', label: t('sortFewestTransfers') },
    { key: 'walking', label: t('sortLeastWalking') },
  ]
  const onPill = (key: SortKey) => {
    // tapping the price pill again flips low <-> high
    if ((key === 'priceLow' || key === 'priceHigh') && (sort === 'priceLow' || sort === 'priceHigh')) {
      setSort(sort === 'priceLow' ? 'priceHigh' : 'priceLow')
    } else setSort(key)
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t('yourJourney')}>
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-[#001233]/30 backdrop-blur-[2px] transition-opacity duration-200 starting:opacity-0" />

      {/* Side panel on desktop, bottom sheet on mobile */}
      <div
        className={`absolute bg-gray-50 shadow-2xl flex flex-col transition-all duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl overflow-hidden starting:translate-y-full
          md:inset-x-auto md:inset-y-0 md:end-0 md:w-[460px] md:max-h-none md:rounded-none
          md:starting:translate-y-0 md:starting:translate-x-full rtl:md:starting:-translate-x-full`}
      >
        {/* From / to */}
        <div className="bg-[#002472] text-white px-5 pt-5 pb-5 md:pt-6">
          <div className="flex items-center justify-between mb-4">
            {detail ? (
              <button onClick={() => setDetail(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
                {t('allRoutes')}
              </button>
            ) : (
              <span className="text-xs uppercase tracking-wider text-white/60">{t('yourJourney')}</span>
            )}
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="flex gap-3">
            {/* origin ring, dotted line, destination dot */}
            <div className="flex flex-col items-center pt-3.5 pb-3.5" aria-hidden="true">
              <span className="w-3 h-3 rounded-full border-2 border-white/80" />
              <span className="flex-1 w-0 border-s-2 border-dotted border-white/40 my-1" />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GOLD }} />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <div className="text-[11px] text-white/60">{t('fromLabel')}</div>
                <div className="font-semibold truncate">{from}</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <div className="text-[11px] text-white/60">{t('toLabel')}</div>
                <div className="font-semibold truncate">{to}</div>
              </div>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/80">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {t('leavingNow')}
          </div>

          {/* Fares for Malaysians or tourists (some buses are free for Malaysians only) */}
          <div className="mt-3 flex items-center gap-2 text-sm" role="group" aria-label={t('faresFor')}>
            <span className="text-white/60">{t('faresFor')}</span>
            <div className="inline-flex rounded-full bg-white/10 p-0.5">
              {(['citizen', 'non_citizen'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => r !== resident && onResidentChange(r)}
                  aria-pressed={r === resident}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    r === resident ? 'bg-white text-[#002472]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {r === 'citizen' ? t('fareMalaysian') : t('fareTourist')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort pills (route list only) */}
        {!detail && !loading && !error && options.length > 0 && (
          <div className="bg-white border-b border-gray-200" role="group" aria-label={t('sortBy')}>
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] px-5 py-3">
              {pills.map((p) => {
                const active = p.key === sort || ((p.key === 'priceLow' || p.key === 'priceHigh') && (sort === 'priceLow' || sort === 'priceHigh'))
                const disabled = (p.key === 'priceLow' || p.key === 'priceHigh') && !anyFare
                return (
                  <button
                    key={p.key}
                    onClick={() => onPill(p.key)}
                    disabled={disabled}
                    aria-pressed={active}
                    className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap border transition-colors disabled:opacity-40 ${
                      active ? 'bg-[#002472] border-[#002472] text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-[#002472]/50'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-sm gap-3">
              <div className="w-8 h-8 border-2 border-[#002472]/20 border-t-[#002472] rounded-full animate-spin" />
              {t('findingRoutes')}
            </div>
          )}

          {!loading && error && <div className="m-5 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

          {/* Route choices */}
          {!loading && !error && !detail && options.length > 0 && (
            <ul className="p-4 space-y-3">
              {notice && (
                <li className="flex gap-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl px-4 py-3" role="status">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 mt-0.5">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                  </svg>
                  <span>{t(notice.kind === 'tomorrow' ? 'noServiceTonight' : 'serviceResumes').replace('{time}', notice.time)}</span>
                </li>
              )}
              {sorted.map((o, i) => {
                const firstRide = o.legs.find((l) => l.mode === 'transit')
                return (
                  <li key={`${o.departure}-${o.arrival}-${i}`}>
                    <button
                      onClick={() => setDetail(o)}
                      className="w-full text-start bg-white rounded-2xl border border-gray-200 p-4 hover:border-[#002472]/50 hover:shadow-md transition"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <div>
                          <span className="text-xl font-bold text-gray-900">{formatDuration(o.duration_min, t)}</span>
                          <span className="ms-2 text-sm text-gray-500">
                            {o.departure} – {o.arrival}
                          </span>
                          {o.next_day && (
                            <span className="ms-2 align-middle inline-block rounded-full bg-[#002472]/10 text-[#002472] text-[11px] font-semibold px-2 py-0.5">
                              {t('tomorrow')}
                            </span>
                          )}
                        </div>
                        <div className="text-base font-semibold">
                          <FareText fare={o.fare} t={t} />
                        </div>
                      </div>

                      <div className="mt-3">
                        <RoutePreview option={o} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        {firstRide && (
                          <span className="text-gray-600">
                            {t('leavesFrom').replace('{time}', firstRide.start).replace('{place}', placeName(firstRide.from))}
                          </span>
                        )}
                        <span>{o.transfers === 0 ? t('direct') : `${t('transfers')}: ${o.transfers}`}</span>
                        <span>{t('walkDur').replace('{dur}', formatDuration(o.walk_min, t))}</span>
                      </div>
                    </button>
                  </li>
                )
              })}
              {anyFare && <li className="px-1 text-[11px] text-gray-400">{t('fareNote')}</li>}
            </ul>
          )}

          {/* Steps for one choice */}
          {!loading && !error && detail && (
            <div className="p-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{formatDuration(detail.duration_min, t)}</span>
                    <span className="ms-2 text-sm text-gray-500">
                      {detail.departure} – {detail.arrival}
                    </span>
                    {detail.next_day && (
                      <span className="ms-2 align-middle inline-block rounded-full bg-[#002472]/10 text-[#002472] text-[11px] font-semibold px-2 py-0.5">
                        {t('tomorrow')}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold">
                    <FareText fare={detail.fare} t={t} />
                  </div>
                </div>
                <div className="mt-3">
                  <RoutePreview option={detail} />
                </div>
              </div>

              <ol className="relative">
                {detail.legs.map((leg, i) => {
                  const last = i === detail.legs.length - 1
                  const line = leg.mode === 'transit' ? legLine(leg) : null
                  return (
                    <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                      {!last && (
                        <span
                          className="absolute start-5 top-11 bottom-0 w-0.5 -translate-x-1/2 rtl:translate-x-1/2"
                          style={{
                            backgroundColor: line ? line.color : undefined,
                            backgroundImage:
                              leg.mode === 'walk' ? 'repeating-linear-gradient(to bottom, #cbd5e1 0 4px, transparent 4px 8px)' : undefined,
                          }}
                        />
                      )}

                      {line ? (
                        <LineBadge line={line} size={40} decorative />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="4" r="2" />
                            <path d="M12 6v6l-3 8M12 12l3 8M9 10l-4 2" />
                          </svg>
                        </span>
                      )}

                      <div className="flex-1 min-w-0 pt-1">
                        {leg.mode !== 'transit' ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {t('walkTo')} {placeName(leg.to)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {leg.start} · {t('walkDur').replace('{dur}', formatDuration(leg.duration_min, t))}
                              {leg.distance_m ? ` · ${formatDistance(leg.distance_m)}` : ''}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="font-semibold text-gray-900">{legLabel(leg)}</span>
                              {legSubLabel(leg) && <span className="text-xs text-gray-500">{legSubLabel(leg)}</span>}
                              {leg.fare && (
                                <span className="ms-auto text-sm font-medium text-gray-700">
                                  {!leg.fare.exact && <span className="text-xs font-normal text-gray-500 me-1">{t('fareFrom')}</span>}
                                  {money(leg.fare.amount)}
                                </span>
                              )}
                              {leg.fare_included && <span className="ms-auto text-xs text-gray-500">{t('fareIncluded')}</span>}
                            </div>
                            {leg.headsign && (
                              <div className="text-sm text-gray-500">
                                {t('towards')} {leg.headsign}
                              </div>
                            )}
                            <div className="mt-1 text-sm text-gray-800">
                              {leg.start} {placeName(leg.from)} → {leg.end} {placeName(leg.to)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDuration(leg.duration_min, t)} · {leg.num_stops} {t('stopsLabel')}
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>

              <p className="text-xs text-gray-400 mt-6 italic">{t('estimatesNote')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JourneyPanel
