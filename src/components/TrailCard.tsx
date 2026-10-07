import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { categoryKey, firstStation, trailDescKey, trailNameKey, type Place, type Trail } from '../data/trails'
import TrailCover from './TrailCover'
import LineBadge from './LineBadge'

// Card: cover with a category tag, name, one-line description, stop count and starting station
function TrailCard({ trail, places, className = '' }: { trail: Trail; places: Record<string, Place>; className?: string }) {
  const { t } = useLanguage()
  const station = firstStation(trail, places)
  return (
    <Link
      to={`/trails/${trail.slug}`}
      className={`group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B1A3A] ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <TrailCover trail={trail} className="group-hover:scale-105 transition-transform duration-300" />
        <span className="absolute top-0 start-0 bg-[#3E1027]/90 text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-ee-xl">
          {t(categoryKey(trail.category))}
        </span>
      </div>
      <div className="flex-1 flex flex-col p-4">
        <h3 className="font-semibold text-gray-900 leading-snug">{t(trailNameKey(trail))}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{t(trailDescKey(trail))}</p>
        <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-gray-600">
          <span className="font-semibold text-[#5B1A3A] whitespace-nowrap">{t('stopsCount').replace('{n}', String(trail.stops.length))}</span>
          {station && (
            <>
              <span className="text-gray-300" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 min-w-0">
                {station.lineIds[0] && <LineBadge line={station.lineIds[0]} size={16} decorative />}
                <span className="truncate">{t('startsAt').replace('{station}', station.name)}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export default TrailCard
