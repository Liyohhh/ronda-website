import { Link, useParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import TrailCover from '../components/TrailCover'
import PhotoCredit from '../components/PhotoCredit'
import { TRAIL_PHOTOS } from '../data/trailPhotos'
import LineBadge from '../components/LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import Icon from '../components/Icon'
import {
  PLACES,
  categoryKey,
  findTrail,
  placeBlurbKey,
  trailDescKey,
  trailNameKey,
  weekdayKey,
  type Station,
} from '../data/trails'

// Home opens with the End box filled in: /?to=<exact search name>&toName=<shown name>
const planHref = (s: Station) => `/?to=${encodeURIComponent(s.search)}&toName=${encodeURIComponent(s.name)}`

function BackLink() {
  const { t } = useLanguage()
  return (
    <Link to="/trails" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#002472] hover:underline">
      <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
      {t('backToTrails')}
    </Link>
  )
}

function TrailDetail() {
  const { t } = useLanguage()
  const { slug } = useParams()
  const trail = findTrail(slug)

  if (!trail) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#002472]/10 text-[#002472] flex items-center justify-center" aria-hidden="true">
            <Icon name="searchOff" size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t('trailNotFound')}</h1>
          <p className="mt-2 text-gray-500">{t('trailNotFoundText')}</p>
          <div className="mt-6">
            <BackLink />
          </div>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      {/* Cover banner */}
      <section className="relative h-56 md:h-72 overflow-hidden">
        <TrailCover trail={trail} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001233]/90 via-[#001233]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6 text-white">
            <span className="inline-block bg-white/15 backdrop-blur text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
              {t(categoryKey(trail.category))}
            </span>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold">{t(trailNameKey(trail))}</h1>
            <p className="mt-1 text-white/85">{t(trailDescKey(trail))}</p>
          </div>
        </div>
        {TRAIL_PHOTOS[trail.slug] && (
          <p className="absolute top-2 end-3 text-[10px] text-white/70">
            {t('photoLabel')}: <PhotoCredit photo={TRAIL_PHOTOS[trail.slug]} />
          </p>
        )}
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <BackLink />

        <h2 className="mt-6 text-lg font-semibold text-gray-900">
          {t('trailStops')} <span className="text-gray-400 font-normal">· {t('stopsCount').replace('{n}', String(trail.stops.length))}</span>
        </h2>

        <ol className="mt-4">
          {trail.stops.map((stop, i) => {
            const place = PLACES[stop.placeId]
            const last = i === trail.stops.length - 1
            const newDay = stop.day && stop.day !== trail.stops[i - 1]?.day
            return (
              <li key={`${stop.placeId}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                {/* numbered dot + connecting line */}
                {!last && <span className="absolute start-4 top-9 bottom-0 w-0.5 -translate-x-1/2 rtl:translate-x-1/2 bg-[#002472]/15" aria-hidden="true" />}
                <span className="relative z-10 w-8 h-8 rounded-full bg-[#002472] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-2xl p-4">
                  {newDay && (
                    <div className="inline-block mb-2 text-[11px] font-bold uppercase tracking-wide text-[#8a6a2a] bg-[#C9A45C]/15 px-2 py-0.5 rounded">
                      {t(weekdayKey(stop.day!))}
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900">{place.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{t(placeBlurbKey(place.id))}</p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    {place.station ? (
                      <div className="flex items-center gap-2 text-sm min-w-0">
                        <span className="flex -space-x-1 rtl:space-x-reverse">
                          {place.station.lineIds.map((id) => (
                            <span key={id} className="rounded-md ring-2 ring-white">
                              <LineBadge line={id} size={22} decorative />
                            </span>
                          ))}
                        </span>
                        <span className="text-gray-500">{t('nearestStation')}:</span>
                        <span className="font-medium text-gray-900 truncate">{place.station.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">{t('stationTbc')}</span>
                    )}

                    {place.station && (
                      <Link
                        to={planHref(place.station)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#002472] text-white text-sm font-semibold hover:bg-[#001a55] transition-colors"
                      >
                        <Icon name="locationOnOutline" size={16} />
                        {t('planTripHere')}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </SiteLayout>
  )
}

export default TrailDetail
