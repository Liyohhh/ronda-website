import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import LineBadge from './LineBadge'
import { busLine, lineForRoute, type Line } from '../data/lines'
import { formatDuration } from '../i18n/duration'
import { malaysiaNow, format12h } from '../data/time'
import DepartPicker from './DepartPicker'
import WalkIcon from './WalkIcon'
import PlaceField from './PlaceField'
import type { Pick } from '../data/suggestions'
import Icon from './Icon'

export type Place = { name: string; lat: number; lon: number }

export type Fare = { amount: number; currency?: string; exact: boolean; basis?: 'od' | 'flat' | 'zone' | 'zone_min' | 'joined'; joined_rides?: number }
// One ride's fare; amount null = no fare for this payment (Rapid KL buses are cashless only), `note` says why
export type LegFare = Omit<Fare, 'amount' | 'basis'> & { amount: number | null; basis?: Fare['basis'] | 'unknown'; note?: string }

// Whose fares to show: Malaysians ride GoKL / Smart Selangor free, tourists pay
export type Resident = 'citizen' | 'non_citizen'

// How the rider pays: Rapid KL cash / token fares are higher than cashless (Touch 'n Go, card)
export type Payment = 'cashless' | 'cash'

// Departure time picked by the rider (Malaysia time); null = leave now
export type DepartAt = { date: string; time: string } | null

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
  fare?: LegFare | null
  fare_included?: boolean // covered by the previous ride's fare (line change inside the paid area)
  headsign?: string | null
  num_stops?: number
  stops?: Stop[]
  // 'headway' = the line runs every few minutes with no timetable (Rapid KL): times are estimates
  timing?: 'scheduled' | 'headway'
  headway_min?: number | null
  wait_min?: number
  next_departures?: string[] | { every_min: number; until: string }
  board?: Platform
  alight?: Platform
  enter_at?: Entrance | null // first walk: the station entrance to use
  exit_at?: Entrance | null  // last walk: the station exit to use
  transfer?: { kind: string | null; instructions: string | null; paid_area: boolean | null } // walk between two rides
}

// Platform / level: null when we have no data (never guessed)
export type Platform = { station: string; stop_id: string; platform_code: string | null; level_name: string | null }
export type Entrance = { ref: string | null; name: string | null; wheelchair: boolean | null; level_name: string | null }
export type OtherLine = { feed_id: string; route_id: string; name: string | null; route_short_name: string | null; colour: string | null }
export type Stop = { name: string; stop_id?: string; time: string; estimated?: boolean; is_interchange?: boolean; other_lines?: OtherLine[] }

export type Tag = 'fastest' | 'fewest_changes' | 'least_walking' | 'cheapest' | 'no_exit' | 'uses_airport_rail'

export type TripOption = {
  departure: string
  arrival: string
  duration_min: number
  duration_range_min?: [number, number] | null // best (no waiting) .. worst (a full headway at every boarding)
  transfers: number
  walk_min: number
  fare?: Fare | null
  hops: string[]
  tags?: Tag[]
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
  moreOptions?: TripOption[] // slower or less direct alternatives, collapsed
  notice?: ServiceNotice
  resident: Resident
  onResidentChange: (r: Resident) => void
  payment: Payment
  onPaymentChange: (p: Payment) => void
  departAt: DepartAt
  onDepartChange: (d: DepartAt) => void
  onPlacesChange: (p: { from?: Pick; to?: Pick }) => void // edit From / To and re-plan
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

// Full label: the line name ("MRT Kajang Line"), or the bus route number ("T789")
function legLabel(leg: Leg) {
  if (isBus(leg)) return leg.route_short_name || leg.hop || 'Bus'
  return leg.hop || leg.route_short_name || ''
}

// Label for the route preview: the station you get on at for rail ("MRT Maluri"), the route number for buses ("400")
function legShort(leg: Leg) {
  if (isBus(leg)) return leg.route_short_name ?? 'Bus'
  return leg.from.name
}

// Secondary label in the steps: the branch for rail when it's a real name (buses show their destination instead)
function legSubLabel(leg: Leg) {
  const sub = isBus(leg) ? null : leg.route_short_name?.includes(' ') ? leg.route_short_name : null
  return sub && sub !== legLabel(leg) ? sub : null
}

function formatDistance(m?: number) {
  if (!m) return ''
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`
}

const money = (n: number) => `RM ${n.toFixed(2)}`

const hasHeadway = (o: TripOption) => o.legs.some((l) => l.timing === 'headway')

// "Platform 1 · Level 2", only the parts we know
function platformText(p: Platform | undefined, t: (k: TranslationKey) => string) {
  if (!p) return ''
  return [p.platform_code ? t('platformN').replace('{p}', p.platform_code) : '', p.level_name ?? ''].filter(Boolean).join(' · ')
}

const TAG_LABEL: Record<Tag, TranslationKey> = {
  fastest: 'tagFastest',
  fewest_changes: 'tagFewestChanges',
  least_walking: 'tagLeastWalking',
  cheapest: 'tagCheapest',
  no_exit: 'tagNoExit',
  uses_airport_rail: 'tagAirportRail',
}

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
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
        <WalkIcon size={16} />
        {formatDuration(option.duration_min, t)}
      </span>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {rides.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <Icon name="chevronRight" size={14} className="rtl:rotate-180" />
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

// "52 min": trip time, counting a full wait for "every N min" lines
function Duration({ option, className }: { option: TripOption; className: string }) {
  const { t } = useLanguage()
  return <span className={className}>{formatDuration(option.duration_min, t)}</span>
}

// The one thing this route is best at, shown next to its time: Fastest, else Easiest (least walking),
// else Fewest changes, else Cheapest
function Highlight({ tags }: { tags?: Tag[] }) {
  const { t } = useLanguage()
  const has = (x: Tag) => tags?.includes(x)
  const pick: [TranslationKey, string] | null = has('fastest')
    ? ['tagFastest', 'bg-[#002472] text-white']
    : has('least_walking')
      ? ['hlEasiest', 'bg-emerald-600 text-white']
      : has('fewest_changes')
        ? ['tagFewestChanges', 'bg-[#C9A45C] text-white']
        : has('cheapest')
          ? ['tagCheapest', 'bg-[#C9A45C] text-white']
          : null
  if (!pick) return null
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pick[1]}`}>{t(pick[0])}</span>
}

function Tags({ tags }: { tags?: Tag[] }) {
  const { t } = useLanguage()
  if (!tags?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            tag === 'uses_airport_rail' ? 'bg-amber-50 text-amber-800' : tag === 'no_exit' ? 'bg-emerald-50 text-emerald-800' : 'bg-[#002472]/8 text-[#002472]'
          }`}
        >
          {t(TAG_LABEL[tag])}
        </span>
      ))}
    </div>
  )
}

// Material Icons "accessible" (Apache 2.0), same set as the app
function WheelchairIcon({ label }: { label: string }) {
  return (
    <Icon name="accessible" size={16} className="inline-block text-[#002472]" label={label} />
  )
}

// "Enter at D ♿" / "Exit at A"
function EntranceLine({ entrance, kind }: { entrance: Entrance; kind: 'enter' | 'exit' }) {
  const { t } = useLanguage()
  const text = entrance.ref
    ? t(kind === 'enter' ? 'enterAt' : 'exitAt').replace('{ref}', entrance.ref)
    : t(kind === 'enter' ? 'enterStation' : 'exitStation')
  return (
    <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#002472]/5 px-2 py-1 text-sm font-medium text-[#002472]">
      {text}
      {entrance.wheelchair && <WheelchairIcon label={t('stepFree')} />}
    </div>
  )
}

// A walk: to the first station (and which entrance), a change between rides, or out to the destination
function WalkStep({ leg, next, placeName }: { leg: Leg; next?: Leg; placeName: (p: Place) => string }) {
  const { t } = useLanguage()
  const meta = `${leg.start} · ${t('walkDur').replace('{dur}', formatDuration(leg.duration_min, t))}${leg.distance_m ? ` · ${formatDistance(leg.distance_m)}` : ''}`
  if (leg.transfer && next?.mode === 'transit') {
    return (
      <>
        <div className="font-medium text-gray-900">{t('changeTo').replace('{line}', legLabel(next))}</div>
        <div className="text-sm text-gray-500">
          {t('walkDur').replace('{dur}', formatDuration(leg.duration_min, t))}
                  </div>
      </>
    )
  }
  return (
    <>
      {leg.exit_at && <EntranceLine entrance={leg.exit_at} kind="exit" />}
      <div className={`font-medium text-gray-900 ${leg.exit_at ? 'mt-1' : ''}`}>
        {t('walkTo')} {placeName(leg.to)}
      </div>
      <div className="text-sm text-gray-500">{meta}</div>
      {leg.enter_at && <EntranceLine entrance={leg.enter_at} kind="enter" />}
    </>
  )
}

// A station on the ride's line. `stop` = where you get on / off (big ring), otherwise a stop you pass (small dot).
function LineMarker({ color, stop }: { color: string; stop: boolean }) {
  return stop ? (
    <span className="absolute top-1/2 -translate-y-1/2 -start-[44px] z-10 w-4 h-4 rounded-full bg-white border-[3px]" style={{ borderColor: color }} aria-hidden="true" />
  ) : (
    <span className="absolute top-1/2 -translate-y-1/2 -start-[40px] z-10 w-2 h-2 rounded-full" style={{ backgroundColor: color, opacity: 0.55 }} aria-hidden="true" />
  )
}

// One ride: boarding station + platform, departure(s), the stops passed (collapsed), alighting station
function RideStep({ leg, placeName }: { leg: Leg; placeName: (p: Place) => string }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const boardAt = platformText(leg.board, t), alightAt = platformText(leg.alight, t)
  const between = (leg.stops ?? []).slice(1, -1)
  const nd = leg.next_departures
  const n = leg.num_stops ?? 0
  const color = legLine(leg).color
  const bus = isBus(leg)
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {bus ? (
          <>
            {/* bus: "(T305) Sk Ampang Campuran", the route number and where it's going */}
            <span className="rounded-md bg-gray-800 px-2 py-0.5 text-sm font-bold text-white tabular-nums">{legLabel(leg)}</span>
            {leg.headsign && <span className="min-w-0 truncate font-semibold text-gray-900">{leg.headsign}</span>}
          </>
        ) : (
          // rail: the station to get on at ("MRT Tun Razak Exchange"); the badge already says which line
          <span className="text-base font-semibold text-gray-900">{placeName(leg.from)}</span>
        )}
        {legSubLabel(leg) && <span className="text-xs text-gray-500">{legSubLabel(leg)}</span>}
        {leg.fare && leg.fare.amount === null && (
          <span className="ms-auto text-xs text-gray-500" title={leg.fare.note}>
            {t('fareUnknown')}
          </span>
        )}
        {leg.fare && leg.fare.amount !== null && (
          <span className="ms-auto text-sm font-medium text-gray-700">
            {!leg.fare.exact && <span className="text-xs font-normal text-gray-500 me-1">{t('fareFrom')}</span>}
            {money(leg.fare.amount)}
          </span>
        )}
        {leg.fare_included && <span className="ms-auto text-xs text-gray-500">{t('fareIncluded')}</span>}
      </div>

      {/* bus: the stop to get on at (rail shows it in the title) */}
      {bus && (
        <div className="relative mt-1.5 text-base font-semibold text-gray-900">
          <LineMarker color={color} stop />
          {placeName(leg.from)}
        </div>
      )}
      {boardAt && <div className="text-sm text-gray-700">{boardAt}</div>}
      {leg.headsign && !bus && (
        <div className="text-sm text-gray-500">
          {t('towards')} {leg.headsign}
        </div>
      )}

      {/* departure: estimate + frequency, or the timetable */}
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
        {leg.timing === 'headway' ? (
          <span className="font-semibold text-gray-900">
            {leg.start}
            {nd && !Array.isArray(nd) && <span className="font-normal text-gray-500"> · {t('everyMin').replace('{n}', String(nd.every_min))}</span>}
          </span>
        ) : (
          <>
            <span className="font-semibold text-gray-900">{leg.start}</span>
            {Array.isArray(nd) && nd.length > 1 && (
              <>
                <span className="text-gray-400">{t('nextLabel')}</span>
                {nd.slice(1, 3).map((d) => (
                  <span key={d} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {d}
                  </span>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* stops passed */}
      {n > 0 && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="mt-2 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#002472]"
        >
          <Icon name="chevronRight" size={14} className={`transition-transform ${open ? 'rotate-90' : 'rtl:rotate-180'}`} />
          {(n === 1 ? t('rideOneStop') : t('rideStops').replace('{n}', String(n))).replace('{dur}', formatDuration(leg.duration_min, t))}
        </button>
      )}
      {open && between.length > 0 && (
        <ol className="mt-1 space-y-1">
          {between.map((s, i) => (
            <li key={`${s.stop_id ?? s.name}-${i}`} className="relative flex items-center gap-2 text-xs text-gray-500">
              {/* stops you ride through: small dots, grey text */}
              <LineMarker color={color} stop={false} />
              <span className="w-10 flex-shrink-0 tabular-nums text-gray-400">{s.time}</span>
              <span className="min-w-0 truncate">{s.name}</span>
              {s.is_interchange && s.other_lines?.length ? (
                <span className="inline-flex items-center gap-0.5" title={`${t('interchangeWith')} ${s.other_lines.map((l) => l.name ?? l.route_short_name).join(', ')}`}>
                  {s.other_lines.map((l) => (
                    <LineBadge key={`${l.feed_id}-${l.route_id}`} line={lineForRoute(l.feed_id, l.route_id) ?? busLine(l.colour, l.name ?? l.route_short_name ?? '')} size={16} />
                  ))}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      {/* alighting: a big ring on the line */}
      <div className="relative mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <LineMarker color={color} stop />
        <span className="text-sm font-semibold text-gray-900 tabular-nums">{leg.end}</span>
        <span className="text-base font-semibold text-gray-900">{placeName(leg.to)}</span>
      </div>
      {alightAt && <div className="text-sm text-gray-700">{alightAt}</div>}
    </>
  )
}

// ---------- panel ----------

function JourneyPanel({ open, from, to, loading, error, options, moreOptions = [], notice, resident, onResidentChange, payment, onPaymentChange, departAt, onDepartChange, onPlacesChange, onClose }: Props) {
  const { t, lang } = useLanguage()
  const [sort, setSort] = useState<SortKey>('fastest')
  const [detail, setDetail] = useState<TripOption | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => departAt ?? malaysiaNow())
  const openEditor = () => {
    setDraft(departAt ?? malaysiaNow())
    setEditing(true)
  }
  // "today, 6:30 PM" / "Tue 30 Sep, 7:15 AM"
  const departLabel = (d: NonNullable<DepartAt>) => {
    const day = d.date === malaysiaNow().date
      ? t('todayLabel')
      : new Date(d.date + 'T00:00:00Z').toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    return `${day}, ${format12h(d.time)}`
  }

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
  const sortedMore = useMemo(() => sortOptions(moreOptions, sort), [moreOptions, sort])
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

  // One route choice in the list
  const card = (o: TripOption, i: number) => {
    const firstRide = o.legs.find((l) => l.mode === 'transit')
    return (
      <li key={`${o.departure}-${o.arrival}-${o.hops.join()}-${i}`}>
        <button
          onClick={() => setDetail(o)}
          className="w-full text-start bg-white rounded-2xl border border-gray-200 p-4 hover:border-[#002472]/50 hover:shadow-md transition"
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {/* what this route is best for, instead of the clock times */}
              <Duration option={o} className="text-xl font-bold text-gray-900" />
              <Highlight tags={o.tags} />
              <div className="basis-full">
                <Tags tags={o.tags} />
              </div>
              {o.next_day && (
                <span className="ms-2 align-middle inline-block rounded-full bg-[#002472]/10 text-[#002472] text-[11px] font-semibold px-2 py-0.5">
                  {t('tomorrow')}
                </span>
              )}
            </div>
            <div className="text-base font-semibold whitespace-nowrap flex-shrink-0">
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
                <Icon name="chevronLeft" size={18} className="rtl:rotate-180" />
                {t('allRoutes')}
              </button>
            ) : (
              <span className="text-xs uppercase tracking-wider text-white/60">{t('yourJourney')}</span>
            )}
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <Icon name="close" size={18} />
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
              <PlaceField id="panel-from" label={t('fromLabel')} value={from} onPick={(p) => onPlacesChange({ from: p })} />
              <PlaceField id="panel-to" label={t('toLabel')} value={to} onPick={(p) => onPlacesChange({ to: p })} />
            </div>
          </div>

          {/* Leaving now, or a date and time the rider picks */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/80">
            <Icon name="scheduleOutline" size={16} />
            <span>{departAt ? t('leavingAt').replace('{when}', departLabel(departAt)) : t('leavingNow')}</span>
            <button
              type="button"
              onClick={() => (editing ? setEditing(false) : openEditor())}
              aria-expanded={editing}
              className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-0.5 text-xs font-semibold text-white"
            >
              {t('changeTime')}
            </button>
          </div>
          {editing && (
            <DepartPicker
              value={draft}
              onChange={(v) => onDepartChange(v)}
              onLeaveNow={
                departAt
                  ? () => {
                      setEditing(false)
                      onDepartChange(null)
                    }
                  : undefined
              }
            />
          )}

          {/* Fares: for Malaysians or tourists (some buses are free for Malaysians only), paid cashless or cash */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2" role="group" aria-label={t('faresFor')}>
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
            <div className="flex items-center gap-2" role="group" aria-label={t('payWith')}>
              <span className="text-white/60">{t('payWith')}</span>
              <div className="inline-flex rounded-full bg-white/10 p-0.5">
                {(['cashless', 'cash'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => p !== payment && onPaymentChange(p)}
                    aria-pressed={p === payment}
                    title={p === 'cashless' ? t('payCashlessHint') : undefined}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      p === payment ? 'bg-white text-[#002472]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {p === 'cashless' ? t('payCashless') : t('payCash')}
                  </button>
                ))}
              </div>
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
                  <Icon name="darkModeOutline" size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{t(notice.kind === 'tomorrow' ? 'noServiceTonight' : 'serviceResumes').replace('{time}', notice.time)}</span>
                </li>
              )}
              {sorted.map(card)}
              {sortedMore.length > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    aria-expanded={showMore}
                    className="w-full rounded-2xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-[#002472]/50 hover:text-[#002472]"
                  >
                    {showMore ? t('hideMoreOptions') : t('moreOptions').replace('{n}', String(sortedMore.length))}
                  </button>
                </li>
              )}
              {showMore && sortedMore.map(card)}
              {anyFare && <li className="px-1 text-[11px] text-gray-400">{t('fareNote')}</li>}
            </ul>
          )}

          {/* Steps for one choice */}
          {!loading && !error && detail && (
            <div className="p-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Duration option={detail} className="text-2xl font-bold text-gray-900" />
                    <Highlight tags={detail.tags} />
                    <div className="basis-full">
                      <Tags tags={detail.tags} />
                    </div>
                    {detail.next_day && (
                      <span className="ms-2 align-middle inline-block rounded-full bg-[#002472]/10 text-[#002472] text-[11px] font-semibold px-2 py-0.5">
                        {t('tomorrow')}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold whitespace-nowrap flex-shrink-0">
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
                      {/* connector: from this icon's centre to the next one's, drawn under the icons;
                          a last ride still runs down to the station where you get off */}
                      {(!last || line) && (
                        <span
                          className={`absolute start-5 top-5 -translate-x-1/2 rtl:translate-x-1/2 ${last ? 'bottom-3' : '-bottom-5'} ${line ? 'w-1' : 'w-0.5'}`}
                          style={{
                            backgroundColor: line ? line.color : undefined,
                            backgroundImage:
                              leg.mode === 'walk' ? 'repeating-linear-gradient(to bottom, #cbd5e1 0 4px, transparent 4px 8px)' : undefined,
                          }}
                        />
                      )}

                      {line ? (
                        <LineBadge line={line} size={40} decorative className="relative z-10 flex-shrink-0" />
                      ) : (
                        <span className="relative z-10 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                          <WalkIcon size={22} />
                        </span>
                      )}

                      <div className="flex-1 min-w-0 pt-1">
                        {leg.mode !== 'transit' ? (
                          <WalkStep leg={leg} next={detail.legs[i + 1]} placeName={placeName} />
                        ) : (
                          <RideStep leg={leg} placeName={placeName} />
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>

              <p className="text-xs text-gray-400 mt-6 italic">{t(hasHeadway(detail) ? 'headwayNote' : 'estimatesNote')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JourneyPanel
