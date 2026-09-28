// "YYYY-MM-DD" and "HH:MM" for now in Malaysia (UTC+8, no daylight saving), as plan-trip expects
export function malaysiaNow() {
  const iso = new Date(Date.now() + 8 * 3600 * 1000).toISOString()
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) }
}
