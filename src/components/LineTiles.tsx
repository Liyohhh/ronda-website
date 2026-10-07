import { useState } from 'react'
import LineBadge from './LineBadge'
import RouteChip from './RouteChip'
import { LINE_GROUPS, LINES_BY_ID, busLine, matchLines, type Line } from '../data/lines'
import { routeEnds } from '../data/busRoutes'
import { useLanguage } from '../hooks/useLanguage'

// The line picker without typing: every rail line as a tile (official badge + short name), grouped, plus a
// "Bus routes" tile, because ~2,000 bus routes can't be tiles. Home shows it in the Lines search dropdown
// as soon as the box is pressed (before anything is typed).

const tileClass =
  'flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-start text-sm font-medium text-gray-900 ' +
  'hover:border-[#8E3424]/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E3424]'

export function LineTile({ line, onPick, className = '' }: { line: Line; onPick: (l: Line) => void; className?: string }) {
  return (
    <button type="button" onClick={() => onPick(line)} className={`${tileClass} ${className}`} aria-label={line.name} title={line.name}>
      <LineBadge line={line} size={28} decorative />
      <span className="truncate">{line.short ?? line.name}</span>
    </button>
  )
}

function BusTile({ open, onClick, className = '' }: { open: boolean; onClick: () => void; className?: string }) {
  const { t } = useLanguage()
  return (
    <button type="button" onClick={onClick} aria-expanded={open} className={`${tileClass} ${className}`}>
      <LineBadge line={busLine(null, 'BUS')} size={28} decorative />
      <span className="truncate">{t('busRoutesTile')}</span>
    </button>
  )
}

// Bus-only search (codes like "T410", or a place on the route), best matches first
export function BusRouteSearch({ buses, onPick }: { buses: Line[]; onPick: (l: Line) => void }) {
  const { t } = useLanguage()
  const [q, setQ] = useState('')
  const found = q.trim() ? matchLines(q, buses).filter((l) => l.mode === 'BUS').slice(0, 12) : []
  return (
    <div className="mt-3">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        aria-label={t('busSearchPh')}
        placeholder={t('busSearchPh')}
        className="w-full rounded-full border border-gray-300 px-5 py-3 text-base outline-none focus:border-[#8E3424]"
      />
      {q.trim() !== '' && (
        found.length === 0 ? (
          <p className="mt-2 px-2 text-sm text-gray-500">{t('lineNoMatch').replace('{q}', q.trim())}</p>
        ) : (
          <ul className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1" aria-label={t('busRoutesTile')}>
            {found.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => onPick(l)} className="flex w-full items-center gap-2 px-4 py-2 text-start hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none">
                  <RouteChip code={l.code ?? l.name} icon />
                  <span className="min-w-0 truncate text-sm text-gray-900">{routeEnds(l.name)?.to ?? (l.name !== l.code ? l.name : '')}</span>
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}

// Grouped grid. onBus: what the "Bus routes" tile does (Home: ask for a bus route in its own search box);
// without it the tile opens a bus-only search under the grid.
export function LineGrid({ buses, onPick, onBus }: { buses: Line[]; onPick: (l: Line) => void; onBus?: () => void }) {
  const { t } = useLanguage()
  const [busOpen, setBusOpen] = useState(false)
  return (
    <div className="w-full" data-testid="line-grid">
      {LINE_GROUPS.map((g) => (
        <section key={g.key} className="mt-3 first:mt-0" aria-label={t(g.key)}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t(g.key)}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {g.ids.map((id) => <LineTile key={id} line={LINES_BY_ID[id]} onPick={onPick} />)}
          </div>
        </section>
      ))}
      <section className="mt-3" aria-label={t('busRoutesTile')}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <BusTile open={busOpen} onClick={onBus ?? (() => setBusOpen((o) => !o))} />
        </div>
        {busOpen && <BusRouteSearch buses={buses} onPick={onPick} />}
      </section>
    </div>
  )
}
