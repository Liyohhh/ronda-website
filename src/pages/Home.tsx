import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import LinePicker from '../components/LinePicker'
import LinePanel from '../components/LinePanel'
import { LineGrid } from '../components/LineTiles'
import { matchLines, type Line } from '../data/lines'
import { useBusRoutes } from '../data/busRoutes'
import { supabase } from '../services/supabase'
import SiteLayout from '../components/SiteLayout'
import TrailsSection from '../components/TrailsSection'
import FeatureCarousel from '../components/FeatureCarousel'
import FeatureGrid from '../components/FeatureGrid'
import FeatureBand from '../components/FeatureBand'
import ReviewsSection from '../components/ReviewsSection'
import PromotionSection from '../components/PromotionSection'
import JourneyPanel, { type TripOption, type ServiceNotice, type Resident, type DepartAt, type Payment } from '../components/JourneyPanel'
import { outOfReachMessage } from '../data/outOfReach'
import SuggestionList from '../components/SuggestionList'
import { buildItems, type Pick } from '../data/suggestions'
import { normaliseQuery, useSmartSearch } from '../hooks/useSmartSearch'
import { useLanguage } from '../hooks/useLanguage'
import Icon from '../components/Icon'
import { useLocate } from '../hooks/useLocate'

const LIST_ID = 'place-suggestions'

function Home() {
  const { t } = useLanguage()
  // /?tab=lines opens the Lines tab (the "All lines" link on line pages)
  const [tab, setTab] = useState<'directions' | 'lines'>(() => (new URLSearchParams(window.location.search).get('tab') === 'lines' ? 'lines' : 'directions'))
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [startStop, setStartStop] = useState<Pick | null>(null)
  const [endStop, setEndStop] = useState<Pick | null>(null)

  // "Plan a trip here" (Trails): /?to=<exact stop name>&toName=<shown name> fills in the End box,
  // then the params are cleared and the Start box gets focus
  const [params, setParams] = useSearchParams()

  // /#explore (header Explore) and /#plan scroll to that part of Home, also when already on Home
  // (location.key changes on every navigation); #plan focuses the Start box, #plan-end the End box.
  // /?tab=lines (feature tile, old links) opens the Lines tab, also when already on Home.
  const { hash, key: navKey } = useLocation()
  const tabParam = params.get('tab')
  useEffect(() => {
    if (tabParam === 'lines') {
      const id = setTimeout(() => {
        setTab('lines')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 0)
      return () => clearTimeout(id)
    }
    const id = hash.slice(1)
    const target = id === 'plan-end' ? 'plan' : id
    const el = target ? document.getElementById(target) : null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (target !== 'plan') return
    const timer = setTimeout(() => {
      setTab('directions')
      // after the tab switch has rendered the boxes
      setTimeout(() => document.getElementById(id === 'plan-end' ? 'end-input' : 'start-input')?.focus({ preventScroll: true }), 0)
    }, 400)
    return () => clearTimeout(timer)
  }, [hash, navKey, tabParam])
  const toParam = params.get('to')
  // a place without a station (e.g. a coach terminal): /?toLat=&toLon=&toName=
  const toLat = Number(params.get('toLat')), toLon = Number(params.get('toLon'))
  const toPlace = params.get('toName') && Number.isFinite(toLat) && Number.isFinite(toLon) && params.get('toLat') && params.get('toLon')
  useEffect(() => {
    if (toParam || !toPlace) return
    const shown = params.get('toName')!
    let cancelled = false
    // after this render, like the station prefill below (which waits for its lookup)
    Promise.resolve().then(() => {
      if (cancelled) return
      setParams({}, { replace: true })
      setEnd(shown)
      setEndStop({ name: shown, lat: toLat, lon: toLon })
      const startBox = document.getElementById('start-input')
      startBox?.scrollIntoView({ block: 'center' })
      startBox?.focus()
    })
    return () => {
      cancelled = true
    }
  }, [toParam, toPlace, toLat, toLon, params, setParams])
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
  // Lines tab: dropdown open, keyboard-highlighted row, and the line shown in the side panel
  const [lineListOpen, setLineListOpen] = useState(false)
  const [busHint, setBusHint] = useState(false) // "Bus routes" tile pressed: the box asks for a bus route
  const [lineHi, setLineHi] = useState(-1)
  const [pickedLine, setPickedLine] = useState<Line | null>(null)
  const busLines = useBusRoutes() // every bus route, searchable in the Lines tab
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null)
  // keyboard-highlighted suggestion, tied to the query it was chosen for
  const [highlight, setHighlight] = useState<{ query: string; index: number }>({ query: '', index: -1 })

  // Trip planner results (shown in the right-side panel)
  const [options, setOptions] = useState<TripOption[]>([])
  const [moreOptions, setMoreOptions] = useState<TripOption[]>([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [planError, setPlanError] = useState('')
  const [searchedFor, setSearchedFor] = useState<{ from: string; to: string } | null>(null)
  const [searchId, setSearchId] = useState(0)
  // After the last train / before the first one: when service (re)starts
  const [notice, setNotice] = useState<ServiceNotice>(null)

  // Smart search: stops + places for whichever box is focused
  const query = activeField === 'start' ? start : activeField === 'end' ? end : ''
  const { stops, places, routeStops, loading: searching } = useSmartSearch(query)
  const items = query.trim() ? buildItems(stops, places, routeStops) : []
  const listOpen = activeField !== null && items.length > 0
  const highlighted = highlight.query === normaliseQuery(query) ? highlight.index : -1

  // Enter pressed while this query's suggestions are still loading: pick the top one when they arrive
  // (until then the list still shows the previous query's results); see the effect below pickSuggestion
  const pendingEnter = useRef<string | null>(null)

  // "Use my location" as the start: asks for the position only when the button is pressed
  const onLocated = useCallback((lat: number, lon: number) => {
    const pick = { name: t('myLocation'), lat, lon }
    setStart(pick.name)
    setStartStop(pick)
    setFormError('')
  }, [t])
  const { state: loc, locate } = useLocate(onLocated)
  const locError = loc.status === 'error'
    ? t(({ denied: 'locDenied', unavailable: 'locUnavailable', timeout: 'locTimeout', unsupported: 'locUnsupported' } as const)[loc.reason])
    : ''

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
        enterPick(items[highlighted].pick)
      } else if (q && (activeField === 'start' ? !startStop : activeField === 'end' && !endStop)) {
        // typed text not picked yet: take the top suggestion (now, or when this query's results arrive)
        e.preventDefault()
        if (!searching && items.length) enterPick(items[0].pick)
        else pendingEnter.current = q
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

  // Fares for Malaysians or tourists; remembered on this device
  const [resident, setResident] = useState<Resident>(() => {
    try {
      return localStorage.getItem('ronda.resident') === 'non_citizen' ? 'non_citizen' : 'citizen'
    } catch {
      return 'citizen'
    }
  })
  const changeResident = (r: Resident) => {
    setResident(r)
    try {
      localStorage.setItem('ronda.resident', r)
    } catch {
      // storage blocked: the choice lasts for this visit only
    }
    handleSearch({ res: r })
  }

  // Cashless (default) or cash / token fares; remembered on this device
  const [payment, setPayment] = useState<Payment>(() => {
    try {
      return localStorage.getItem('ronda.payment') === 'cash' ? 'cash' : 'cashless'
    } catch {
      return 'cashless'
    }
  })
  const changePayment = (p: Payment) => {
    setPayment(p)
    try {
      localStorage.setItem('ronda.payment', p)
    } catch {
      // storage blocked: the choice lasts for this visit only
    }
    handleSearch({ pay: p })
  }

  // Leave now, or at a date / time picked in the results panel
  const [departAt, setDepartAt] = useState<DepartAt>(null)
  const changeDepart = (d: DepartAt) => {
    setDepartAt(d)
    handleSearch({ when: d })
  }

  const pickLine = (l: Line) => {
    setPickedLine(l)
    setLineListOpen(false)
    setLineHi(-1)
  }
  const openFirstLine = () => {
    const found = matchLines(line, busLines)
    const l = found[lineHi >= 0 && lineHi < found.length ? lineHi : 0]
    if (l) pickLine(l)
  }
  const onLineKey = (e: React.KeyboardEvent) => {
    const n = matchLines(line, busLines).length
    if (e.key === 'ArrowDown') { e.preventDefault(); setLineListOpen(true); setLineHi((h) => Math.min(n - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setLineHi((h) => Math.max(0, h - 1)) }
    else if (e.key === 'Enter') openFirstLine()
    else if (e.key === 'Escape') setLineListOpen(false)
  }

  // Plan with the current boxes / options; `o` overrides them (panel edits pass the new values directly)
  const handleSearch = async (o: { res?: Resident; pay?: Payment; when?: DepartAt; from?: Pick; to?: Pick } = {}) => {
    const res = o.res ?? resident
    const pay = o.pay ?? payment
    const when = o.when !== undefined ? o.when : departAt
    const fromStop = o.from ?? startStop
    const toStop = o.to ?? endStop
    if (tab === 'lines') return openFirstLine()
    if (tab !== 'directions') return
    setActiveField(null)
    setFormError('')

    if (!fromStop || !toStop) {
      setFormError(t('chooseFromList'))
      return
    }

    // Planner defaults to leaving now (Malaysia time)
    const body = {
      from: { lat: fromStop.lat, lon: fromStop.lon },
      to: { lat: toStop.lat, lon: toStop.lon },
      resident: res,
      payment: pay,
      ...(when ?? {}),
    }

    setLoading(true)
    setPlanError('')
    setOptions([])
    setMoreOptions([])
    setNotice(null)
    setSearchedFor({ from: fromStop.name, to: toStop.name })
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
      // a place with no stop within walking reach gets the reason and the nearest stop
      setPlanError(outOfReachMessage(data?.meta?.out_of_reach, fromStop.name, toStop.name, t('outOfReach')) ?? t('noRoutes'))
      return
    }
    setOptions(found)
    setMoreOptions(data?.more_options ?? [])
    const meta = data?.meta
    if (meta?.next_day?.first_departure) setNotice({ kind: 'tomorrow', time: meta.next_day.first_departure })
    else if (meta?.service_resumes) setNotice({ kind: 'resumes', time: meta.service_resumes })
  }

  const closePanel = () => {
    setSearchedFor(null)
    setOptions([])
    setMoreOptions([])
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

  // Enter with a suggestion: take it (the highlighted one, else the top one); from the End box with a Start
  // already chosen, plan straight away
  const enterPick = (pick: Pick) => {
    const field = activeField
    pickSuggestion(pick)
    if (field === 'end' && startStop) handleSearch({ to: pick })
  }

  // a pending Enter is acted on once this query's results have loaded
  useEffect(() => {
    const pending = pendingEnter.current
    if (pending === null || searching) return
    pendingEnter.current = null
    if (pending === normaliseQuery(query) && items.length) enterPick(items[0].pick)
  })

  // a right-side panel is open: the chat launcher hides so it never covers the panel (ChatWidget)
  const sidePanel = pickedLine !== null || searchedFor !== null
  useEffect(() => {
    if (!sidePanel) return
    document.body.dataset.sidePanel = 'open'
    return () => { delete document.body.dataset.sidePanel }
  }, [sidePanel])

  return (
    <SiteLayout>
      {/* Hero: KL skyline photo, lighter than before (Batik palette): a light indigo wash plus a warm kunyit tint so the
          dusk reads golden, not grey; a soft scrim only behind the text keeps it readable (measured at 375 / 768 / 1440 px
          with scripts/hero-contrast.mjs); kunyit brush stroke under the headline; the search card overlaps its bottom */}
      <section className="relative overflow-x-clip">
        {/* Photo behind the whole hero; the light strip in the card row hides its lower part,
            so the photo always ends exactly halfway down the search card (pure CSS, any card height) */}
        <div className="absolute inset-0 overflow-hidden bg-[#18243F]" aria-hidden="true">
          <picture>
            <source srcSet="/Image/banner-kl.webp" type="image/webp" />
            <img
              src="/Image/banner-kl.jpg"
              alt=""
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
            />
          </picture>
          <div className="absolute inset-0 bg-[#D99A1E]/15 mix-blend-soft-light" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#18243F]/30 via-[#18243F]/5 to-[#18243F]/25" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-12 md:pt-16 text-center">
          <div className="relative inline-block px-4 py-2">
            {/* local scrim: darkens only behind the text, fading out at the edges */}
            <div
              className="absolute -inset-x-16 -inset-y-14 md:-inset-x-32 md:-inset-y-16 bg-[radial-gradient(closest-side,rgb(24_36_63/0.66)_0%,rgb(24_36_63/0.62)_62%,rgb(24_36_63/0.36)_84%,transparent_100%)]"
              aria-hidden="true"
            />
            <h1 className="relative text-4xl md:text-6xl font-extrabold tracking-tight text-white [text-shadow:0_2px_24px_rgb(24_36_63/0.7)]">
              {t('bannerTitle')}
              <svg className="absolute -bottom-3 md:-bottom-5 inset-x-[8%] w-[84%] h-3 md:h-4 text-accent" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8 C 60 2, 140 2, 200 6 S 280 10, 298 4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </h1>
            <p className="relative mt-7 text-xl font-bold md:text-2xl md:font-medium text-white/95 [text-shadow:0_1px_12px_rgb(24_36_63/0.8)]">
              {t('bannerSubtitle')}
            </p>
          </div>
        </div>

        {/* Search card: half on the photo, half on the light page below it */}
        <div className="relative z-20 mt-10 px-4 flex justify-center">
          <div className="absolute inset-x-0 -bottom-px h-[calc(50%+1px)] bg-gray-50" aria-hidden="true">
            {/* soga and kunyit stripes where the photo ends, like the border of a batik cloth */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(90deg,#8A5A3B_0_28px,#D99A1E_28px_56px)]" />
          </div>
          <div id="plan" className="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl px-5 md:px-10 pt-5 pb-7 scroll-mt-24">
            {/* Tab switcher */}
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setTab('directions')}
                  className={`px-10 py-2.5 rounded-full text-base font-semibold transition ${
                    tab === 'directions' ? 'bg-white text-black shadow' : 'text-gray-500'
                  }`}
                >
                  {t('directions')}
                </button>
                <button
                  onClick={() => setTab('lines')}
                  className={`px-10 py-2.5 rounded-full text-base font-semibold transition ${
                    tab === 'lines' ? 'bg-white text-black shadow' : 'text-gray-500'
                  }`}
                >
                  {t('lines')}
                </button>
              </div>
            </div>

            {/* Search bar + suggestions dropdown */}
            <div className="flex justify-center mt-4 relative">
              <div
                className="w-full max-w-5xl relative"
                onBlur={(e) => {
                  // Lines tab: the dropdown stays open while focus moves inside it (box -> tiles)
                  if (tab === 'lines' && !e.currentTarget.contains(e.relatedTarget as Node | null)) setLineListOpen(false)
                }}
              >
                <div className="bg-white rounded-full shadow-lg border flex items-center pe-2.5">
                  {tab === 'directions' ? (
                    <>
                      <div className="flex-1 flex items-center px-7 py-4">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">{t('start')}</div>
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
                            className="w-full text-lg outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={locate}
                          disabled={loc.status === 'locating'}
                          aria-label={t('useMyLocation')}
                          title={t('useMyLocation')}
                          className="ms-2 w-9 h-9 rounded-full text-[#1F2F5C] hover:bg-[#1F2F5C]/5 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                        >
                          <Icon name="myLocation" size={20} />
                        </button>
                      </div>

                      <button
                        onClick={handleSwap}
                        disabled={!start.trim() && !end.trim()}
                        className="w-12 h-12 rounded-full bg-[#1F2F5C] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-60"
                        aria-label={t('swapAria')}
                      >
                        <Icon name="swapVert" size={22} />
                      </button>

                      <div className="flex-1 flex items-center px-7 py-4">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">{t('end')}</div>
                          <input
                            type="text"
                            id="end-input"
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
                            className="w-full text-lg outline-none"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center px-7 py-4">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">{t('line')}</div>
                        <input
                          type="text"
                          id="line-input"
                          value={line}
                          onChange={(e) => {
                            setLine(e.target.value)
                            setLineListOpen(true)
                            setLineHi(-1)
                          }}
                          onFocus={() => setLineListOpen(true)}
                          onClick={() => setLineListOpen(true)}
                          onKeyDown={onLineKey}
                          role="combobox"
                          aria-expanded={lineListOpen}
                          aria-controls={line.trim() ? 'line-list' : 'line-panel'}
                          aria-activedescendant={lineListOpen && lineHi >= 0 ? `line-list-${lineHi}` : undefined}
                          autoComplete="off"
                          aria-label={t('line')}
                          placeholder={busHint ? t('busSearchPh') : t('linePh')}
                          className="w-full text-lg outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-[#18243F] flex items-center justify-center flex-shrink-0 disabled:opacity-60"
                    aria-label={t('searchAria')}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Icon name="search" size={20} />
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

                {/* Lines tab: every line as a tile as soon as the box is pressed; typing filters them (rail + bus) */}
                {tab === 'lines' && lineListOpen && line.trim() === '' && (
                  <div id="line-panel" role="region" aria-label={t('allLinesLabel')} className="absolute inset-x-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                    <LineGrid
                      buses={busLines}
                      onPick={pickLine}
                      onBus={() => {
                        setBusHint(true)
                        document.getElementById('line-input')?.focus()
                      }}
                    />
                  </div>
                )}
                {tab === 'lines' && lineListOpen && line.trim() !== '' && (
                  <LinePicker id="line-list" query={line} buses={busLines} highlighted={lineHi} onHover={setLineHi} onPick={pickLine} />
                )}

                {/* Form error (stop not picked from the list) */}
                {locError && (
                  <div className="mt-3 bg-amber-50 text-amber-900 text-sm rounded-lg px-4 py-3" role="status">{locError}</div>
                )}
                {formError && (
                  <div className="mt-3 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{formError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Below the search: trails (Explore), promotions (ads), the feature slides as a white card that sits over
          the top of the navy band, the feature tiles in the band, then rider reviews (app banner + footer follow in SiteLayout) */}
      <TrailsSection />
      <PromotionSection />
      <FeatureCarousel
        onPlan={() => {
          setTab('directions')
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setTimeout(() => document.getElementById('start-input')?.focus({ preventScroll: true }), 400)
        }}
        onLines={() => {
          setTab('lines')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
      <FeatureBand overlap>
        <FeatureGrid />
      </FeatureBand>
      <ReviewsSection />

      {/* Line stations in the right-side panel; "Plan a trip here" fills the End box */}
      {pickedLine && (
        <LinePanel
          line={pickedLine}
          onClose={() => setPickedLine(null)}
          onPick={setPickedLine}
          onPlan={(st) => {
            setPickedLine(null)
            setTab('directions')
            setEnd(st.name)
            setEndStop({ name: st.name, lat: st.lat, lon: st.lon })
            setTimeout(() => document.getElementById('start-input')?.focus(), 0)
          }}
        />
      )}

      {/* Journey results in the right-side panel */}
      <JourneyPanel
        key={searchId}
        open={searchedFor !== null}
        from={searchedFor?.from ?? ''}
        to={searchedFor?.to ?? ''}
        loading={loading}
        error={planError}
        options={options}
        moreOptions={moreOptions}
        notice={notice}
        resident={resident}
        onResidentChange={changeResident}
        payment={payment}
        onPaymentChange={changePayment}
        departAt={departAt}
        onDepartChange={changeDepart}
        onPlacesChange={({ from, to }) => {
          if (from) {
            setStart(from.name)
            setStartStop(from)
          }
          if (to) {
            setEnd(to.name)
            setEndStop(to)
          }
          handleSearch({ from, to })
        }}
        onClose={closePanel}
      />

    </SiteLayout>
  )
}

export default Home
