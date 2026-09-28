import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { FEEDBACK_HREF, REVIEWS, type Review } from '../data/reviews'

// "What riders say": real reviews from src/data/reviews.ts, or an honest empty state until there are any.

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill={i <= rating ? '#C9A45C' : '#E5E7EB'}>
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
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
        <span className="w-9 h-9 rounded-full bg-[#002472] text-white text-sm font-bold flex items-center justify-center" aria-hidden="true">
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
      <h2 id="reviews-title" className="text-2xl md:text-3xl font-bold text-gray-900">
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
        <div className="mt-4 bg-white border border-gray-200 rounded-3xl px-6 py-6 md:py-7 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <Stars rating={0} />
            <h3 className="mt-3 text-xl font-semibold text-[#002472]">{t('reviewsEmptyTitle')}</h3>
            <p className="mt-1 text-gray-600">{t('reviewsEmptyText')}</p>
          </div>
          <Link
            to={FEEDBACK_HREF}
            className="self-start md:self-center flex-shrink-0 inline-flex items-center h-11 px-6 rounded-full bg-[#002472] text-white font-semibold hover:bg-[#001a55] transition-colors"
          >
            {t('reviewsCta')}
          </Link>
        </div>
      )}
    </section>
  )
}

export default ReviewsSection
