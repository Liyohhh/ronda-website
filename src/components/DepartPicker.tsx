import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { malaysiaNow } from '../data/time'

// Departure picker in RONDA's own style (the browser's date / time pickers follow the OS theme):
// day chips for the next week and a time card with hour / minute columns. Times are Malaysia time, 24h.
type Value = { date: string; time: string }
type Props = { value: Value; onChange: (v: Value) => void; onSubmit: () => void; onLeaveNow?: () => void }

const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, m) => String(m * 5).padStart(2, '0'))

// the next 7 days in Malaysia, as YYYY-MM-DD
function nextDays() {
  const today = malaysiaNow().date
  return Array.from({ length: 7 }, (_, i) => new Date(Date.parse(today + 'T00:00:00Z') + i * 86400000).toISOString().slice(0, 10))
}

function DepartPicker({ value, onChange, onSubmit, onLeaveNow }: Props) {
  const { t, lang } = useLanguage()
  const [timeOpen, setTimeOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const days = nextDays()
  const [hh, mm] = value.time.split(':')

  // close the time card on outside click / Escape
  useEffect(() => {
    if (!timeOpen) return
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setTimeOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setTimeOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [timeOpen])

  // scroll the selected hour / minute into view when the card opens
  useEffect(() => {
    if (timeOpen) box.current?.querySelectorAll('[aria-selected="true"]').forEach((el) => el.scrollIntoView({ block: 'center' }))
  }, [timeOpen])

  const dayLabel = (d: string, i: number) =>
    i === 0 ? t('todayLabel') : i === 1 ? t('tomorrow') : new Date(d + 'T00:00:00Z').toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${active ? 'bg-white text-[#002472]' : 'bg-white/10 text-white/85 hover:bg-white/20'}`

  const column = (items: string[], selected: string, pick: (v: string) => void, label: string) => (
    <ul role="listbox" aria-label={label} className="max-h-44 overflow-y-auto py-1 [scrollbar-width:thin]">
      {items.map((v) => (
        <li key={v}>
          <button
            type="button"
            role="option"
            aria-selected={v === selected}
            onClick={() => pick(v)}
            className={`w-full rounded-lg px-3 py-1.5 text-sm tabular-nums ${v === selected ? 'bg-[#002472] text-white font-semibold' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            {v}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <form
      className="mt-3 space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] -mx-1 px-1" role="group" aria-label={t('departDate')}>
        {days.map((d, i) => (
          <button key={d} type="button" aria-pressed={d === value.date} onClick={() => onChange({ ...value, date: d })} className={chip(d === value.date)}>
            <span className="inline-block first-letter:uppercase">{dayLabel(d, i)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative" ref={box}>
          <button
            type="button"
            onClick={() => setTimeOpen((o) => !o)}
            aria-expanded={timeOpen}
            aria-label={`${t('departTime')}: ${value.time}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-1.5 text-sm font-semibold text-white tabular-nums"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {value.time}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={timeOpen ? 'rotate-180' : ''}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {timeOpen && (
            <div className="absolute start-0 top-full mt-2 z-20 w-44 rounded-2xl bg-white shadow-xl border border-gray-200 p-2 grid grid-cols-2 gap-1">
              {column(HOURS, hh, (h) => onChange({ ...value, time: `${h}:${mm}` }), t('hourLabel'))}
              {column(MINUTES.includes(mm) ? MINUTES : [...MINUTES, mm].sort(), mm, (m) => onChange({ ...value, time: `${hh}:${m}` }), t('minuteLabel'))}
            </div>
          )}
        </div>

        <button type="submit" className="rounded-full bg-white text-[#002472] px-4 py-1.5 text-sm font-semibold hover:bg-gray-100">
          {t('showRoutes')}
        </button>
        {onLeaveNow && (
          <button type="button" onClick={onLeaveNow} className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/85 hover:text-white">
            {t('leaveNowBtn')}
          </button>
        )}
      </div>
    </form>
  )
}

export default DepartPicker
