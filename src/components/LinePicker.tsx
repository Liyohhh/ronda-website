import LineBadge from './LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import { matchLines, type Line } from '../data/lines'

// Lines tab dropdown: lines matching what's typed (typos allowed), best match first
type Props = { id: string; query: string; highlighted: number; onPick: (line: Line) => void; onHover: (i: number) => void }

function LinePicker({ id, query, highlighted, onPick, onHover }: Props) {
  const { t } = useLanguage()
  const lines = matchLines(query)
  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {lines.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-500">{t('lineNoMatch').replace('{q}', query.trim())}</p>
      ) : (
        <ul id={id} role="listbox" aria-label={t('lines')} className="max-h-80 overflow-y-auto py-1">
          {lines.map((l, i) => (
            <li
              key={l.id}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={(e) => {
                e.preventDefault() // keep focus in the input until the pick is handled
                onPick(l)
              }}
              onMouseEnter={() => onHover(i)}
              className={`flex items-center gap-3 px-5 py-2 cursor-pointer ${i === highlighted ? 'bg-gray-100' : ''}`}
            >
              <LineBadge line={l} size={24} decorative />
              <span className="text-sm text-gray-900">{l.name}</span>
              {l.code && <span className="ms-auto text-xs text-gray-400">{l.code}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LinePicker
