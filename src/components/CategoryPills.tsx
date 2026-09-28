import { useLanguage } from '../hooks/useLanguage'
import { TRAIL_CATEGORIES, categoryKey, type TrailCategory } from '../data/trails'

export type CategoryFilter = TrailCategory | 'all'

// "All / Food & Drink / Culture & Heritage / ..." filter pills
function CategoryPills({ value, onChange }: { value: CategoryFilter; onChange: (v: CategoryFilter) => void }) {
  const { t } = useLanguage()
  const options: CategoryFilter[] = ['all', ...TRAIL_CATEGORIES]
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
              active ? 'bg-[#002472] border-[#002472] text-white' : 'bg-white border-gray-200 text-[#002472] hover:border-[#002472]/40'
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
