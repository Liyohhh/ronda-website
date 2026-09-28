import { useEffect, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import SiteLayout from '../components/SiteLayout'
import TrailsSection from '../components/TrailsSection'
import JourneyPanel, { type TripOption, type ServiceNotice } from '../components/JourneyPanel'
import SuggestionList from '../components/SuggestionList'
import { buildItems, type Pick } from '../data/suggestions'
import { normaliseQuery, useSmartSearch } from '../hooks/useSmartSearch'
import { useLanguage } from '../hooks/useLanguage'

const LIST_ID = 'place-suggestions'

function Home() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'directions' | 'lines'>('directions')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [startStop, setStartStop] = useState<Pick | null>(null)
  const [endStop, setEndStop] = useState<Pick | null>(null)

  // "Plan a trip here" (Trails): /?to=<exact stop name>&toName=<shown name> fills in the End box,
  // then the params are cleared and the Start box gets focus
  const [params, setParams] = useSearchParams()
  const toParam = params.get('to')
  useEffect(() => {
    if (!toParam) return
    const shown = params.get('toName') || toParam
    let cancelled = false
    supabase.rpc('search_stops', { query: toParam }).then(({ data, error }) => {
      if (cancelled) return
      setParams({}, { replace: true })
      if (error || !data?.length) {
        console.error('Could not find destination station:', toParam, error)
        return
      }
      const stop = (data as { stop_name: string; stop_lat: number; stop_lon: number }[]).find((s) => s.stop_name === toParam) ?? data[0]
      setEnd(shown)
      setEndStop({ name: shown, lat: stop.stop_lat, lon: stop.stop_lon })
      const startBox = document.getElementById('start-input')
      startBox?.scrollIntoView({ block: 'center' })
      startBox?.focus()
    })
    return () => {
      cancelled = true
    }
  }, [toParam, params, setParams])
  const [line, setLine] = useState('')
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null)
  // keyboard-highlighted suggestion, tied to the query it was chosen for
  const [highlight, setHighlight] = useState<{ query: string; index: number }>({ query: '', index: -1 })

  // Trip planner results (shown in the right-side panel)
  const [options, setOptions] = useState<TripOption[]>([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [planError, setPlanError] = useState('')
  const [searchedFor, setSearchedFor] = useState<{ from: string; to: string } | null>(null)
  const [searchId, setSearchId] = useState(0)
  // After the last train / before the first one: when service (re)starts
  const [notice, setNotice] = useState<ServiceNotice>(null)

  // Smart search: stops + places for whichever box is focused
  const query = activeField === 'start' ? start : activeField === 'end' ? end : ''
  const { stops, places, loading: searching } = useSmartSearch(query)
  const items = query.trim() ? buildItems(stops, places) : []
  const listOpen = activeField !== null && items.length > 0
  const highlighted = highlight.query === normaliseQuery(query) ? highlight.index : -1

  // Arrow keys move through suggestions, Enter picks (or searches from the End box), Escape closes
  const onFieldKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const q = normaliseQuery(query)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setHighlight({ query: q, index: (highlighted + step + items.length) % items.length })
    } else if (e.key === 'Enter') {
      if (listOpen && highlighted >= 0) {
        e.preventDefault()
        pickSuggestion(items[highlighted].pick)
      } else if (activeField === 'end') handleSearch()
    } else if (e.key === 'Escape') {
      setActiveField(null)
    }
  }

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
    setNotice(null)
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
    const meta = data?.meta
    if (meta?.next_day?.first_departure) setNotice({ kind: 'tomorrow', time: meta.next_day.first_departure })
    else if (meta?.service_resumes) setNotice({ kind: 'resumes', time: meta.service_resumes })
  }

  const closePanel = () => {
    setSearchedFor(null)
    setOptions([])
    setNotice(null)
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
    setHighlight({ query: '', index: -1 })
  }

  return (
    <SiteLayout>
      {/* Hero: KL skyline, darkened so the white headline stands out; the search card overlaps its bottom */}
      <section className="relative">
        {/* Photo behind the whole hero; the white strip in the card row hides its lower part,
            so the photo always ends exactly halfway down the search card (pure CSS, any card height) */}
        <div className="absolute inset-0 overflow-hidden bg-[#001233]" aria-hidden="true">
          <picture>
            <source srcSet="/Image/banner-kl.webp" type="image/webp" />
            <img
              src="/Image/banner-kl.jpg"
              alt=""
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-[#001233]/85 via-[#001233]/60 to-[#001233]/80" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-10 md:pt-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white [text-shadow:0_2px_24px_rgb(0_18_51/0.6)]">
            {t('bannerTitle')}
          </h1>
          <p className="mt-3 text-lg md:text-xl text-white/85 [text-shadow:0_1px_12px_rgb(0_18_51/0.6)]">
            {t('bannerSubtitle')}
          </p>
        </div>

        {/* Search card: half on the photo, half on the white below it */}
        <div className="relative z-20 mt-10 px-4 flex justify-center">
          <div className="absolute inset-x-0 -bottom-px h-[calc(50%+1px)] bg-white" aria-hidden="true" />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl px-6 pt-4 pb-5">
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
            <div className="flex justify-center mt-3 relative">
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
                            onKeyDown={onFieldKey}
                            role="combobox"
                            id="start-input"
                            aria-label={t('start')}
                            aria-autocomplete="list"
                            aria-expanded={listOpen && activeField === 'start'}
                            aria-controls={LIST_ID}
                            aria-activedescendant={activeField === 'start' && highlighted >= 0 ? `${LIST_ID}-${highlighted}` : undefined}
                            autoComplete="off"
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
                            onKeyDown={onFieldKey}
                            role="combobox"
                            aria-label={t('end')}
                            aria-autocomplete="list"
                            aria-expanded={listOpen && activeField === 'end'}
                            aria-controls={LIST_ID}
                            aria-activedescendant={activeField === 'end' && highlighted >= 0 ? `${LIST_ID}-${highlighted}` : undefined}
                            autoComplete="off"
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
                {listOpen && (
                  <SuggestionList
                    id={LIST_ID}
                    items={items}
                    query={query}
                    loading={searching}
                    highlighted={highlighted}
                    onHover={(index) => setHighlight({ query: normaliseQuery(query), index })}
                    onPick={pickSuggestion}
                  />
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

      {/* Curated lifestyle routes */}
      <TrailsSection />

      {/* Journey results in the right-side panel */}
      <JourneyPanel
        key={searchId}
        open={searchedFor !== null}
        from={searchedFor?.from ?? ''}
        to={searchedFor?.to ?? ''}
        loading={loading}
        error={planError}
        options={options}
        notice={notice}
        onClose={closePanel}
      />

    </SiteLayout>
  )
}

export default Home
