import { Link, Navigate, useParams } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { HelpLayout, CategoryIcon } from '../components/HelpLayout'
import { findCategory } from '../data/helpCategories'

function HelpCategory() {
  const { t } = useLanguage()
  const { category } = useParams()
  const cat = findCategory(category)

  if (!cat) return <Navigate to="/help" replace />

  return (
    <HelpLayout>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/help" className="text-sm text-[#002472] hover:underline">
          ← {t('backToHelp')}
        </Link>

        <div className="flex items-center gap-4 mt-6 mb-8">
          <CategoryIcon icon={cat.icon} />
          <h1 className="text-2xl font-semibold text-gray-900">{t(cat.labelKey)}</h1>
        </div>

        {/* Placeholder content: replace with real articles later */}
        <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
          {t('comingSoon')}
        </div>
      </main>
    </HelpLayout>
  )
}

export default HelpCategory
