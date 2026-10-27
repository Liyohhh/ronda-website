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
function StopBadge({ stop, compact }: { stop: StopResult; compact: boolean }) {
  const lines = linesForStop(stop.feed_id, stop.route_ids ?? [])
  const size = compact ? 24 : 36
  if (lines.length === 1) return <LineBadge line={lines[0]} size={size} decorative />
  if (lines.length > 1) {
    const step = compact ? 4 : 6
    return (
      // interchange: up to 3 badges stacked diagonally, first line on top-left
      <span className={`relative flex-shrink-0 ${compact ? 'w-6 h-6' : 'w-9 h-9'}`} aria-hidden="true">
        {lines.slice(0, 3).map((l, i) => (
          <span key={l.id} className="absolute rounded-[6px] ring-2 ring-white" style={{ top: i * step, insetInlineStart: i * step, zIndex: 3 - i }}>
            <LineBadge line={l} size={compact ? 16 : 24} decorative />
          </span>
        ))}
      </span>
    )
  }
  if (/^BUS\b/.test(stop.category)) return <LineBadge line={busLine(null, 'Bus stop')} size={size} decorative />
  return <StopIcon kind={stopIconKind(stop.stop_name, stop.category)} compact={compact} />
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
  // smaller rows, icons and text, for narrow boxes such as the live map panel
  compact?: boolean
}

function SuggestionList({ id, items, query, loading, highlighted, onHover, onPick, compact = false }: Props) {
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

  const px = compact ? 'px-3' : 'px-6'
  const heading = `${px} ${compact ? 'pt-2 pb-0.5 text-[10px]' : 'pt-3 pb-1 text-[11px]'} font-semibold uppercase tracking-wide text-gray-500`
  return (
    <div className={`absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl overflow-hidden z-10 ${compact ? 'rounded-xl' : 'rounded-2xl'}`}>
      <div className={`${compact ? 'max-h-[min(18rem,45vh)]' : 'max-h-96'} overflow-y-auto overscroll-contain`}>
        <div className={`sticky top-0 z-10 bg-white/95 backdrop-blur text-gray-500 ${px} ${compact ? 'pt-2 pb-1.5 text-[11px]' : 'pt-3 pb-2 text-xs'} border-b border-gray-100 flex items-center justify-between`}>
          <span>{t('searchAnywhere')}</span>
          {loading && <span className="w-3.5 h-3.5 border-2 border-gray-200 border-t-[#222D52] rounded-full animate-spin" aria-hidden="true" />}
        </div>
        <ul id={id} role="listbox" aria-label={t('searchAnywhere')}>
          {items.map((it, i) => (
            <li key={it.key} role="presentation">
              {i === 0 && hasRoute && it.type === 'stop' && (
                <div className={heading} role="presentation">
                  {t('routeStopsHeading').split('{code}').map((part, k) => (
                    <Fragment key={k}>
                      {k > 0 && <RouteChip code={it.stop.route_code ?? ''} size="sm" className="mx-1 normal-case tracking-normal" />}
                      {part}
                    </Fragment>
                  ))}
                </div>
              )}
              {i === firstStop && (
                <div className={`${heading} ${hasRoute ? 'border-t border-gray-100' : ''}`} role="presentation">
                  {t('stationsHeading')}
                </div>
              )}
              {i === firstPlace && (
                <div className={`${heading} ${i > 0 ? 'border-t border-gray-100' : ''}`} role="presentation">
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
                className={`w-full ${px} ${compact ? 'py-1.5 gap-2.5' : 'py-2.5 gap-3'} flex items-center cursor-pointer ${i === highlighted ? 'bg-[#222D52]/[0.06]' : ''}`}
              >
                {it.type === 'stop' ? <StopBadge stop={it.stop} compact={compact} /> : <StopIcon kind={placeKind(it.place.kind)} compact={compact} />}
                <div className="min-w-0">
                  <div className={`text-gray-700 truncate ${compact ? 'text-[13px] leading-snug' : ''}`}>
                    {it.type === 'stop' && it.stop.stop_code ? (
                      // bus stop: (logo on the left) KL1483 Flora Murni Residence
                      <BusStopName code={it.stop.stop_code} name={<Highlight text={it.pick.name} query={query} />} />
                    ) : (
                      <Highlight text={it.pick.name} query={query} />
                    )}
                  </div>
                  <div className={`text-gray-500 truncate ${compact ? 'text-[11px] leading-snug' : 'text-xs'}`}>{subtitle(it)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {firstPlace >= 0 && (
          <div className={`${px} py-2 text-[11px] text-gray-500 border-t border-gray-100`}>
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
