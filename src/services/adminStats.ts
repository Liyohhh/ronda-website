import { supabase } from './supabase'

// The admin dashboard's numbers, from the admin_dashboard() database function (admins only; the app's admin screen
// reads the same function). Active users come from "app opened" events (app and website, anonymous device id);
// the rest from the last 30 days of events, accounts from Supabase Auth.

export type Point = { d: string; n: number; s: number } // d = start of the day / week / month; n = active, s = signed in
export type AdminStats = {
  active_today: number
  active_week: number
  active_month: number
  active_today_prev: number
  active_week_prev: number
  active_month_prev: number
  signed_in_today: number
  stickiness: number | null // 0..1
  active_daily: Point[]
  active_weekly: Point[]
  active_monthly: Point[]
  cohorts: { w: string; n: number; w1: number | null; w2: number | null; w4: number | null }[]
  busy_hours: { dow: number; h: number; n: number }[] // dow 1 = Monday
  top_trips: { from: string; to: string; n: number }[]
  hot_stations: { s: string; n: number }[]
  top_searches: { q: string; n: number }[]
  no_result_searches: { q: string; n: number }[]
  live_shares: number
  live_shares_prev: number
  live_share_minutes: number | null
  platforms: { p: string; n: number }[]
  languages: { l: string; n: number }[]
  funnel: { search: number; plan: number; open: number; share: number }
  places: { id: string; name: string | null; views: number; go: number }[]
  trails: { slug: string; views: number }[]
  alert_reach: { id: string; title: string; n: number; first: string }[]
  accounts: number
  accounts_new_week: number
  countries: { c: string | null; n: number }[]
  // added 3 Nov 2026 (missing before that database update, so optional): searches and trips planned per day,
  // data and systems
  daily_events?: { d: string; search: number; plan: number }[]
  ops?: Ops
}

export type Ops = {
  feeds_total: number
  feeds_published: number
  feeds: { id: string; name: string; status: string; published: boolean; last: string | null }[]
  last_import: { feed_id: string; status: string; at: string | null; error: string | null } | null
  imports_failed: number
  live_vehicles: number // vehicles updated in the last 10 minutes
  live_fetched_at: string | null
  live_sources: { source: string; ok: boolean; vehicles: number | null; at: string }[]
  alerts_in_force: number
  data_alerts_open: number
  data_alerts: { kind: string; feed_id: string | null; message: string; first: string }[]
  ai_chats_30d: number
  ai_cost_30d: number
  ad_enquiries_new: number
}

export async function loadAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_dashboard')
  if (error) throw new Error(error.message)
  return data as AdminStats
}

// change against the earlier period, as a whole percent ("+9%"); null when there is nothing to compare with
export function change(now: number, before: number): string | null {
  if (!before) return null
  const p = Math.round(((now - before) / before) * 100)
  return `${p >= 0 ? '+' : '−'}${Math.abs(p)}%`
}
