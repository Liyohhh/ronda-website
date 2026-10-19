import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Ronda300Map from './Ronda300Map'
import Icon from './Icon'
import type { Pick } from '../data/suggestions'
import type { TranslationKey } from '../i18n/translations'
import { useLanguage } from '../hooks/useLanguage'
import { KIND_COLOR, KIND_ICON, PLACE_KINDS, loadPlacesNear, placeName, planToPoint, walkMinutes, type NearPlace, type PlaceKind } from '../services/places'

// RONDA 300 in one panel, on the home page and on /ronda-300 alike, modelled on Rome2rio's and Klook's map pages.
// One map (Ronda300Map): every rail station first; pick one (on the map, or in the page's search) and the same map
// flies to it, the kinds appear as an icon bar across the top and the places within 300 m (from OpenStreetMap,
// nearest first) are listed beside the map as cards. "All stations" goes back. Pointing at a place in the list puts
// a callout on its dot; pressing a dot picks the place in the list. On phones the map comes first.
function Ronda300Explorer({ picked, onPick }: { picked: Pick | null; onPick: (p: Pick | null) => void }) {
  const { t, lang } = useLanguage()
  const [places, setPlaces] = useState<NearPlace[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [kind, setKind] = useState<PlaceKind | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // a new station: start again with all its places
  const [shown, setShown] = useState(picked)
  if (shown !== picked) {
    setShown(picked)
    setPlaces(null)
    setFailed(false)
    setKind(null)
    setActive(null)
  }
  useEffect(() => {
    if (!picked) return
    let live = true
    loadPlacesNear(picked.lat, picked.lon).then((p) => { if (live) setPlaces(p) }).catch(() => { if (live) setFailed(true) })
    return () => { live = false }
  }, [picked])

  const kinds = PLACE_KINDS.filter((k) => places?.some((p) => p.kind === k))
  const matching = useMemo(() => (places ?? []).filter((p) => !kind || p.kind === kind), [places, kind])
  const pickOnMap = useCallback((id: string) => {
    setActive(id)
    const li = listRef.current?.querySelector<HTMLElement>(`[data-osm="${CSS.escape(id)}"]`)
    li?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  return (
    <section aria-labelledby={picked ? 'r3-osm' : undefined} aria-live="polite">
      {picked && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="r3-osm" className="text-[26px] md:text-[32px] font-semibold tracking-[-0.02em] text-[#222D52]">{t('r3_osmTitle').replace('{station}', picked.name)}</h2>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">{t('r3_osmNote')}</p>
          </div>
          <button
            type="button"
            onClick={() => onPick(null)}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border-[1.5px] border-[#222D52] px-4 text-sm font-semibold text-[#222D52] hover:bg-[#222D52] hover:text-white transition-colors"
          >
            <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
            {t('r3_allStations')}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-[#DCD4C8] bg-[#F7F4EF]">
        {picked && places && places.length > 0 ? (
          <div role="group" aria-label={t('r3_osmFilter')} className="flex overflow-x-auto border-b border-[#DCD4C8] bg-white px-2 [scrollbar-width:none]">
            {[null, ...kinds].map((k) => {
              const on = kind === k
              return (
                <button
                  key={k ?? 'all'}
                  type="button"
                  aria-pressed={on}
                  onClick={() => { setKind(k); setActive(null) }}
                  className={`flex min-w-[92px] flex-shrink-0 flex-col items-center gap-1 border-b-2 px-3 pb-2.5 pt-3 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold ${on ? 'border-[#222D52] font-semibold text-[#222D52]' : 'border-transparent text-gray-600 hover:text-[#222D52]'}`}
                >
                  <span aria-hidden="true" className="flex h-7 items-center" style={{ color: k ? KIND_COLOR[k] : '#222D52' }}>
                    <Icon name={k ? KIND_ICON[k] : 'locationOnOutline'} size={24} />
                  </span>
                  <span className="whitespace-nowrap">{k ? t(`r3k_${k}` as TranslationKey) : t('r3_osmAll')}</span>
                  <span className="text-[11px] text-gray-500">{k ? places.filter((p) => p.kind === k).length : places.length}</span>
                </button>
              )
            })}
          </div>
        ) : null}

        <div className={picked ? 'grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start' : ''}>
          {/* the one map: stays the same map whether a station is picked or not */}
          <div className={picked ? 'h-[340px] sm:h-[420px] p-3 lg:order-2 lg:sticky lg:top-24 lg:h-[680px] lg:ps-0' : 'h-[380px] sm:h-[480px] lg:h-[560px] p-3'}>
            <Ronda300Map focus={picked} places={matching} active={active} onPickStation={onPick} onPickPlace={pickOnMap} />
          </div>
          {picked ? (
            <div className="lg:order-1 p-4 md:p-5">
              {failed ? (
                <p role="alert" className="text-gray-700">{t('r3_osmError')}</p>
              ) : !places ? (
                <p role="status" className="text-gray-500">{t('loading')}</p>
              ) : places.length === 0 ? (
                <p className="text-gray-700">{t('r3_osmNone')}</p>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-[#222D52]">{t('r3_placesCount').replace('{n}', String(matching.length))}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{t('r3_listHint')}</p>
                  <ul ref={listRef} className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pe-1 lg:max-h-[580px] [scrollbar-width:thin]">
                    {matching.map((p) => {
                      const name = placeName(p, lang)
                      const on = active === p.osm_id
                      return (
                        <li
                          key={p.osm_id}
                          data-osm={p.osm_id}
                          onMouseEnter={() => setActive(p.osm_id)}
                          onFocus={() => setActive(p.osm_id)}
                          className={`flex items-center gap-4 rounded-[20px] bg-white p-3 transition-shadow ${on ? 'ring-2 ring-[#222D52] shadow-md' : 'shadow-[0_1px_3px_rgb(34_45_82/0.08)] hover:shadow-md'}`}
                        >
                          <span aria-hidden="true" className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${KIND_COLOR[p.kind]}1A`, color: KIND_COLOR[p.kind] }}>
                            <Icon name={KIND_ICON[p.kind]} size={28} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-gray-900 break-words">{name}</span>
                            <span className="mt-0.5 block text-sm text-gray-600">
                              {t(`r3k_${p.kind}` as TranslationKey)} · {t('r3_osmWalk').replace('{m}', String(p.distance_m)).replace('{min}', String(walkMinutes(p.distance_m)))}
                            </span>
                            <Link to={planToPoint(p, name)} className="mt-2 inline-flex h-8 items-center gap-1 rounded-full border-[1.5px] border-[#222D52] px-3 text-xs font-semibold text-[#222D52] hover:bg-[#222D52] hover:text-white transition-colors">
                              {t('planTripHere')}
                              <Icon name="chevronRight" size={14} className="rtl:rotate-180" />
                            </Link>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
      {picked && places && places.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">© OpenStreetMap contributors</a>
        </p>
      )}
    </section>
  )
}

export default Ronda300Explorer
