import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { malaysiaNow, to12h, from12h } from '../data/time'
import Icon from './Icon'

// Departure picker in RONDA's own style (the browser's pickers follow the OS theme):
// a date pill with a calendar card and a time pill with an hour / minute stepper and an AM / PM switch.
// Changes apply by themselves shortly after the rider stops picking (no extra button).
type Value = { date: string; time: string } // YYYY-MM-DD, HH:MM (24h, Malaysia time)
type Props = { value: Value; onChange: (v: Value) => void; onLeaveNow?: () => void }

const MAX_DAYS_AHEAD = 90

const ymd = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (date: string, n: number) => ymd(new Date(Date.parse(date + 'T00:00:00Z') + n * 86400000))

// a pill button that opens a white card underneath; closes on outside click / Escape
function Popover({ label, icon, children, open, setOpen }: { label: string; icon: ReactNode; children: ReactNode; open: boolean; setOpen: (o: boolean) => void }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen])
  useEffect(() => {
    if (open) box.current?.querySelectorAll('[data-scroll-to="true"]').forEach((el) => el.scrollIntoView({ block: 'center' }))
  }, [open])
  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-1.5 text-sm font-semibold text-white tabular-nums"
      >
        {icon}
        {label}
        <Icon name="expandMore" size={12} className={open ? 'rotate-180' : ''} />
      </button>
      {open && <div className="absolute start-0 top-full mt-2 z-20 rounded-2xl bg-white shadow-xl border border-gray-200 p-3">{children}</div>}
    </div>
  )
}

// up / down arrow for the time stepper
function Step({ dir, onClick, label }: { dir: 1 | -1; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="w-10 h-7 rounded-lg text-gray-500 hover:text-[#002472] hover:bg-gray-100 flex items-center justify-center">
      <Icon name={dir === 1 ? 'expandLess' : 'expandMore'} size={16} />
    </button>
  )
}

function DepartPicker({ value, onChange, onLeaveNow }: Props) {
  const { t, lang } = useLanguage()
  const today = malaysiaNow().date
  const [draft, setDraft] = useState(value)
  const [dateOpen, setDateOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [month, setMonth] = useState(draft.date.slice(0, 7)) // YYYY-MM shown in the calendar
  const timer = useRef<number | undefined>(undefined)

  // apply a change after a short pause, so picking hour, minute and AM/PM runs one search
  const update = (v: Value, delay = 700) => {
    setDraft(v)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onChange(v), delay)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const t12 = to12h(draft.time)
  // move the time by n minutes (wraps round midnight); minutes snap to 5
  const stepTime = (n: number) => {
    const [H, M] = draft.time.split(':').map(Number)
    const mins = (((H * 60 + Math.round(M / 5) * 5 + n) % 1440) + 1440) % 1440
    update({ ...draft, time: `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}` })
  }
  const dateLabel = draft.date === today
    ? t('todayLabel')
    : draft.date === addDays(today, 1)
      ? t('tomorrow')
      : new Date(draft.date + 'T00:00:00Z').toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

  // calendar grid for `month`, weeks starting Monday
  const first = new Date(month + '-01T00:00:00Z')
  const lead = (first.getUTCDay() + 6) % 7
  const daysIn = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)]
  const last = addDays(today, MAX_DAYS_AHEAD)
  const shiftMonth = (n: number) => {
    const d = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + n, 1))
    setMonth(ymd(d).slice(0, 7))
  }
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(lang, { weekday: 'narrow', timeZone: 'UTC' }))

  const calIcon = (
    <Icon name="calendarMonthOutline" size={14} />
  )
  const clockIcon = (
    <Icon name="scheduleOutline" size={14} />
  )

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Popover label={dateLabel} icon={calIcon} open={dateOpen} setOpen={(o) => { setDateOpen(o); if (o) setMonth(draft.date.slice(0, 7)) }}>
        <div className="w-64" role="group" aria-label={t('departDate')}>
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => shiftMonth(-1)} disabled={month <= today.slice(0, 7)} aria-label={t('scrollPrev')} className="w-8 h-8 rounded-full text-[#002472] hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center">
              <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
            </button>
            <span className="text-sm font-semibold text-gray-900">{first.toLocaleDateString(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
            <button type="button" onClick={() => shiftMonth(1)} disabled={month >= last.slice(0, 7)} aria-label={t('scrollNext')} className="w-8 h-8 rounded-full text-[#002472] hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center">
              <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {weekdays.map((w, i) => (
              <span key={i} className="text-[11px] font-semibold text-gray-500 py-1">{w}</span>
            ))}
            {cells.map((d, i) =>
              d === null ? (
                <span key={`x${i}`} />
              ) : (
                <button
                  key={d}
                  type="button"
                  disabled={d < today || d > last}
                  aria-pressed={d === draft.date}
                  onClick={() => {
                    setDateOpen(false)
                    update({ ...draft, date: d }, 0)
                  }}
                  className={`h-8 rounded-full text-sm tabular-nums disabled:text-gray-300 disabled:hover:bg-transparent ${
                    d === draft.date ? 'bg-[#002472] text-white font-semibold' : d === today ? 'text-[#002472] font-semibold ring-1 ring-[#002472]/30 hover:bg-gray-100' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {Number(d.slice(8))}
                </button>
              ),
            )}
          </div>
        </div>
      </Popover>

      <Popover label={`${t12.h}:${t12.m} ${t12.ap}`} icon={clockIcon} open={timeOpen} setOpen={setTimeOpen}>
        <div className="flex items-center gap-3" role="group" aria-label={t('departTime')}>
          <div className="flex flex-col items-center">
            <Step dir={1} onClick={() => stepTime(60)} label={t('hourLabel') + ' +'} />
            <span className="text-2xl font-semibold text-gray-900 tabular-nums w-10 text-center">{t12.h}</span>
            <Step dir={-1} onClick={() => stepTime(-60)} label={t('hourLabel') + ' −'} />
          </div>
          <span className="text-2xl font-semibold text-gray-300 -mt-0.5">:</span>
          <div className="flex flex-col items-center">
            <Step dir={1} onClick={() => stepTime(5)} label={t('minuteLabel') + ' +'} />
            <span className="text-2xl font-semibold text-gray-900 tabular-nums w-10 text-center">{t12.m}</span>
            <Step dir={-1} onClick={() => stepTime(-5)} label={t('minuteLabel') + ' −'} />
          </div>
          <div className="ms-1 flex flex-col rounded-xl bg-gray-100 p-0.5">
            {(['AM', 'PM'] as const).map((ap) => (
              <button
                key={ap}
                type="button"
                aria-pressed={t12.ap === ap}
                onClick={() => t12.ap !== ap && update({ ...draft, time: from12h(t12.h, t12.m, ap) })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${t12.ap === ap ? 'bg-[#002472] text-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {ap}
              </button>
            ))}
          </div>
        </div>
      </Popover>

      {onLeaveNow && (
        <button type="button" onClick={onLeaveNow} className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/85 hover:text-white">
          {t('leaveNowBtn')}
        </button>
      )}
    </div>
  )
}

export default DepartPicker
