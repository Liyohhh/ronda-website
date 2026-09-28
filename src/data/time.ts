// "YYYY-MM-DD" and "HH:MM" for now in Malaysia (UTC+8, no daylight saving), as plan-trip expects
export function malaysiaNow() {
  const iso = new Date(Date.now() + 8 * 3600 * 1000).toISOString()
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) }
}

// "14:05" -> { h: "2", m: "05", ap: "PM" }
export function to12h(time: string) {
  const [H, m] = time.split(':')
  const h24 = Number(H)
  return { h: String(h24 % 12 || 12), m, ap: (h24 < 12 ? 'AM' : 'PM') as 'AM' | 'PM' }
}

// ("2", "05", "PM") -> "14:05"
export function from12h(h: string, m: string, ap: 'AM' | 'PM') {
  const h24 = (Number(h) % 12) + (ap === 'PM' ? 12 : 0)
  return `${String(h24).padStart(2, '0')}:${m}`
}

// "14:05" -> "2:05 PM"
export const format12h = (time: string) => {
  const t = to12h(time)
  return `${t.h}:${t.m} ${t.ap}`
}
