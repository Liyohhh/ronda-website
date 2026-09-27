import { useEffect, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'

export type Place = { name: string; lat: number; lon: number }

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
  colour?: string | null
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
  hops: string[]
  legs: Leg[]
}

type Props = {
  open: boolean
  from: string
  to: string
  loading: boolean
  error: string
  options: TripOption[]
  onClose: () => void
}

const NAVY = '#002472'

// GTFS colours come without "#" and can be null (e.g. ERL)
function lineColour(c?: string | null) {
  if (!c) return NAVY
  return c.startsWith('#') ? c : `#${c}`
}

// dark text on light line colours (e.g. MRT Putrajaya yellow), white text otherwise
function textOn(hex: string) {
  const h = hex.replace('#', '')
  if (h.length !== 6) return '#fff'
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#111827' : '#fff'
}

function JourneyPanel({ open, from, to, loading, error, options, onClose }: Props) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const option = options[Math.min(selected, options.length - 1)]
  // The planner names the ends "Start" / "Destination"; show the picked stop names instead
  const placeName = (p: Place) =>
    p.name === 'Start' ? from : p.name === 'Destination' ? to : p.name

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t('yourJourney')}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#002472]/20 backdrop-blur-[2px] transition-opacity duration-200 starting:opacity-0"
      />

      {/* Side panel: full height on the right (desktop), bottom sheet on mobile */}
      <div
        className={`absolute bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out
          inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl starting:translate-y-full
          md:inset-x-auto md:inset-y-0 md:end-0 md:w-[440px] md:max-h-none md:rounded-none
          md:starting:translate-y-0 md:starting:translate-x-full rtl:md:starting:-translate-x-full`}
      >
        {/* Header */}
        <div className="bg-[#002472] text-white px-6 pt-5 pb-6 rounded-t-3xl md:rounded-none md:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-white/60 uppercase tracking-wide">{t('yourJourney')}</div>
              <div className="mt-1 font-semibold leading-snug">
                <div className="truncate">{from}</div>
                <div className="text-white/50 text-sm">↓</div>
                <div className="truncate">{to}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {option && (
            <>
              <div className="mt-5">
                <div className="text-3xl font-bold">{option.duration_min} min</div>
                <div className="text-sm text-white/70">
                  {option.departure} – {option.arrival} · {t('transfers')}: {option.transfers}
                </div>
              </div>
              {/* Proportional segment bar */}
              <div className="mt-4 flex h-2 rounded-full overflow-hidden bg-white/10 gap-0.5">
                {option.legs.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      flexGrow: Math.max(l.duration_min, 1),
                      backgroundColor: l.mode === 'transit' ? lineColour(l.colour) : 'rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-sm gap-3">
              <div className="w-8 h-8 border-2 border-[#002472]/20 border-t-[#002472] rounded-full animate-spin" />
              {t('findingRoutes')}
            </div>
          )}

          {/* Planner error / no route */}
          {!loading && error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          {!loading && !error && option && (
            <>
              {/* Route options */}
              {options.length > 1 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('routeOptions')}</h3>
                  <div className="grid gap-2 mb-6">
                    {options.map((o, i) => (
                      <button
                        key={i}
                        onClick={() => setSelected(i)}
                        className={`text-start border rounded-xl p-3 transition ${
                          o === option
                            ? 'border-[#002472] ring-2 ring-[#002472]/20 bg-[#002472]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-baseline justify-between">
                          <div className="font-semibold text-gray-900">
                            {o.departure} → {o.arrival}
                          </div>
                          <div className="text-sm text-gray-600">{o.duration_min} min</div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {o.legs
                            .filter((l) => l.mode === 'transit')
                            .map((l, j) => {
                              const c = lineColour(l.colour)
                              return (
                                <span
                                  key={j}
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{ backgroundColor: c, color: textOn(c) }}
                                >
                                  {l.route_short_name || l.hop}
                                </span>
                              )
                            })}
                          {o.hops.length === 0 && <span className="text-xs text-gray-600">{t('walkTo')} {to}</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {t('transfers')}: {o.transfers} · {o.walk_min} {t('minWalk')}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step-by-step timeline for the selected option */}
              <ol className="relative">
                {option.legs.map((leg, i) => {
                  const last = i === option.legs.length - 1
                  const c = lineColour(leg.colour)
                  return (
                    <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                      {!last && (
                        <span
                          className="absolute start-5 top-10 bottom-0 w-0.5 -translate-x-1/2 rtl:translate-x-1/2"
                          style={{
                            backgroundColor: leg.mode === 'transit' ? c : undefined,
                            backgroundImage:
                              leg.mode === 'walk'
                                ? 'repeating-linear-gradient(to bottom, #cbd5e1 0 4px, transparent 4px 8px)'
                                : undefined,
                          }}
                        />
                      )}

                      {leg.mode === 'walk' ? (
                        <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="4" r="2" />
                            <path d="M12 6v6l-3 8M12 12l3 8M9 10l-4 2" />
                          </svg>
                        </span>
                      ) : (
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: c, color: textOn(c) }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                            <path d="M4 12h16" />
                          </svg>
                        </span>
                      )}

                      <div className="flex-1 min-w-0 pt-1">
                        {leg.mode === 'walk' ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {t('walkTo')} {placeName(leg.to)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {leg.start} · {leg.duration_min} {t('minWalk')}
                              {leg.distance_m ? ` · ${leg.distance_m} m` : ''}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="inline-block text-xs font-semibold px-2 py-0.5 rounded"
                                style={{ backgroundColor: c, color: textOn(c) }}
                              >
                                {leg.route_short_name || leg.hop}
                              </span>
                              {leg.hop && leg.hop !== leg.route_short_name && (
                                <span className="text-xs text-gray-500">{leg.hop}</span>
                              )}
                            </div>
                            {leg.headsign && (
                              <div className="text-sm text-gray-500 mt-1">
                                {t('towards')} {leg.headsign}
                              </div>
                            )}
                            <div className="mt-1 text-sm text-gray-800">
                              {leg.start} {placeName(leg.from)} → {leg.end} {placeName(leg.to)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {leg.duration_min} min · {leg.num_stops} {t('stopsLabel')}
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>

              <p className="text-xs text-gray-400 mt-6 italic">
                Times are from published timetables. Walking times are estimates.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default JourneyPanel
