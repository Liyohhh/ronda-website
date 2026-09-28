import { useEffect, useState } from 'react'
import LineBadge from './LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import type { Line } from '../data/lines'
import { supabase } from '../services/supabase'

type Station = { seq: number; stop_id: string; name: string; lat: number; lon: number }

// Right-side panel (bottom sheet on phones) with a line's stations in running order (public.line_stations)
function LinePanel({ line, onClose, onPlan }: { line: Line; onClose: () => void; onPlan: (s: Station) => void }) {
  const { t } = useLanguage()
  const [result, setResult] = useState<{ id: string; stations: Station[]; error: boolean } | null>(null)

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

  const current = result?.id === line.id ? result : null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={line.name}>
      <div onClick={onClose} className="absolute inset-0 bg-[#001233]/30 backdrop-blur-[2px] transition-opacity duration-200 starting:opacity-0" />
      <div
        className={`absolute bg-gray-50 shadow-2xl flex flex-col transition-all duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl overflow-hidden starting:translate-y-full
          md:inset-x-auto md:inset-y-0 md:end-0 md:w-[420px] md:max-h-none md:rounded-none
          md:starting:translate-y-0 md:starting:translate-x-full rtl:md:starting:-translate-x-full`}
      >
        <div className="px-5 pt-5 pb-5 md:pt-6" style={{ backgroundColor: line.color, color: line.textColor }}>
          <div className="flex justify-end">
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full ring-4 ring-white/40">
              <LineBadge line={line} size={56} decorative />
            </span>
            <div>
              <h2 className="text-2xl font-bold leading-tight">{line.name}</h2>
              {current && !current.error && <p className="mt-0.5 text-sm opacity-85">{t('lineStationCount').replace('{n}', String(current.stations.length))}</p>}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!current && <p className="text-gray-500">{t('loading')}</p>}
          {current?.error && <p className="text-red-700">{t('lineLoadError')}</p>}
          {current && !current.error && (
            <ol>
              {current.stations.map((s, i) => (
                <li key={s.stop_id + s.seq} className="relative flex items-center gap-3 pb-2 last:pb-0">
                  {i < current.stations.length - 1 && (
                    <span className="absolute start-[9px] top-5 -bottom-0 w-1 -translate-x-1/2 rtl:translate-x-1/2" style={{ backgroundColor: line.color }} aria-hidden="true" />
                  )}
                  <span className="relative z-10 w-[18px] h-[18px] rounded-full bg-white border-4 flex-shrink-0" style={{ borderColor: line.color }} aria-hidden="true" />
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-3 py-1.5">
                    <span className="text-sm font-medium text-gray-900 truncate">{s.name}</span>
                    <button type="button" onClick={() => onPlan(s)} className="text-xs font-semibold text-[#002472] hover:underline whitespace-nowrap">
                      {t('planTripHere')}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export default LinePanel
