import { useEffect, useRef, useState } from 'react'
import LineBadge from './LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import { LINES, LINES_BY_ID, type Line } from '../data/lines'
import { ECRL_SOURCES, ECRL_STATIONS } from '../data/ecrl'
import { supabase } from '../services/supabase'
import Icon from './Icon'
import BusStopName from './BusStopName'
import ParkingInfo, { ParkingSign } from './ParkingInfo'
import { parkingStationKey } from '../services/parking'
import { connectionsAt, loadStationIndex, stopKey } from '../services/stationConnections'

type Station = { seq: number; stop_id: string; name: string; lat: number; lon: number; code?: string | null }

// "MRT Kajang Line" -> "MRT Kajang" for the line strip
const shortName = (l: Line) => l.name.replace(/\s+Line$/, '')

// Right-side panel (bottom sheet on phones) with a line's stations in running order (public.line_stations).
// Same look as the journey panel; the strip under the header switches between lines.
function LinePanel({ line, onClose, onPlan, onPick }: { line: Line; onClose: () => void; onPlan: (s: Station) => void; onPick: (l: Line) => void }) {
  const { t } = useLanguage()
  const [result, setResult] = useState<{ id: string; stations: Station[]; error: boolean } | null>(null)
  const strip = useRef<HTMLDivElement>(null)

  const ecrl = line.mode === 'ECRL'
  useEffect(() => {
    if (ecrl) return // no feed yet: its stations come from src/data/ecrl.ts
    let cancelled = false
    supabase.rpc('line_stations', { p_feed: line.gtfs.feedId, p_routes: line.gtfs.routeIds }).then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('line_stations', error)
      setResult({ id: line.id, stations: (data as Station[] | null) ?? [], error: !!error })
    })
    return () => {
      cancelled = true
    }
  }, [line, ecrl])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // keep the picked line visible in the strip
  useEffect(() => {
    strip.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [line])

  const current = result?.id === line.id ? result : null
  const bus = line.mode === 'BUS'
  // car parks at a station (public.station_parking): the P button opens them under the station
  const [parkOpen, setParkOpen] = useState<string | null>(null)
  const parkKey = (s: Station) => (bus ? undefined : parkingStationKey(line.gtfs.feedId, s.stop_id))
  const last = (current?.stations.length ?? 0) - 1
  // where you can change to other lines (rail only): loaded once, then worked out per station
  const [index, setIndex] = useState<Awaited<ReturnType<typeof loadStationIndex>> | null>(null)
  useEffect(() => {
    if (bus) return
    let live = true
    loadStationIndex().then((x) => live && setIndex(x), () => {})
    return () => { live = false }
  }, [bus])

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={line.name}>
      <div onClick={onClose} className="absolute inset-0 bg-[#222D52]/30 backdrop-blur-[2px] transition-opacity duration-200 starting:opacity-0" />
      <div
        className={`absolute bg-gray-50 shadow-2xl flex flex-col transition-all duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl overflow-hidden starting:translate-y-full
          md:inset-x-auto md:inset-y-0 md:end-0 md:w-[460px] md:max-h-none md:rounded-none
          md:starting:translate-y-0 md:starting:translate-x-full rtl:md:starting:-translate-x-full`}
      >
        {/* Header in RONDA navy: the line's logo and name, then every line as a tab (the picked one underlined in its colour) */}
        <div className="bg-[#222D52] text-white">
          <div className="px-5 pt-5 pb-4 md:pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-white/60">{t('lines')}</span>
              <button onClick={onClose} aria-label={t('closeAria')} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3.5">
              {/* the line's square badge as it is (a white ring keeps dark badges visible on navy) */}
              <LineBadge line={line} size={44} decorative className="rounded-[6px] ring-2 ring-white/90" />
              <div className="min-w-0">
                <h2 className="text-xl font-bold leading-tight truncate">{line.name}</h2>
                <p className="mt-0.5 text-sm text-white/70">
                  {ecrl
                    ? t('lineStationCount').replace('{n}', String(ECRL_STATIONS.length))
                    : current && !current.error
                    ? bus
                      ? `${current.stations.length} ${t('stopsLabel')}`
                      : t('lineStationCount').replace('{n}', String(current.stations.length))
                    : ' '}
                </p>
              </div>
            </div>
          </div>

          {/* rail lines only; a bus route opens on its own */}
          <div ref={strip} hidden={bus} className="flex gap-1 overflow-x-auto [scrollbar-width:none] px-3 border-t border-white/10" role="group" aria-label={t('lines')}>
            {LINES.map((l) => {
              const active = l.id === line.id
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => !active && onPick(l)}
                  aria-pressed={active}
                  className={`px-2.5 pt-3 pb-2.5 inline-flex items-center gap-2 text-sm whitespace-nowrap border-b-[3px] transition-colors ${
                    active ? 'font-semibold text-white' : 'border-transparent font-medium text-white/60 hover:text-white'
                  }`}
                  style={active ? { borderColor: l.color } : undefined}
                >
                  <LineBadge line={l} size={22} decorative />
                  {shortName(l)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {ecrl && <EcrlStations line={line} />}
          {!ecrl && !current && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#222D52]/20 border-t-[#222D52] rounded-full animate-spin" aria-label={t('loading')} />
            </div>
          )}
          {!ecrl && current?.error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{t('lineLoadError')}</div>}
          {!ecrl && current && !current.error && (
            <ol className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              {current.stations.map((s, i) => {
                const end = i === 0 || i === last
                return (
                  <li key={`${s.stop_id}-${s.seq}`} className="relative flex items-center gap-3">
                    {/* the line in its own colour, one piece from the first station to the last */}
                    <span
                      className="absolute start-[11px] w-1 -translate-x-1/2 rtl:translate-x-1/2"
                      style={{ backgroundColor: line.color, top: i === 0 ? '50%' : 0, bottom: i === last ? '50%' : 0 }}
                      aria-hidden="true"
                    />
                    <span className="relative z-10 w-[22px] flex justify-center flex-shrink-0" aria-hidden="true">
                      {end ? (
                        <LineBadge line={line} size={22} decorative />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-white border-[3px]" style={{ borderColor: line.color }} />
                      )}
                    </span>
                    <div className={`flex-1 min-w-0 py-2.5 ${i < last ? 'border-b border-gray-100' : ''}`}>
                      <div className="flex items-center justify-between gap-3">
                        {/* the station name with its change badges to the right of it (they wrap under it if the row is full) */}
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                          <BusStopName code={s.code} name={s.name} className={`text-sm ${end ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`} />
                          {index && <Connections c={connectionsAt(index, line, stopKey(line.gtfs.feedId, s.stop_id))} />}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {parkKey(s) && (
                            <button
                              type="button"
                              onClick={() => setParkOpen(parkOpen === s.stop_id ? null : s.stop_id)}
                              aria-expanded={parkOpen === s.stop_id}
                              aria-label={`${t('parking')}: ${s.name}`}
                              title={t('parking')}
                              className={`rounded-[5px] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E5AA8] ${parkOpen === s.stop_id ? 'ring-2 ring-[#1E5AA8]/35 ring-offset-1' : ''}`}
                            >
                              {/* the square parking sign on its own, the same height as the button beside it */}
                              <ParkingSign size={26} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onPlan(s)}
                            className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-semibold text-[#222D52] hover:border-[#222D52]/50 whitespace-nowrap"
                          >
                            {t('planTripHere')}
                          </button>
                        </div>
                      </div>
                      {parkOpen === s.stop_id && <ParkingInfo stationKey={parkKey(s)!} />}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

// The lines at a station and where you can change, as on the MyRapid line maps: this station's lines, then ⇌ and the
// lines reached without tapping out, then a walking person and the lines reached on foot. Nothing when there is no change.
function Connections({ c }: { c: ReturnType<typeof connectionsAt> }) {
  const { t } = useLanguage()
  if (!c.change.length && !c.walk.length) return null
  const names = (ls: Line[]) => ls.map((l) => l.name).join(', ')
  const badges = (ls: Line[]) => ls.map((l) => <LineBadge key={l.id} line={l} size={18} decorative />)
  return (
    <span className="inline-flex flex-wrap items-center gap-1" role="note" aria-label={[
      c.change.length ? `${t('lineChangeHere')}: ${names(c.change)}` : '',
      c.walk.length ? `${t('lineWalkTo')}: ${names(c.walk)}` : '',
    ].filter(Boolean).join('. ')}>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">{badges(c.here)}</span>
      {c.change.length > 0 && (
        <span className="inline-flex items-center gap-0.5" title={t('lineChangeHere')} aria-hidden="true">
          <span className="px-0.5 text-sm font-bold leading-none text-gray-500">⇌</span>
          {badges(c.change)}
        </span>
      )}
      {c.walk.length > 0 && (
        <span className="inline-flex items-center gap-0.5" title={t('lineWalkTo')} aria-hidden="true">
          <Icon name="directionsWalk" size={16} className="text-gray-600" />
          {badges(c.walk)}
        </span>
      )}
    </span>
  )
}

// The ECRL before it has a timetable: its 20 stations north to south with the starting fare from Gombak (Transit, and
// Express where it stops), phase 2 dashed, where to change, then the fare rules and sources (src/data/ecrl.ts)
function EcrlStations({ line }: { line: Line }) {
  const { t } = useLanguage()
  const last = ECRL_STATIONS.length - 1
  const rm = (n: number) => `RM ${n}`
  return (
    <>
      <ol className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
        {ECRL_STATIONS.map((s, i) => {
          const end = i === 0 || i === last
          const change = s.link ? LINES_BY_ID[s.link] : undefined
          const solid = s.phase === 1
          return (
            <li key={s.name} className="relative flex items-center gap-3">
              <span
                className={`absolute start-[11px] -translate-x-1/2 rtl:translate-x-1/2 ${solid && ECRL_STATIONS[i + 1]?.phase !== 2 ? 'w-1' : 'w-0 border-s-[3px] border-dashed'}`}
                style={{ backgroundColor: solid && ECRL_STATIONS[i + 1]?.phase !== 2 ? line.color : undefined, borderColor: line.color, top: i === 0 ? '50%' : 0, bottom: i === last ? '50%' : 0 }}
                aria-hidden="true"
              />
              <span className="relative z-10 w-[22px] flex justify-center flex-shrink-0" aria-hidden="true">
                {end ? <LineBadge line={line} size={22} decorative /> : <span className={`w-3.5 h-3.5 rounded-full bg-white border-[3px] ${solid ? '' : 'border-dashed'}`} style={{ borderColor: line.color }} />}
              </span>
              <div className={`flex-1 min-w-0 py-2.5 flex items-center justify-between gap-3 ${i < last ? 'border-b border-gray-100' : ''}`}>
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={`text-sm ${end ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'} ${solid ? '' : 'text-gray-500'}`}>{s.name}</span>
                  {change && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600" title={`${t('ecrlChange')} ${change.name}`}>
                      <span className="px-0.5 text-sm font-bold leading-none text-gray-500" aria-hidden="true">⇌</span>
                      <LineBadge line={change} size={18} decorative />
                      <span className="sr-only">{t('ecrlChange')} {change.name}</span>
                    </span>
                  )}
                </div>
                {s.fareRm !== undefined ? (
                  <div className="text-end flex-shrink-0">
                    <div className="text-sm font-semibold text-[#222D52]">{rm(s.fareRm)}</div>
                    <div className="text-[11px] text-gray-500">
                      {s.km} km{s.expressRm !== undefined && <> · {t('ecrlExpress').replace('{rm}', rm(s.expressRm))}</>}
                    </div>
                  </div>
                ) : !solid ? (
                  <span className="text-[11px] text-gray-500 flex-shrink-0">2028</span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 space-y-1.5">
        <p className="font-semibold text-[#222D52]">{t('ecrlFromGombak')}</p>
        <p>{t('ecrlFareNote')}</p>
        <p>{t('ecrlConcession')}</p>
        <p>{t('ecrlPhase1')}</p>
        <p>{t('ecrlNotPlanner')}</p>
        <p className="text-gray-500">
          {t('ecrlSources')}:{' '}
          {ECRL_SOURCES.slice(0, 2).map((src, i) => (
            <span key={src.url}>
              {i > 0 && ' · '}
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#222D52]">{src.label}</a>
            </span>
          ))}
        </p>
      </div>
    </>
  )
}

export default LinePanel
