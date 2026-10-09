import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { categoryKey, firstStation, trailDescKey, trailNameKey, type Place, type Trail } from '../data/trails'
import { CATEGORY_STYLE } from '../data/trailStyles'
import TrailCover from './TrailCover'
import LineBadge from './LineBadge'

// Card: full-bleed cover; starting station (top left) and a category pill in the category colour (top right);
// stop count, trail name and its one-line description over a dark fade at the bottom. Text sits on shades so it reads on any photo.
function TrailCard({ trail, places, className = '' }: { trail: Trail; places: Record<string, Place>; className?: string }) {
  const { t } = useLanguage()
  const station = firstStation(trail, places)
  return (
    <Link
      to={`/trails/${trail.slug}`}
      className={`group relative block aspect-[4/3] rounded-3xl overflow-hidden bg-[#18243F] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2F5C] ${className}`}
    >
      <TrailCover trail={trail} className="absolute inset-0 group-hover:scale-105 transition-transform duration-300" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/55 to-transparent" />

      <div className="absolute inset-x-0 top-0 p-4 flex items-start justify-between gap-3">
        {station ? (
          <span className="inline-flex items-center gap-1.5 min-w-0 text-white text-xs font-semibold uppercase tracking-wide [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">
            {station.lineIds[0] && <LineBadge line={station.lineIds[0]} size={18} decorative />}
            <span className="truncate">{station.name}</span>
          </span>
        ) : (
          <span />
        )}
        <span
          className="flex-shrink-0 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow"
          style={{ backgroundColor: CATEGORY_STYLE[trail.category].to }}
        >
          {t(categoryKey(trail.category))}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
          {t('stopsCount').replace('{n}', String(trail.stops.length))}
        </p>
        <h3 className="mt-1 text-xl font-bold leading-tight line-clamp-2">{t(trailNameKey(trail))}</h3>
        <p className="mt-1 text-sm text-white/85 leading-snug line-clamp-2">
          {t(trailDescKey(trail))} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 rtl:-scale-x-100">→</span>
        </p>
      </div>
    </Link>
  )
}

export default TrailCard
