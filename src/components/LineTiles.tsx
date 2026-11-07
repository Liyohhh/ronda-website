import LineBadge from './LineBadge'
import { LINE_GROUPS, LINES_BY_ID, busLinesEntry, type Line } from '../data/lines'
import { useLanguage } from '../hooks/useLanguage'

// The line picker without typing: every rail line as a tile (official badge + short name), grouped, plus one tile
// for the bus lines. Home shows it in the Lines search dropdown as soon as the box is pressed (before anything is typed).

const tileClass =
  'flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-start text-sm font-medium text-gray-900 ' +
  'hover:border-[#222D52]/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222D52]'

export function LineTile({ line, onPick, className = '' }: { line: Line; onPick: (l: Line) => void; className?: string }) {
  return (
    <button type="button" onClick={() => onPick(line)} className={`${tileClass} ${className}`} aria-label={line.name} title={line.name}>
      <LineBadge line={line} size={28} decorative />
      <span className="truncate"><span className="sm:hidden">{line.name}</span><span className="hidden sm:inline">{line.short ?? line.name}</span></span>
    </button>
  )
}

// Grouped grid, then one Bus tile: it opens the bus lines in the line panel
export function LineGrid({ onPick }: { onPick: (l: Line) => void }) {
  const { t } = useLanguage()
  return (
    <div className="w-full" data-testid="line-grid">
      {LINE_GROUPS.map((g) => (
        <section key={g.key} className="mt-3 first:mt-0" aria-label={t(g.key)}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t(g.key)}</h3>
          {/* phone: one line per row with its full name, easier to read than two short ones (owner, 4 Nov 2026) */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {g.ids.map((id) => <LineTile key={id} line={LINES_BY_ID[id]} onPick={onPick} />)}
          </div>
        </section>
      ))}
      {/* buses get their own heading, apart from the rail groups above */}
      <section className="mt-3" aria-label={t('linesGroupBus')}>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('linesGroupBus')}</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <button type="button" onClick={() => onPick(busLinesEntry(t('busLinesTile')))} className={tileClass}>
            <LineBadge line={busLinesEntry('BUS')} size={28} decorative />
            <span className="truncate">{t('busLinesTile')}</span>
          </button>
        </div>
      </section>
    </div>
  )
}
