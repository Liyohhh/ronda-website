import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

type Stop = {
  stop_id: string
  stop_name: string
  category: string
  search: string
}

function Home() {
  const [tab, setTab] = useState<'directions' | 'lines'>('directions')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [line, setLine] = useState('')
  const [journey, setJourney] = useState<any>(null)
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null)
  const [suggestions, setSuggestions] = useState<Stop[]>([])

  useEffect(() => {
    const query =
      activeField === 'start' ? start : activeField === 'end' ? end : ''

    if (!query || query.length < 1) {
      setSuggestions([])
      return
    }

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
  }, [start, end, activeField])

  const handleSwap = () => {
    setStart(end)
    setEnd(start)
  }

  const handleSearch = () => {
    if (tab !== 'directions' || !start || !end) return
    setActiveField(null)

    setJourney({
      from: start,
      to: end,
      totalDuration: 52,
      steps: [
        { type: 'walk', description: 'Walk to nearest station', duration: 3 },
        {
          type: 'transit',
          line: 'LRT Kelana Jaya Line',
          color: '#E30613',
          from: start,
          to: 'KL Sentral',
          duration: 15,
          stops: 6,
        },
        { type: 'walk', description: 'Transfer to next platform', duration: 5 },
        {
          type: 'transit',
          line: 'MRT Kajang Line',
          color: '#00A651',
          from: 'KL Sentral',
          to: end,
          duration: 27,
          stops: 8,
        },
        { type: 'walk', description: `Walk to ${end}`, duration: 2 },
      ],
    })
  }

  const pickSuggestion = (stop: Stop) => {
    const label = `${stop.category} ${stop.stop_name}`
    if (activeField === 'start') setStart(label)
    if (activeField === 'end') setEnd(label)
    setActiveField(null)
    setSuggestions([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#002472] rounded-full" />
          <span className="font-bold text-lg text-[#002472]">RONDA</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="appearance-none border rounded pl-3 pr-10 py-1 text-sm text-gray-600">
              <option>English</option>
              <option>Bahasa Melayu</option>
              <option>中文</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
            </svg>
          </div>

          <Link
            to="/login"
            className="text-sm border border-[#002472] text-[#002472] px-4 py-1 rounded-full font-medium hover:bg-[#002472] hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center mt-8">
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setTab('directions')}
            className={`px-8 py-2 rounded-full text-sm font-semibold transition ${
              tab === 'directions' ? 'bg-white text-black shadow' : 'text-gray-500'
            }`}
          >
            Directions
          </button>
          <button
            onClick={() => setTab('lines')}
            className={`px-8 py-2 rounded-full text-sm font-semibold transition ${
              tab === 'lines' ? 'bg-white text-black shadow' : 'text-gray-500'
            }`}
          >
            Lines
          </button>
        </div>
      </div>

      {/* Search bar + suggestions dropdown */}
      <div className="flex justify-center mt-6 px-4 relative">
        <div className="w-full max-w-3xl relative">
          <div className="bg-white rounded-full shadow-lg border flex items-center pr-2">
            {tab === 'directions' ? (
              <>
                <div className="flex-1 flex items-center px-6 py-3">
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Start</div>
                    <input
                      type="text"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      onFocus={() => setActiveField('start')}
                      onBlur={() => setTimeout(() => setActiveField(null), 150)}
                      placeholder="Choose starting point"
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
                    <div className="text-xs text-gray-400">End</div>
                    <input
                      type="text"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      onFocus={() => setActiveField('end')}
                      onBlur={() => setTimeout(() => setActiveField(null), 150)}
                      placeholder="Choose destination"
                      className="w-full text-base outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center px-6 py-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Line</div>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    placeholder="Search for a line"
                    className="w-full text-base outline-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSearch}
              className="w-12 h-12 rounded-full bg-[#002472] text-white flex items-center justify-center flex-shrink-0"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </div>

          {suggestions.length > 0 && activeField && (
            <div className="absolute left-0 right-0 mt-2 bg-white border rounded-2xl shadow-lg overflow-hidden z-10">
              <div className="text-xs text-gray-400 px-6 pt-3 pb-1">
                Search anywhere in Malaysia
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.stop_id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    pickSuggestion(s)
                  }}
                  className="w-full text-left px-6 py-3 flex items-center gap-3 hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded bg-[#002472] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {s.category}
                  </div>
                  <span className="text-gray-800">{s.stop_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Journey results (only shows after search) */}
      {journey && (
        <div className="flex justify-center mt-6 px-4">
          <div className="w-full max-w-3xl">
            <div className="mb-4">
              <div className="text-sm text-gray-500">Your journey</div>
              <h2 className="text-xl font-bold">{journey.from} → {journey.to}</h2>
              <div className="text-gray-600 text-sm">{journey.totalDuration} min total</div>
            </div>

            <div className="border rounded-lg divide-y bg-white">
              {journey.steps.map((step: any, i: number) => (
                <div key={i} className="p-4 flex items-start gap-4">
                  {step.type === 'walk' ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                          <circle cx="12" cy="4" r="2"/>
                          <path d="M12 6v6l-3 8M12 12l3 8M9 10l-4 2"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.description}</div>
                        <div className="text-sm text-gray-500">{step.duration} min walk</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                        style={{ backgroundColor: step.color }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="4" width="16" height="16" rx="2"/>
                          <path d="M4 12h16"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.line}</div>
                        <div className="text-sm text-gray-600">{step.from} → {step.to}</div>
                        <div className="text-sm text-gray-500">{step.duration} min · {step.stops} stops</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4 italic">
              Journey computation is still mocked. Station data is now live from the database.
            </p>
          </div>
        </div>
      )}

      {/* Hero section */}
      <div className="mt-16 bg-[#002472] px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-white/20 rounded-full" />
              <span className="text-white/80 text-sm">Why ride with us?</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Get anywhere with RONDA in Malaysia
            </h1>
            <p className="text-white/70 text-lg mb-6">
              One app for MRT, LRT, KTM, Monorail, and buses. Plan smarter, discover more.
            </p>
            <button className="bg-white text-[#002472] px-6 py-2 rounded-full font-semibold hover:bg-gray-100">
              Get the app
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