import { Link } from 'react-router-dom'
import LineBadge from './LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import { matchLines } from '../data/lines'

// Lines tab on Home: every line with its badge, filtered by what's typed (name, code or mode)
function LinePicker({ query }: { query: string }) {
  const { t } = useLanguage()
  const lines = matchLines(query)
  if (!lines.length) return <p className="mt-4 text-center text-sm text-gray-500">{t('lineNoMatch').replace('{q}', query.trim())}</p>
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto pe-1" aria-label={t('lines')}>
      {lines.map((l) => (
        <li key={l.id}>
          <Link to={`/lines/${l.id}`} className="flex items-center gap-3 rounded-2xl border border-gray-200 px-3 py-2 hover:border-[#002472]/40 hover:bg-gray-50 transition">
            <LineBadge line={l} size={32} decorative />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900 truncate">{l.name}</span>
              {l.code && <span className="block text-xs text-gray-500">{l.code}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default LinePicker
