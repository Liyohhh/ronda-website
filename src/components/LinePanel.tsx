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

// the header is filled with the line's own colour; its words are white where they read on it (4.5:1), else navy
// (yellow, lime and light blue lines)
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const inkOn = (l: Line) => (1.05 / (lum(l.color) + 0.05) >= 4.5 ? '#FFFFFF' : '#222D52')

// Right-side panel (bottom sheet on phones) with a line's stations in running order (public.line_stations).
// Same look as the journey panel; the strip under the header switches between lines.
function LinePanel({ line, onClose, onPlan, onPick }: { line: Line; onClose: () => void; onPlan: (s: Station) => void; onPick: (l: Line) => void }) {
  const { t } = useLanguage()
  const [result, setResult] = useState<{ id: string; stations: Station[]; error: boolean } | null>(null)
  const strip = useRef<HTMLDivElement>(null)

  const ecrl = line.mode === 'ECRL'
  const [express, setExpress] = useState(false) // ECRL: Transit or Express fares
  const ink = inkOn(line)
  const dark = ink !== '#FFFFFF' // navy words on a light line colour
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
        className={`absolute bg-[#F2F6FB] shadow-2xl flex flex-col transition-all duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl overflow-hidden starting:translate-y-full
          md:inset-x-auto md:inset-y-0 md:end-0 md:w-[460px] md:max-h-none md:rounded-none
          md:starting:translate-y-0 md:starting:translate-x-full rtl:md:starting:-translate-x-full`}
      >
        {/* Header in the line's own colour (navy words on light ones), blending from one line to the next: a soft
            circle, the line's logo on a white tile, its name and count; the ECRL also switches Transit / Express fares */}
        <div className="relative overflow-hidden transition-[background-color,color] duration-300 ease-out motion-reduce:transition-none" style={{ backgroundColor: line.color, color: ink }}>
          <span aria-hidden="true" className={`pointer-events-none absolute -end-12 -top-16 h-48 w-48 rounded-full transition-colors duration-300 ${dark ? 'bg-white/25' : 'bg-black/10'}`} />
          <div className="relative px-5 pt-5 pb-5 md:pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em]">{t('lines')}</span>
              <button onClick={onClose} aria-label={t('closeAria')} className={`w-9 h-9 rounded-full flex items-center justify-center ${dark ? 'bg-[#222D52]/10 hover:bg-[#222D52]/15' : 'bg-white/15 hover:bg-white/25'}`}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white"><LineBadge line={line} size={40} decorative /></span>
              <div className="min-w-0">
                <h2 className="text-xl font-black leading-tight truncate">{line.name}</h2>
                <p className="mt-0.5 text-sm">
                  {ecrl
                    ? t('lineStationCount').replace('{n}', String(ECRL_STATIONS.length))
                    : current && !current.error
                    ? bus
                      ? `${current.stations.length} ${t('stopsLabel')}`
                      : t('lineStationCount').replace('{n}', String(current.stations.length))
                    : ' '}
                </p>
              </div>
            </div>
            {ecrl && (
              <div role="group" aria-label={t('ecrlFareType')} className="mt-4 grid grid-cols-2 rounded-full bg-white/15 p-1 text-[13px] font-extrabold">
                {[false, true].map((x) => (
                  <button key={String(x)} type="button" aria-pressed={express === x} onClick={() => setExpress(x)}
                    className={`rounded-full py-2 transition-colors ${express === x ? 'bg-white' : 'hover:bg-white/10'}`}
                    style={express === x ? { color: dark ? '#222D52' : line.color } : undefined}>
                    {t(x ? 'ecrlExpressTab' : 'ecrlTransitTab')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* every rail line as a tab on white (the picked one underlined in its colour); a bus route opens on its own */}
        <div ref={strip} hidden={bus} className="flex gap-1 overflow-x-auto [scrollbar-width:none] px-3 border-b border-[#E3E9F1] bg-white" role="group" aria-label={t('lines')}>
          {LINES.map((l) => {
            const active = l.id === line.id
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => !active && onPick(l)}
                aria-pressed={active}
                className={`px-2.5 pt-3 pb-2.5 inline-flex items-center gap-2 text-sm whitespace-nowrap border-b-[3px] transition-colors ${
                  active ? 'font-extrabold text-[#222D52]' : 'border-transparent font-semibold text-[#5B6576] hover:text-[#222D52]'
                }`}
                style={active ? { borderColor: l.color } : undefined}
              >
                <LineBadge line={l} size={22} decorative />
                {shortName(l)}
              </button>
            )
          })}
        </div>

        {/* the stations fade in when the line changes */}
        <div key={line.id} className="line-fade flex-1 overflow-y-auto p-4">
          {ecrl && <EcrlStations line={line} express={express} />}
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

// The ECRL before it has a timetable: its 20 stations north to south as cards, each with the starting fare from Gombak
// (Transit, or Express where the Express stops; the switch is in the panel header) and its distance, phase 2 dashed with
// its year, where to change, then the fare rules and sources (src/data/ecrl.ts)
function EcrlStations({ line, express }: { line: Line; express: boolean }) {
  const { t } = useLanguage()
  const rm = (n: number) => `RM ${n}`
  const last = ECRL_STATIONS.length - 1
  return (
    <>
      <ol className="space-y-2">
        {ECRL_STATIONS.map((s, i) => {
          const change = s.link ? LINES_BY_ID[s.link] : undefined
          const solid = s.phase === 1
          const fare = express ? s.expressRm : s.fareRm
          return (
            <li key={s.name} className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 ${solid ? 'bg-white' : 'border border-dashed border-[#D3DCE7] bg-white/60'}`}>
              {/* the line joining the dots from card to card, through the gaps (dashed for phase 2) */}
              <span
                aria-hidden="true"
                className={`absolute start-[22px] -translate-x-1/2 rtl:translate-x-1/2 ${ECRL_STATIONS[i + 1]?.phase === 2 || !solid ? 'w-0 border-s-[3px] border-dashed' : 'w-[3px]'}`}
                style={{ backgroundColor: ECRL_STATIONS[i + 1]?.phase === 2 || !solid ? undefined : line.color, borderColor: line.color, top: i === 0 ? '50%' : -9, bottom: i === last ? '50%' : 0 }}
              />
              <span aria-hidden="true" className={`relative h-3 w-3 flex-shrink-0 rounded-full ${solid ? '' : 'border-2 border-dashed bg-white'}`} style={solid ? { backgroundColor: line.color, boxShadow: `0 0 0 4px ${line.color}26` } : { borderColor: line.color }} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={`text-[15px] font-bold ${solid ? 'text-[#222D52]' : 'text-[#5B6576]'}`}>{s.name}</span>
                  {change && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600" title={`${t('ecrlChange')} ${change.name}`}>
                      <span className="px-0.5 text-sm font-bold leading-none text-gray-500" aria-hidden="true">⇌</span>
                      <LineBadge line={change} size={18} decorative />
                      <span className="sr-only">{t('ecrlChange')} {change.name}</span>
                    </span>
                  )}
                </div>
                {s.km !== undefined && <p className="text-[12px] text-[#5B6576]">{t('ecrlKmFrom').replace('{km}', String(s.km))}</p>}
              </div>
              {fare !== undefined ? (
                <span className="flex-shrink-0 text-[16px] font-black text-[#222D52]">{rm(fare)}</span>
              ) : express && s.fareRm !== undefined ? (
                <span className="flex-shrink-0 text-[12px] text-[#5B6576]">{t('ecrlTransitOnly')}</span>
              ) : !solid ? (
                <span className="flex-shrink-0 text-[12px] text-[#5B6576]">2028</span>
              ) : null}
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
