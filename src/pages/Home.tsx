import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Header from '../components/Header'
import JourneyPanel, { type TripOption } from '../components/JourneyPanel'
import StopIcon from '../components/StopIcon'
import { stopIconKind } from '../data/stopIcon'
import { useLanguage } from '../hooks/useLanguage'

// Set this to an image path (e.g. '/banner.jpg' in the public folder) when the banner is ready
const BANNER_IMAGE: string | null = '/Image/Banner.jpg'

type Stop = {
  stop_id: string
  stop_name: string
  category: string
  search: string
  feed_id: string
  stop_lat: number
  stop_lon: number
}

function Home() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'directions' | 'lines'>('directions')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [startStop, setStartStop] = useState<Stop | null>(null)
  const [endStop, setEndStop] = useState<Stop | null>(null)
  const [line, setLine] = useState('')
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null)
  const [suggestions, setSuggestions] = useState<Stop[]>([])

  // Trip planner results (shown in the right-side panel)
  const [options, setOptions] = useState<TripOption[]>([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [planError, setPlanError] = useState('')
  const [searchedFor, setSearchedFor] = useState<{ from: string; to: string } | null>(null)
  const [searchId, setSearchId] = useState(0)

  // Station autocomplete (live from Supabase)
  const query = activeField === 'start' ? start : activeField === 'end' ? end : ''
  const visibleSuggestions = query ? suggestions : []

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
      from: { lat: startStop.stop_lat, lon: startStop.stop_lon },
      to: { lat: endStop.stop_lat, lon: endStop.stop_lon },
    }

    setLoading(true)
    setPlanError('')
    setOptions([])
    setSearchedFor({ from: startStop.stop_name, to: endStop.stop_name })
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

  const pickSuggestion = (stop: Stop) => {
    if (activeField === 'start') {
      setStart(stop.stop_name)
      setStartStop(stop)
    }
    if (activeField === 'end') {
      setEnd(stop.stop_name)
      setEndStop(stop)
    }
    setActiveField(null)
    setSuggestions([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Banner (sits behind the search card, RedBus-style) */}
      <section className="relative">
        <div
          className="relative h-[320px] overflow-hidden bg-[#e8edf7] bg-cover bg-center"
          style={BANNER_IMAGE ? { backgroundImage: `url(${BANNER_IMAGE})` } : undefined}
        >
          {!BANNER_IMAGE && (
            <div className="absolute inset-4 border-2 border-dashed border-[#002472]/20 rounded-2xl flex items-end justify-end p-4">
              <span className="text-xs text-[#002472]/40">Banner image placeholder · 1920 × 320</span>
            </div>
          )}
          <div className="relative max-w-3xl mx-auto px-4 pt-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#ffffff]">{t('bannerTitle')}</h1>
            <p className="text-[#ffffff]/70 mt-2">{t('bannerSubtitle')}</p>
          </div>
        </div>

        {/* Search card overlapping the banner */}
        <div className="relative z-20 -mt-36 px-4 flex justify-center">
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

                {/* Suggestions: scrollable list with icons */}
                {visibleSuggestions.length > 0 && activeField && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border rounded-2xl shadow-lg overflow-hidden z-10">
                    <div className="max-h-80 overflow-y-auto overscroll-contain">
                      <div className="sticky top-0 z-10 bg-white text-xs text-gray-400 px-6 pt-3 pb-2 border-b border-gray-100">
                        {t('searchAnywhere')}
                      </div>
                      {visibleSuggestions.map((s) => (
                        <button
                          key={`${s.feed_id}:${s.stop_id}`}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            pickSuggestion(s)
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

      {/* Hero section */}
      <div className="mt-16 bg-[#002472] px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-white/20 rounded-full" />
              <span className="text-white/80 text-sm">{t('heroEyebrow')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {t('heroTitle')}
            </h2>
            <p className="text-white/70 text-lg mb-6">
              {t('heroText')}
            </p>
            <button className="bg-white text-[#002472] px-6 py-2 rounded-full font-semibold hover:bg-gray-100">
              {t('getApp')}
            </button>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="w-64 h-96 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white/40 text-sm">
              App screenshot
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
