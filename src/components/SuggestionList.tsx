import { Fragment, type ReactNode } from 'react'
import LineBadge from './LineBadge'
import StopIcon from './StopIcon'
import BusStopName from './BusStopName'
import RouteChip from './RouteChip'
import { busLine, linesForStop } from '../data/lines'
import { stopIconKind, type StopIconKind } from '../data/stopIcon'
import type { StopResult } from '../hooks/useSmartSearch'
import type { Pick, SuggestionItem } from '../data/suggestions'
import { useLanguage } from '../hooks/useLanguage'

const PLACE_KINDS: StopIconKind[] = ['airport', 'hospital', 'school', 'mall', 'mosque', 'home', 'building', 'place']
const placeKind = (k: string): StopIconKind => (PLACE_KINDS.includes(k as StopIconKind) ? (k as StopIconKind) : 'place')

// Rail stop: its line badge(s) in official colours; bus stop: bus badge; otherwise a place icon
function StopBadge({ stop }: { stop: StopResult }) {
  const lines = linesForStop(stop.feed_id, stop.route_ids ?? [])
  if (lines.length === 1) return <LineBadge line={lines[0]} size={36} decorative />
  if (lines.length > 1) {
    return (
      // interchange: up to 3 badges stacked diagonally, first line on top-left
      <span className="relative w-9 h-9 flex-shrink-0" aria-hidden="true">
        {lines.slice(0, 3).map((l, i) => (
          <span key={l.id} className="absolute rounded-[6px] ring-2 ring-white" style={{ top: i * 6, insetInlineStart: i * 6, zIndex: 3 - i }}>
            <LineBadge line={l} size={24} decorative />
          </span>
        ))}
      </span>
    )
  }
  if (/^BUS\b/.test(stop.category)) return <LineBadge line={busLine(null, 'Bus stop')} size={36} decorative />
  return <StopIcon kind={stopIconKind(stop.stop_name, stop.category)} />
}

// Bold the part of the name that matches what was typed
function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim()
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-semibold text-gray-900">{text.slice(i, i + q.length)}</strong>
      {text.slice(i + q.length)}
    </>
  )
}

type Props = {
  id: string
  items: SuggestionItem[]
  query: string
  loading: boolean
  highlighted: number
  onHover: (index: number) => void
  onPick: (pick: Pick) => void
}

function SuggestionList({ id, items, query, loading, highlighted, onHover, onPick }: Props) {
  const { t } = useLanguage()
  const isRoute = (it: SuggestionItem) => it.type === 'stop' && !!it.stop.route_code
  const firstPlace = items.findIndex((it) => it.type === 'place')
  const firstStop = items.findIndex((it) => it.type === 'stop' && !it.stop.route_code)
  const hasRoute = items.some(isRoute)
  // route-code results: "Stop 3 of 24 · towards X" (or "loop")
  const subtitle = (it: SuggestionItem) => {
    if (it.type === 'place') return it.place.detail
    const s = it.stop
    if (!s.route_code) return s.category
    const at = t('routeStopOf').replace('{n}', String(s.stop_sequence)).replace('{total}', String(s.stop_count))
    return `${at} · ${s.towards ? `${t('towards')} ${s.towards}` : t('loopRoute')}`
  }

  return (
    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-10">
      <div className="max-h-96 overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur text-xs text-gray-500 px-6 pt-3 pb-2 border-b border-gray-100 flex items-center justify-between">
          <span>{t('searchAnywhere')}</span>
          {loading && <span className="w-3.5 h-3.5 border-2 border-gray-200 border-t-[#0E5C63] rounded-full animate-spin" aria-hidden="true" />}
        </div>
        <ul id={id} role="listbox" aria-label={t('searchAnywhere')}>
          {items.map((it, i) => (
            <li key={it.key} role="presentation">
              {i === 0 && hasRoute && it.type === 'stop' && (
                <div className="px-6 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500" role="presentation">
                  {t('routeStopsHeading').split('{code}').map((part, k) => (
                    <Fragment key={k}>
                      {k > 0 && <RouteChip code={it.stop.route_code ?? ''} size="sm" className="mx-1 normal-case tracking-normal" />}
                      {part}
                    </Fragment>
                  ))}
                </div>
              )}
              {i === firstStop && (
                <div className={`px-6 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ${hasRoute ? 'border-t border-gray-100' : ''}`} role="presentation">
                  {t('stationsHeading')}
                </div>
              )}
              {i === firstPlace && (
                <div className={`px-6 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ${i > 0 ? 'border-t border-gray-100' : ''}`} role="presentation">
                  {t('placesHeading')}
                </div>
              )}
              <div
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === highlighted}
                onMouseEnter={() => onHover(i)}
                onMouseDown={(e) => {
                  e.preventDefault() // keep focus in the input
                  onPick(it.pick)
                }}
                className={`w-full px-6 py-2.5 flex items-center gap-3 cursor-pointer ${i === highlighted ? 'bg-[#0E5C63]/[0.06]' : ''}`}
              >
                {it.type === 'stop' ? <StopBadge stop={it.stop} /> : <StopIcon kind={placeKind(it.place.kind)} />}
                <div className="min-w-0">
                  <div className="text-gray-700 truncate">
                    {it.type === 'stop' && it.stop.stop_code ? (
                      // bus stop: (logo on the left) KL1483 Flora Murni Residence
                      <BusStopName code={it.stop.stop_code} name={<Highlight text={it.pick.name} query={query} />} />
                    ) : (
                      <Highlight text={it.pick.name} query={query} />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{subtitle(it)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {firstPlace >= 0 && (
          <div className="px-6 py-2 text-[11px] text-gray-500 border-t border-gray-100">
            ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
              OpenStreetMap
            </a>{' '}
            contributors
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestionList
