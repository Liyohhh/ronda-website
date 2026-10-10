import { Link, useParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import TrailCover from '../components/TrailCover'
import PhotoCredit from '../components/PhotoCredit'
import { TRAIL_MAPS } from '../data/trailMaps'
import { HoursStatus, HoursWeek } from '../components/PlaceHours'
import { TRAIL_PHOTOS } from '../data/trailPhotos'
import { PLACE_PHOTOS } from '../data/placePhotos'
import { CATEGORY_STYLE } from '../data/trailStyles'
import LineBadge from '../components/LineBadge'
import { useLanguage } from '../hooks/useLanguage'
import Icon from '../components/Icon'
import BackButton from '../components/BackButton'
import { useTrails } from '../hooks/useTrails'
import {
  categoryKey,
  cuisineKey,
  dietKey,
  findTrail,
  placeBlurbKey,
  trailDescKey,
  trailNameKey,
  weekdayKey,
  type Station,
} from '../data/trails'

// Rapid KL stop ids are the station codes riders see (KJ10, KG18A); other feeds use internal numbers
const stationCode = (s: Station) => (s.feedId === 'rapid-rail-kl' && s.stopId ? s.stopId : null)

// Home opens with the End box filled in: /?to=<exact search name>&toName=<shown name>
const planHref = (s: Station) => `/?to=${encodeURIComponent(s.search)}&toName=${encodeURIComponent(s.name)}`

function BackLink() {
  const { t } = useLanguage()
  return <BackButton to="/trails" label={t('backToTrails')} />
}

function TrailDetail() {
  const { t } = useLanguage()
  const { slug } = useParams()
  const { data, error } = useTrails()
  const trail = data ? findTrail(data, slug) : undefined

  if (!data) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-500" role={error ? 'alert' : 'status'}>
          {error ? t('trailsLoadError') : t('loading')}
        </div>
      </SiteLayout>
    )
  }

  if (!trail) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#1F2F5C]/10 text-[#1F2F5C] flex items-center justify-center" aria-hidden="true">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#18243F]/90 via-[#18243F]/40 to-transparent" />
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <BackLink />
      </div>

      {/* trail map picture, full page width; tap to open it full size */}
      {TRAIL_MAPS[trail.slug] && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
          <a href={TRAIL_MAPS[trail.slug].jpg} target="_blank" rel="noopener" className="block overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <picture>
              <source srcSet={TRAIL_MAPS[trail.slug].webp} type="image/webp" />
              <img src={TRAIL_MAPS[trail.slug].jpg} alt={TRAIL_MAPS[trail.slug].alt} width={1800} height={1200} loading="lazy" className="block w-full h-auto" />
            </picture>
          </a>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        <h2 className="mt-6 text-lg font-semibold text-gray-900">
          {t('trailStops')} <span className="text-gray-500 font-normal">· {t('stopsCount').replace('{n}', String(trail.stops.length))}</span>
        </h2>

        <ol className="mt-4">
          {trail.stops.map((stop, i) => {
            const place = data.places[stop.placeId]
            const last = i === trail.stops.length - 1
            const newDay = stop.day && stop.day !== trail.stops[i - 1]?.day
            return (
              <li key={`${stop.placeId}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                {/* numbered dot + connecting line */}
                {!last && <span className="absolute start-4 top-9 bottom-0 w-0.5 -translate-x-1/2 rtl:translate-x-1/2 bg-[#1F2F5C]/15" aria-hidden="true" />}
                <span className="relative z-10 w-8 h-8 rounded-full bg-[#1F2F5C] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-2xl p-3 flex flex-col sm:flex-row-reverse gap-4">
                  {/* details on the left, photo on the right (category cover when the place has no free photo); photo on top on a phone */}
                  <div className="relative flex-shrink-0 w-full aspect-[4/3] sm:aspect-auto sm:w-56 md:w-64 sm:min-h-44 rounded-xl overflow-hidden">
                    {PLACE_PHOTOS[place.id] ? (
                      <>
                        <img src={PLACE_PHOTOS[place.id].src} alt={place.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                        <p className="absolute inset-x-0 bottom-0 px-2 py-1 text-[9px] leading-tight text-white/90 bg-gradient-to-t from-black/60 to-transparent truncate">
                          {t('photoLabel')}: <PhotoCredit photo={PLACE_PHOTOS[place.id]} />
                        </p>
                      </>
                    ) : (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundImage: `linear-gradient(135deg, ${CATEGORY_STYLE[trail.category].from} 10%, ${CATEGORY_STYLE[trail.category].to})` }}
                      >
                        <Icon name={CATEGORY_STYLE[trail.category].icon} size={44} className="text-white/85" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col sm:py-1 sm:ps-1">
                    {newDay && (
                      <div className="inline-block mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1D4ED8] bg-[#2563EB]/10 px-2 py-0.5 rounded">
                        {t(weekdayKey(stop.day!))}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 leading-snug">{place.name}</h3>
                    {place.address && <p className="mt-0.5 text-xs text-gray-500">{place.address}</p>}
                    {(place.cuisine || place.dietary) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {place.cuisine && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F0FE] px-2.5 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                            <Icon name="restaurant" size={13} />
                            {t(cuisineKey(place.cuisine))}
                          </span>
                        )}
                        {place.dietary && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              place.dietary === 'halal' || place.dietary === 'muslim_friendly'
                                ? 'bg-[#E7F6EC] text-[#15803D]'
                                : place.dietary === 'non_halal'
                                  ? 'bg-[#FDE9E9] text-[#B91C1C]'
                                  : 'bg-[#FDF3E2] text-[#92400E]'
                            }`}
                          >
                            {t(dietKey(place.dietary))}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t(placeBlurbKey(place.id))}</p>

                    {/* facts, one per row with an icon: where to get off, the walk from there, the week's hours */}
                    <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
                      {place.station ? (
                        <li className="flex items-center gap-2 min-w-0">
                          <span className="flex -space-x-1 rtl:space-x-reverse flex-shrink-0">
                            {place.station.lineIds.map((id) => (
                              <span key={id} className="rounded-md ring-2 ring-white">
                                <LineBadge line={id} size={20} decorative />
                              </span>
                            ))}
                          </span>
                          <span className="truncate">
                            <span className="text-gray-500">{t('getOffAt')}</span>{' '}
                            <span className="font-semibold text-gray-900">{place.station.name}</span>
                          </span>
                          {stationCode(place.station) && (
                            <span className="flex-shrink-0 text-[11px] font-semibold text-gray-600 border border-gray-300 rounded px-1">{stationCode(place.station)}</span>
                          )}
                        </li>
                      ) : (
                        <li className="text-gray-500 italic">{t('stationTbc')}</li>
                      )}
                      {place.station && place.walkMeters != null && (
                        <li className="flex items-center gap-2">
                          <span className="w-5 flex justify-center flex-shrink-0"><Icon name="directionsWalk" size={18} className="text-gray-500" /></span>
                          {t('walkFromStation').replace('{m}', String(place.walkMeters)).replace('{n}', String(Math.max(1, Math.round(place.walkMeters / 80))))}
                        </li>
                      )}
                      {place.openingHours && (
                        <li className="flex items-center gap-2">
                          <span className="w-5 flex justify-center flex-shrink-0"><Icon name="scheduleOutline" size={18} className="text-gray-500" /></span>
                          <HoursWeek hours={place.openingHours} />
                        </li>
                      )}
                    </ul>

                    {/* footer: plan button, and whether it's open right now */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      {place.station ? (
                        <Link
                          to={planHref(place.station)}
                          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1F2F5C] text-white text-sm font-semibold hover:bg-[#152038] transition-colors"
                        >
                          <Icon name="locationOnOutline" size={16} />
                          {t('planTripHere')}
                        </Link>
                      ) : (
                        <span />
                      )}
                      {place.openingHours && <HoursStatus hours={place.openingHours} />}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="mt-6 text-xs text-gray-500">
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">{t('placeInfoCredit')}</a>
        </p>
      </div>
    </SiteLayout>
  )
}

export default TrailDetail
