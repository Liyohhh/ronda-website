import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import SiteLayout from '../components/SiteLayout'
import BrandLogo from '../components/BrandLogo'
import JourneyPanel, { type TripOption } from '../components/JourneyPanel'
import StopIcon from '../components/StopIcon'
import { stopIconKind, type StopIconKind } from '../data/stopIcon'
import { useLanguage } from '../hooks/useLanguage'

type Stop = {
  stop_id: string
  stop_name: string
  category: string
  search: string
  feed_id: string
  stop_lat: number
  stop_lon: number
}

// Any place in Malaysia, from the geocode Edge Function (OpenStreetMap via Photon)
type Place = { name: string; detail: string; lat: number; lon: number; kind: string; osm: string }

// What the user picked as Start / End: a stop or a place
type Pick = { name: string; lat: number; lon: number }

const PLACE_KINDS: StopIconKind[] = ['airport', 'hospital', 'school', 'mall', 'mosque', 'home', 'building', 'place']
const placeKind = (k: string): StopIconKind => (PLACE_KINDS.includes(k as StopIconKind) ? (k as StopIconKind) : 'place')

function Home() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'directions' | 'lines'>('directions')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [startStop, setStartStop] = useState<Pick | null>(null)
  const [endStop, setEndStop] = useState<Pick | null>(null)
  const [line, setLine] = useState('')
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null)
  const [suggestions, setSuggestions] = useState<Stop[]>([])
  const [places, setPlaces] = useState<Place[]>([])

  // Trip planner results (shown in the right-side panel)
  const [options, setOptions] = useState<TripOption[]>([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [planError, setPlanError] = useState('')
  const [searchedFor, setSearchedFor] = useState<{ from: string; to: string } | null>(null)
  const [searchId, setSearchId] = useState(0)

  // Station autocomplete (live from Supabase)
  const query = activeField === 'start' ? start : activeField === 'end' ? end : ''
  // keep the stop list short so matching places stay in view below it
  const visibleSuggestions = query ? suggestions.slice(0, 8) : []
  const visiblePlaces = query.trim().length >= 3 ? places : []

  useEffect(() => {
    if (!query) return

    const controller = new AbortController()

    const fetchSuggestions = async () => {
      const { data, error } = await supabase.rpc('search_stops', { query })

      if (error) {
        console.error('Supabase search error:', error)
        return
      }

      if (!controller.signal.aborted) {
        setSuggestions(data || [])
      }
    }

    fetchSuggestions()

    return () => controller.abort()
  }, [query])

  // Place autocomplete (KLIA, Pandan Perdana, malls...), debounced: the geocoder is a shared service
  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) return

    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke('geocode', { body: { q } })
      if (cancelled) return
      if (error || data?.error) {
        console.error('Place search error:', error || data?.error)
        setPlaces([])
        return
      }
      setPlaces(data?.results ?? [])
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const handleSwap = () => {
    setStart(end)
    setEnd(start)
    setStartStop(endStop)
    setEndStop(startStop)
  }

  const handleSearch = async () => {
    if (tab !== 'directions') return
    setActiveField(null)
    setFormError('')

    if (!startStop || !endStop) {
      setFormError(t('chooseFromList'))
      return
    }

    // Planner defaults to leaving now (Malaysia time)
    const body = {
      from: { lat: startStop.lat, lon: startStop.lon },
      to: { lat: endStop.lat, lon: endStop.lon },
    }

    setLoading(true)
    setPlanError('')
    setOptions([])
    setSearchedFor({ from: startStop.name, to: endStop.name })
    setSearchId((n) => n + 1)

    const { data, error } = await supabase.functions.invoke('plan-trip', { body })
    setLoading(false)

    if (error || data?.error) {
      console.error('Trip planner error:', error || data?.error)
      setPlanError(t('planError'))
      return
    }

    const found: TripOption[] = data?.options ?? []
    if (found.length === 0) {
      setPlanError(t('noRoutes'))
      return
    }
    setOptions(found)
  }

  const closePanel = () => {
    setSearchedFor(null)
    setOptions([])
    setPlanError('')
  }

  const pickSuggestion = (pick: Pick) => {
    if (activeField === 'start') {
      setStart(pick.name)
      setStartStop(pick)
    }
    if (activeField === 'end') {
      setEnd(pick.name)
      setEndStop(pick)
    }
    setActiveField(null)
    setSuggestions([])
    setPlaces([])
  }

  return (
    <SiteLayout>
      {/* Hero: KL skyline, darkened so the white headline stands out; the search card overlaps its bottom */}
      <section className="relative">
        <div className="relative h-[420px] md:h-[480px] overflow-hidden bg-[#001233]">
          <picture>
            <source srcSet="/Image/banner-kl.webp" type="image/webp" />
            <img
              src="/Image/banner-kl.jpg"
              alt=""
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-[#001233]/85 via-[#001233]/55 to-[#001233]/80" />
          <div className="relative max-w-4xl mx-auto px-4 pt-14 md:pt-20 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white [text-shadow:0_2px_24px_rgb(0_18_51/0.6)]">
              {t('bannerTitle')}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/85 [text-shadow:0_1px_12px_rgb(0_18_51/0.6)]">
              {t('bannerSubtitle')}
            </p>
          </div>
        </div>

        {/* Search card overlapping the banner */}
        <div className="relative z-20 -mt-44 md:-mt-40 px-4 flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl px-6 pt-5 pb-6">
            {/* Tab switcher */}
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setTab('directions')}
                  className={`px-8 py-2 rounded-full text-sm font-semibold transition ${
                    tab === 'directions' ? 'bg-white text-black shadow' : 'text-gray-500'
                  }`}
                >
                  {t('directions')}
                </button>
                <button
                  onClick={() => setTab('lines')}
                  className={`px-8 py-2 rounded-full text-sm font-semibold transition ${
                    tab === 'lines' ? 'bg-white text-black shadow' : 'text-gray-500'
                  }`}
                >
                  {t('lines')}
                </button>
              </div>
            </div>

            {/* Search bar + suggestions dropdown */}
            <div className="flex justify-center mt-5 relative">
              <div className="w-full max-w-3xl relative">
                <div className="bg-white rounded-full shadow-lg border flex items-center pe-2">
                  {tab === 'directions' ? (
                    <>
                      <div className="flex-1 flex items-center px-6 py-3">
                        <div className="flex-1">
                          <div className="text-xs text-gray-400">{t('start')}</div>
                          <input
                            type="text"
                            value={start}
                            onChange={(e) => {
                              setStart(e.target.value)
                              setStartStop(null)
                            }}
                            onFocus={() => setActiveField('start')}
                            onBlur={() => setTimeout(() => setActiveField((f) => (f === 'start' ? null : f)), 150)}
                            placeholder={t('startPh')}
                            className="w-full text-base outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-full bg-[#002472] text-white flex items-center justify-center flex-shrink-0"
                        aria-label="Swap"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
                        </svg>
                      </button>

                      <div className="flex-1 flex items-center px-6 py-3">
                        <div className="flex-1">
                          <div className="text-xs text-gray-400">{t('end')}</div>
                          <input
                            type="text"
                            value={end}
                            onChange={(e) => {
                              setEnd(e.target.value)
                              setEndStop(null)
                            }}
                            onFocus={() => setActiveField('end')}
                            onBlur={() => setTimeout(() => setActiveField((f) => (f === 'end' ? null : f)), 150)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t('endPh')}
                            className="w-full text-base outline-none"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center px-6 py-3">
                      <div className="flex-1">
                        <div className="text-xs text-gray-400">{t('line')}</div>
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => setLine(e.target.value)}
                          placeholder={t('linePh')}
                          className="w-full text-base outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-12 h-12 rounded-full bg-[#002472] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-60"
                    aria-label="Search"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Suggestions: stations & stops first, then any place (OpenStreetMap) */}
                {(visibleSuggestions.length > 0 || visiblePlaces.length > 0) && activeField && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border rounded-2xl shadow-lg overflow-hidden z-10">
                    <div className="max-h-96 overflow-y-auto overscroll-contain">
                      <div className="sticky top-0 z-10 bg-white text-xs text-gray-400 px-6 pt-3 pb-2 border-b border-gray-100">
                        {t('searchAnywhere')}
                      </div>
                      {visibleSuggestions.length > 0 && (
                        <div role="group" aria-label={t('stationsHeading')}>
                          <div className="px-6 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {t('stationsHeading')}
                          </div>
                          {visibleSuggestions.map((s) => (
                            <button
                              key={`${s.feed_id}:${s.stop_id}`}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                pickSuggestion({ name: s.stop_name, lat: s.stop_lat, lon: s.stop_lon })
                              }}
                              className="w-full text-start px-6 py-2.5 flex items-center gap-3 hover:bg-gray-50"
                            >
                              <StopIcon kind={stopIconKind(s.stop_name, s.category)} />
                              <div className="min-w-0">
                                <div className="text-gray-800 truncate">{s.stop_name}</div>
                                <div className="text-xs text-gray-500 truncate">{s.category}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {visiblePlaces.length > 0 && (
                        <div role="group" aria-label={t('placesHeading')} className="border-t border-gray-100">
                          <div className="px-6 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {t('placesHeading')}
                          </div>
                          {visiblePlaces.map((p) => (
                            <button
                              key={p.osm || `${p.name}:${p.lat}:${p.lon}`}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                pickSuggestion({ name: p.name, lat: p.lat, lon: p.lon })
                              }}
                              className="w-full text-start px-6 py-2.5 flex items-center gap-3 hover:bg-gray-50"
                            >
                              <StopIcon kind={placeKind(p.kind)} />
                              <div className="min-w-0">
                                <div className="text-gray-800 truncate">{p.name}</div>
                                {p.detail && <div className="text-xs text-gray-500 truncate">{p.detail}</div>}
                              </div>
                            </button>
                          ))}
                          <div className="px-6 py-2 text-[11px] text-gray-400">
                            ©{' '}
                            <a
                              href="https://www.openstreetmap.org/copyright"
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-gray-600"
                            >
                              OpenStreetMap
                            </a>{' '}
                            contributors
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form error (stop not picked from the list) */}
                {formError && (
                  <div className="mt-3 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{formError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey results in the right-side panel */}
      <JourneyPanel
        key={searchId}
        open={searchedFor !== null}
        from={searchedFor?.from ?? ''}
        to={searchedFor?.to ?? ''}
        loading={loading}
        error={planError}
        options={options}
        onClose={closePanel}
      />

      {/* Why ride with us */}
      <section className="mt-12 bg-[#002472] px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#C9A45C]" aria-hidden="true" />
              <span className="text-white/80 text-sm font-medium uppercase tracking-wider">{t('heroEyebrow')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {t('heroTitle')}
            </h2>
            <p className="text-white/70 text-lg mb-6">
              {t('heroText')}
            </p>
            <a
              href="#download"
              className="inline-flex items-center h-11 bg-white text-[#002472] px-6 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('getApp')}
            </a>
          </div>

          {/* Phone mockup until real app screenshots exist */}
          <div className="flex justify-center md:justify-end" aria-hidden="true">
            <div className="w-60 h-[26rem] rounded-[2.5rem] border-[10px] border-[#001233] bg-gradient-to-b from-white to-[#e8edf7] shadow-2xl flex flex-col items-center justify-center gap-4">
              <BrandLogo size="lg" className="flex-col !gap-4" />
              <span className="px-4 text-center text-[10px] font-medium tracking-[0.2em] text-[#002472]/60">
                DISCOVER · EXPLORE · ENJOY
              </span>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}

export default Home
