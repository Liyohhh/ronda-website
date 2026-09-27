import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { HelpLayout, CategoryIcon } from '../components/HelpLayout'
import { HELP_CATEGORIES, HOT_QUESTIONS } from '../data/helpCategories'

function Help() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')

  const questions = HOT_QUESTIONS.filter((q) =>
    q.question.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <HelpLayout>
      {/* Hero with search */}
      <section className="bg-[#002472] px-6 py-14">
        <h1 className="text-3xl md:text-4xl font-semibold text-white text-center">{t('helpGreeting')}</h1>
        <div className="max-w-2xl mx-auto mt-8 flex bg-white rounded-lg overflow-hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('helpSearchPh')}
            className="flex-1 px-5 py-4 text-base outline-none"
          />
          <button className="w-20 bg-[#002472] border-4 border-white rounded-lg text-white flex items-center justify-center" aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Categories */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-5">{t('categories')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {HELP_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/help/${c.slug}`}
              className="flex items-center gap-4 border border-gray-200 px-5 py-5 hover:border-[#002472] hover:shadow-sm transition"
            >
              <CategoryIcon icon={c.icon} />
              <span className="text-gray-800">{t(c.labelKey)}</span>
            </Link>
          ))}
        </div>

        {/* Hot questions */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-14 mb-3">{t('hotQuestions')}</h2>
        <ul className="border-t border-dashed border-gray-200">
          {questions.map((q) => (
            <li key={q.question} className="border-b border-dashed border-gray-200">
              <Link to={`/help/${q.category}`} className="block px-2 py-5 text-gray-800 hover:text-[#002472]">
                {q.question}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </HelpLayout>
  )
}

export default Help
