import { useEffect, useRef, useState } from 'react'
import LineBadge from './LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import { LINES, type Line } from '../data/lines'
import { supabase } from '../services/supabase'
import Icon from './Icon'
import BusStopName from './BusStopName'

type Station = { seq: number; stop_id: string; name: string; lat: number; lon: number; code?: string | null }

// "MRT Kajang Line" -> "MRT Kajang" for the line strip
const shortName = (l: Line) => l.name.replace(/\s+Line$/, '')

// Right-side panel (bottom sheet on phones) with a line's stations in running order (public.line_stations).
// Same look as the journey panel; the strip under the header switches between lines.
function LinePanel({ line, onClose, onPlan, onPick }: { line: Line; onClose: () => void; onPlan: (s: Station) => void; onPick: (l: Line) => void }) {
  const { t } = useLanguage()
  const [result, setResult] = useState<{ id: string; stations: Station[]; error: boolean } | null>(null)
  const strip = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('line_stations', { p_feed: line.gtfs.feedId, p_routes: line.gtfs.routeIds }).then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('line_stations', error)
      setResult({ id: line.id, stations: (data as Station[] | null) ?? [], error: !!error })
    })
    return () => {
      cancelled = true
    }
  }, [line])

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
  const last = (current?.stations.length ?? 0) - 1

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={line.name}>
      <div onClick={onClose} className="absolute inset-0 bg-[#0B3A2C]/30 backdrop-blur-[2px] transition-opacity duration-200 starting:opacity-0" />
      <div
        className={`absolute bg-gray-50 shadow-2xl flex flex-col transition-all duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl overflow-hidden starting:translate-y-full
          md:inset-x-auto md:inset-y-0 md:end-0 md:w-[460px] md:max-h-none md:rounded-none
          md:starting:translate-y-0 md:starting:translate-x-full rtl:md:starting:-translate-x-full`}
      >
        {/* Header in RONDA navy: the line's logo and name, then every line as a tab (the picked one underlined in its colour) */}
        <div className="bg-[#0B3A2C] text-white">
          <div className="px-5 pt-5 pb-4 md:pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-white/60">{t('lines')}</span>
              <button onClick={onClose} aria-label={t('closeAria')} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="rounded-full bg-white p-1 flex-shrink-0">
                <LineBadge line={line} size={44} decorative />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold leading-tight truncate">{line.name}</h2>
                <p className="mt-0.5 text-sm text-white/70">
                  {current && !current.error
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
          {!current && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#0F4D3A]/20 border-t-[#0F4D3A] rounded-full animate-spin" aria-label={t('loading')} />
            </div>
          )}
          {current?.error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{t('lineLoadError')}</div>}
          {current && !current.error && (
            <ol className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              {current.stations.map((s, i) => {
                const end = i === 0 || i === last
                return (
                  <li key={s.stop_id + s.seq} className="relative flex items-center gap-3">
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
                    <div className={`flex-1 min-w-0 flex items-center justify-between gap-3 py-2.5 ${i < last ? 'border-b border-gray-100' : ''}`}>
                      <BusStopName code={s.code} name={s.name} className={`text-sm ${end ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`} />
                      <button
                        type="button"
                        onClick={() => onPlan(s)}
                        className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-semibold text-[#0F4D3A] hover:border-[#0F4D3A]/50 whitespace-nowrap"
                      >
                        {t('planTripHere')}
                      </button>
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

export default LinePanel
