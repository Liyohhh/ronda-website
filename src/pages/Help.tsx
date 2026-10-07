import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { HelpLayout, CategoryIcon } from '../components/HelpLayout'
import { HELP_ARTICLES, HELP_CATEGORIES, HOT_QUESTIONS, articleA, articleHref, articleQ, findArticle } from '../data/helpCategories'
import Icon from '../components/Icon'
import { smartScore } from '../data/lines'

function Help() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const resultsRef = useRef<HTMLHeadingElement>(null)
  const q = query.trim()

  // smart search over every article (question and answer, in the current language): typos allowed, best first
  const results = q
    ? HELP_ARTICLES.map((a) => {
        const sq = smartScore(q, t(articleQ(a.id)))
        const sa = smartScore(q, t(articleA(a.id)))
        const s = sq === null ? (sa === null ? null : sa + 1) : sa === null ? sq : Math.min(sq, sa + 1)
        return { a, s }
      })
        .filter((x) => x.s !== null)
        .sort((x, y) => x.s! - y.s!)
        .map((x) => x.a)
    : []

  // the search button moves to the results (the list already updates while typing)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    resultsRef.current?.focus()
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const list = q ? results : HOT_QUESTIONS.map((id) => findArticle(id)!)

  return (
    <HelpLayout>
      {/* Hero with search */}
      <section className="bg-[#0B3A2C] px-6 py-14">
        <h1 className="text-3xl md:text-4xl font-semibold text-white text-center">{t('helpGreeting')}</h1>
        <form role="search" onSubmit={submit} className="max-w-2xl mx-auto mt-8 flex items-center gap-2 bg-white rounded-full p-1.5 ps-5 shadow-lg">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('helpSearchPh')}
            aria-label={t('helpSearchPh')}
            className="flex-1 min-w-0 py-2.5 text-base outline-none bg-transparent"
          />
          <button type="submit" className="w-11 h-11 rounded-full bg-[#0F4D3A] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#082E23]" aria-label={t('helpResults')}>
            <Icon name="search" size={22} />
          </button>
        </form>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Categories */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-5">{t('categories')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {HELP_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/help/${c.slug}`}
              className="flex items-center gap-4 border border-gray-200 rounded-xl px-5 py-5 hover:border-[#0F4D3A] hover:shadow-sm transition"
            >
              <CategoryIcon icon={c.icon} />
              <span className="text-gray-800">{t(c.labelKey)}</span>
            </Link>
          ))}
        </div>

        {/* Hot questions, or the search results */}
        <h2 ref={resultsRef} tabIndex={-1} className="text-2xl font-semibold text-gray-900 mt-14 mb-3 scroll-mt-24 outline-none">
          {q ? t('helpResults') : t('hotQuestions')}
        </h2>
        <div aria-live="polite">
          {q && list.length === 0 ? (
            <p className="py-5 text-gray-600">{t('helpNoResults').replace('{q}', q)}</p>
          ) : (
            <ul className="border-t border-dashed border-gray-200">
              {list.map((a) => (
                <li key={a.id} className="border-b border-dashed border-gray-200">
                  <Link to={articleHref(a)} className="block px-2 py-5 text-gray-800 hover:text-[#0F4D3A]">
                    {t(articleQ(a.id))}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </HelpLayout>
  )
}

export default Help
