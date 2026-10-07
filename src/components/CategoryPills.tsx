import { useLanguage } from '../hooks/useLanguage'
import { categoriesFor, categoryKey, type TrailCategory } from '../data/trails'

export type CategoryFilter = TrailCategory | 'all'

// "All / Food & Drink / Culture & Heritage / ..." filter pills
function CategoryPills({ value, onChange }: { value: CategoryFilter; onChange: (v: CategoryFilter) => void }) {
  const { t, lang } = useLanguage()
  const options: CategoryFilter[] = ['all', ...categoriesFor(lang)]
  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 pb-1" role="group" aria-label={t('trailsTitle')}>
      {options.map((c) => {
        const active = c === value
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={active}
            className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              active ? 'bg-accent border-accent text-[#0B3A2C]' : 'bg-white border-gray-200 text-[#0F4D3A] hover:border-[#0F4D3A]/40'
            }`}
          >
            {c === 'all' ? t('allCategories') : t(categoryKey(c))}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryPills
