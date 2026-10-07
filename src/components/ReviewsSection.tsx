import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { FEEDBACK_HREF, REVIEWS, type Review } from '../data/reviews'
import Icon from './Icon'

// "What riders say": real reviews from src/data/reviews.ts, or an honest empty state until there are any.

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={16} className={i <= rating ? 'text-[#F27A5E]' : 'text-[#E5E7EB]'} />
      ))}
    </span>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const { t } = useLanguage()
  const source = { 'google-play': 'Google Play', 'app-store': 'App Store', beta: 'Beta' }[review.source]
  return (
    <figure className="h-full bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
      <Stars rating={review.rating} />
      <blockquote lang={review.lang} dir={review.lang === 'ar' ? 'rtl' : 'ltr'} className="mt-3 text-gray-700 leading-relaxed flex-1">
        “{review.text}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[#0E5C63] text-white text-sm font-bold flex items-center justify-center" aria-hidden="true">
          {review.name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-gray-900 truncate">{review.name}</span>
          <span className="block text-xs text-gray-500">
            {source} · {review.date}
            {review.verified && ` · ${t('reviewVerified')}`}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

function ReviewsSection() {
  const { t } = useLanguage()
  return (
    <section aria-labelledby="reviews-title" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <h2 id="reviews-title" className="text-2xl md:text-3xl font-bold text-[#0E5C63]">
        {t('reviewsTitle')}
      </h2>

      {REVIEWS.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 bg-[#08333A] text-white rounded-3xl px-6 py-6 md:py-7 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <Stars rating={0} />
            <h3 className="mt-3 text-xl font-semibold">{t('reviewsEmptyTitle')}</h3>
            <p className="mt-1 text-white/75">{t('reviewsEmptyText')}</p>
          </div>
          <Link
            to={FEEDBACK_HREF}
            className="self-start md:self-center flex-shrink-0 inline-flex items-center h-11 px-6 rounded-full bg-white text-[#0E5C63] font-semibold hover:bg-gray-100 transition-colors"
          >
            {t('reviewsCta')}
          </Link>
        </div>
      )}
    </section>
  )
}

export default ReviewsSection
