// Reads the simple OpenStreetMap opening_hours forms used by trail stops: "Mo-Su 10:00-22:00",
// "Mo-Th 19:00-23:00; Fr,Sa 18:30-24:00", "07:00-22:00" (every day), "Mo-Su 16:00-02:00" (past midnight),
// "PH,Mo-Su 10:00-22:00" (public holidays as listed). Anything else returns null and the page shows the text as is.

export type HoursRule = { days: number[]; open: number; close: number } // days 0 = Monday; minutes from midnight; close may be > 1440

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const ALL = [0, 1, 2, 3, 4, 5, 6]
const mins = (hm: string) => {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function parseDays(spec: string): number[] | null {
  const out = new Set<number>()
  for (const part of spec.split(',')) {
    if (part === 'PH') continue // holidays: same hours as the listed days
    const [a, b] = part.split('-')
    const i = DAYS.indexOf(a), j = b ? DAYS.indexOf(b) : i
    if (i < 0 || j < 0) return null
    for (let d = i; ; d = (d + 1) % 7) {
      out.add(d)
      if (d === j) break
    }
  }
  return out.size ? [...out].sort() : null
}

export function parseHours(text: string): HoursRule[] | null {
  const rules: HoursRule[] = []
  for (const raw of text.split(';').map((r) => r.trim()).filter(Boolean)) {
    const m = raw.match(/^(?:([A-Za-z,-]+)\s+)?(\d{2}:\d{2})-(\d{2}:\d{2})$/)
    if (!m) return null
    const days = m[1] ? parseDays(m[1]) : ALL
    if (!days) return null
    const open = mins(m[2])
    let close = mins(m[3])
    if (close <= open) close += 1440 // runs past midnight
    rules.push({ days, open, close })
  }
  return rules.length ? rules : null
}

// Monday-based weekday and minutes now, in Malaysia time
export function malaysiaNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  return { day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')), minute: Number(get('hour')) * 60 + Number(get('minute')) }
}

export type HoursStatus = { open: true; closes: number } | { open: false; opens: number | null }

// open now (and when it closes), or closed (and when it next opens: minutes from midnight, today or a later day)
export function hoursStatus(rules: HoursRule[], now = malaysiaNow()): HoursStatus {
  for (const r of rules) {
    if (r.days.includes(now.day) && now.minute >= r.open && now.minute < r.close) return { open: true, closes: r.close % 1440 }
    // still open from yesterday's late session
    if (r.close > 1440 && r.days.includes((now.day + 6) % 7) && now.minute < r.close - 1440) return { open: true, closes: r.close - 1440 }
  }
  for (let ahead = 0; ahead < 7; ahead++) {
    const day = (now.day + ahead) % 7
    const starts = rules.filter((r) => r.days.includes(day) && (ahead > 0 || r.open > now.minute)).map((r) => r.open)
    if (starts.length) return { open: false, opens: Math.min(...starts) }
  }
  return { open: false, opens: null }
}

export const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

// "Mon–Sun 10:00–22:00" with weekday names in the page language
export function describeHours(rules: HoursRule[], locale: string): string {
  const name = (d: number) => new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + d))) // 1 Jan 2024 = Monday
  const dayText = (days: number[]) => {
    if (days.length === 7) return `${name(0)}–${name(6)}`
    const runs: number[][] = []
    for (const d of days) {
      const last = runs[runs.length - 1]
      if (last && last[last.length - 1] === d - 1) last.push(d)
      else runs.push([d])
    }
    return runs.map((r) => (r.length > 2 ? `${name(r[0])}–${name(r[r.length - 1])}` : r.map(name).join(', '))).join(', ')
  }
  return rules.map((r) => `${dayText(r.days)} ${hhmm(r.open)}–${r.close % 1440 === 0 ? '24:00' : hhmm(r.close)}`).join('; ')
}
