import { useLanguage } from '../hooks/useLanguage'
import { categoriesFor, categoryKey, type TrailCategory } from '../data/trails'

export type CategoryFilter = TrailCategory | 'all'

// "All / Food & Drink / Culture & Heritage / ..." filter pills
function CategoryPills({ value, onChange }: { value: CategoryFilter; onChange: (v: CategoryFilter) => void }) {
  const { t, lang } = useLanguage()
  const options: CategoryFilter[] = ['all', ...categoriesFor(lang)]
  return (
    <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 pb-1" role="group" aria-label={t('trailsTitle')}>
      {options.map((c) => {
        const active = c === value
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={active}
            className={`h-11 px-6 rounded-full text-[15px] whitespace-nowrap transition-all ${
              active
                ? 'bg-[#1F2F5C] text-white font-bold shadow-[0_4px_12px_rgb(24_36_63/0.15)]'
                : 'bg-gray-100 text-[#1F2F5C] font-medium hover:bg-[#1F2F5C] hover:text-white'
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
