import { supabase } from './supabase'

// Anonymous usage events for the admin dashboard (same table and kinds as the mobile app: analytics_events, see
// docs/ANALYTICS_EVENTS.md in the database repo). Each browser gets a random device id kept in localStorage; the
// account id is added only when the person is signed in. No names, emails or exact positions are sent. Nothing is
// sent when the browser asks not to be tracked (Do Not Track / Global Privacy Control) or storage is blocked.
// Sending never blocks or breaks the page: errors are ignored.

export type EventName = 'app_open' | 'search' | 'plan_trip' | 'trip_open' | 'live_share_start' | 'place_view' | 'place_go' | 'trail_view' | 'alert_seen'

const DEVICE_KEY = 'ronda.device'
const OPEN_KEY = 'ronda.opened'

export function optedOut(): boolean {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean }
  return n.doNotTrack === '1' || n.globalPrivacyControl === true
}

// a random 32-character id for this browser (made on the first event)
export function deviceId(): string | null {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '')
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

const lang = () => document.documentElement.lang || 'en'

export async function track(name: EventName, payload: Record<string, string | number | null | undefined> = {}) {
  if (optedOut()) return
  const device = deviceId()
  if (!device) return
  try {
    const { data } = await supabase.auth.getSession()
    await supabase.from('analytics_events').insert({
      event_name: name,
      device_id: device,
      user_id: data.session?.user.id ?? null,
      payload: { ...payload, platform: 'web', lang: lang() },
    })
  } catch {
    // the dashboard can do without one event
  }
}

// once per browser per Malaysia day: counts this person as active today
export function trackOpen() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })
  try {
    if (localStorage.getItem(OPEN_KEY) === today) return
    localStorage.setItem(OPEN_KEY, today)
  } catch {
    return
  }
  void track('app_open')
}

// each thing at most once per page visit (an alert seen on several trips counts once)
const sent = new Set<string>()
export function trackOnce(key: string, name: EventName, payload: Record<string, string | number | null | undefined> = {}) {
  if (sent.has(key)) return
  sent.add(key)
  void track(name, payload)
}
