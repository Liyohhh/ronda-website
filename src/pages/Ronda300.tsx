import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import PageHero from '../components/PageHero'
import StationAroundMap from '../components/StationAroundMap'
import StationsPreviewMap from '../components/StationsPreviewMap'
import SuggestionList from '../components/SuggestionList'
import Icon from '../components/Icon'
import { buildItems, type Pick } from '../data/suggestions'
import type { TranslationKey } from '../i18n/translations'
import { useSmartSearch } from '../hooks/useSmartSearch'
import { useLanguage } from '../hooks/useLanguage'
import { KIND_COLOR, KIND_ICON, PLACE_KINDS, loadPlacesNear, placeName, planToPoint, walkMinutes, type NearPlace, type PlaceKind } from '../services/places'

const LIST_ID = 'r300-list'

// /ronda-300: a map of the rail stations to start from (or search), then the places within a short walk of the picked
// station, listed beside a map (from OpenStreetMap; merchants later)
function Ronda300() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const [picked, setPicked] = useState<Pick | null>(null)

  // stations only: places of the map search are not stations
  const { stops, loading } = useSmartSearch(query)
  const items = query.trim() ? buildItems(stops, []) : []
  const listOpen = open && items.length > 0

  const pick = (p: Pick) => {
    setPicked(p)
    setQuery(p.name)
    setOpen(false)
    setHi(-1)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && items.length) { e.preventDefault(); pick(items[Math.max(hi, 0)].pick) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <SiteLayout>
      <PageHero
        back={{ to: '/', label: t('backToHome') }}
        eyebrow={t('r3_tag')}
        title="RONDA 300"
        intro={t('r3_intro')}
      >
          <label htmlFor="r300-input" className="block text-sm font-semibold text-white/80">{t('r3_searchLabel')}</label>
          <div className="relative mt-2 max-w-xl">
            <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3.5 shadow-lg text-gray-900 focus-within:ring-2 focus-within:ring-gold">
              <Icon name="search" size={20} className="text-gray-500" />
              <input
                id="r300-input"
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(-1) }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={onKey}
                role="combobox"
                aria-expanded={listOpen}
                aria-controls={LIST_ID}
                aria-autocomplete="list"
                aria-activedescendant={listOpen && hi >= 0 ? `${LIST_ID}-${hi}` : undefined}
                autoComplete="off"
                placeholder={t('r3_searchPh')}
                className="w-full text-base outline-none"
              />
            </div>
            {listOpen && (
              <div className="absolute z-20 mt-2 w-full">
                <SuggestionList id={LIST_ID} items={items} query={query} loading={loading} highlighted={hi} onHover={setHi} onPick={pick} />
              </div>
            )}
          </div>
      </PageHero>

      <div className="wrap py-10">
        <div aria-live="polite">
          {!picked ? (
            <StationsPreviewMap onPick={pick} />
          ) : (
            <NearbyPlaces key={picked.name} at={picked} />
          )}
        </div>

        <section aria-labelledby="r3-merchant" className="mt-14 rounded-[28px] bg-[#222D52] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 id="r3-merchant" className="text-xl font-semibold">{t('navMerchantTitle')}</h2>
            <p className="mt-1 text-white/75">{t('navMerchantText')}</p>
          </div>
          <Link to="/help/general#business" className="self-start md:self-auto bg-gold text-[#222D52] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gold-hover">
            {t('navMerchantCta')}
          </Link>
        </section>
      </div>
    </SiteLayout>
  )
}

// Everything mapped on OpenStreetMap within 300 m of the picked station, nearest first: a filter by kind, then the
// list beside a map (the map stays in view while the list scrolls; on phones the map comes first). Pointing at a place
// in the list rings it on the map; pressing a dot on the map picks the place in the list.
function NearbyPlaces({ at }: { at: Pick }) {
  const { t, lang } = useLanguage()
  const [places, setPlaces] = useState<NearPlace[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [kind, setKind] = useState<PlaceKind | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    let live = true
    loadPlacesNear(at.lat, at.lon).then((p) => { if (live) setPlaces(p) }).catch(() => { if (live) setFailed(true) })
    return () => { live = false }
  }, [at.lat, at.lon])
  const kinds = PLACE_KINDS.filter((k) => places?.some((p) => p.kind === k))
  const matching = useMemo(() => (places ?? []).filter((p) => !kind || p.kind === kind), [places, kind])
  const pickOnMap = useCallback((id: string) => {
    setActive(id)
    const li = listRef.current?.querySelector<HTMLElement>(`[data-osm="${CSS.escape(id)}"]`)
    li?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])
  return (
    <section aria-labelledby="r3-osm" className="mt-10">
      <h2 id="r3-osm" className="text-[26px] md:text-[32px] font-semibold tracking-[-0.02em] text-[#222D52]">{t('r3_osmTitle').replace('{station}', at.name)}</h2>
      <p className="mt-1 text-sm text-gray-600 max-w-2xl">{t('r3_osmNote')}</p>
      {failed ? (
        <p role="alert" className="mt-3 text-gray-700">{t('r3_osmError')}</p>
      ) : !places ? (
        <p role="status" className="mt-3 text-gray-500">{t('loading')}</p>
      ) : places.length === 0 ? (
        <p className="mt-3 text-gray-700">{t('r3_osmNone')}</p>
      ) : (
        <>
          <div role="group" aria-label={t('r3_osmFilter')} className="mt-5 flex flex-wrap gap-2">
            {[null, ...kinds].map((k) => (
              <button
                key={k ?? 'all'}
                type="button"
                aria-pressed={kind === k}
                onClick={() => { setKind(k); setActive(null) }}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium transition-colors ${kind === k ? 'bg-[#222D52] text-white' : 'bg-gray-100 text-[#222D52] hover:bg-gray-200'}`}
              >
                {k && <span aria-hidden="true" className="flex" style={{ color: kind === k ? '#FFFFFF' : KIND_COLOR[k] }}><Icon name={KIND_ICON[k]} size={17} /></span>}
                {k ? t(`r3k_${k}` as TranslationKey) : t('r3_osmAll')}
                <span className={kind === k ? 'text-white/70' : 'text-gray-500'}>{k ? places.filter((p) => p.kind === k).length : places.length}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
            <div className="h-[340px] sm:h-[420px] lg:order-2 lg:sticky lg:top-24 lg:h-[640px]">
              <StationAroundMap station={{ name: at.name, lat: at.lat, lon: at.lon }} places={matching} active={active} onPick={pickOnMap} />
            </div>
            <ul ref={listRef} className="lg:order-1 space-y-2 max-h-[65vh] overflow-y-auto pe-1 lg:max-h-[640px] [scrollbar-width:thin]">
              {matching.map((p) => {
                const name = placeName(p, lang)
                const on = active === p.osm_id
                return (
                  <li
                    key={p.osm_id}
                    data-osm={p.osm_id}
                    onMouseEnter={() => setActive(p.osm_id)}
                    onFocus={() => setActive(p.osm_id)}
                    className={`flex items-start gap-3 rounded-[20px] border p-4 transition-colors ${on ? 'border-[#222D52] bg-white shadow-md' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                  >
                    <span aria-hidden="true" className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: KIND_COLOR[p.kind] }}>
                      <Icon name={KIND_ICON[p.kind]} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gray-900 break-words">{name}</span>
                      <span className="mt-0.5 block text-sm text-gray-600">
                        {t(`r3k_${p.kind}` as TranslationKey)} · {t('r3_osmWalk').replace('{m}', String(p.distance_m)).replace('{min}', String(walkMinutes(p.distance_m)))}
                      </span>
                      <Link to={planToPoint(p, name)} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#222D52] hover:underline">
                        {t('planTripHere')}
                        <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                      </Link>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">© OpenStreetMap contributors</a>
          </p>
        </>
      )}
    </section>
  )
}

export default Ronda300
