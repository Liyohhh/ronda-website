import { supabase } from './supabase'
import type { Lang } from '../i18n/translations'

// Operator service alerts (public.service_alerts): "Ampang Line: change at Chan Sow Lin". The database only lets riders
// read alerts that are published and in force; admins see and edit all of them (/admin). Text comes in the four site
// languages; a missing translation falls back to English.

export type AlertEffect = 'modified' | 'delay' | 'closed' | 'info'
export type AlertStatus = 'draft' | 'published' | 'ended'
// What the trip planner does while the alert is live (plan-trip): turn_back = trains of the line from `branch_from`
// turn back at `at_station`, so riders going further change there. feed_id / route_id are the line's GTFS ids.
export type PlannerRule = { kind: 'turn_back'; line_id: string; feed_id: string; route_id: string; branch_from: string; at_station: string }

export type ServiceAlert = {
  id: string
  source: string
  source_url: string | null
  effect: AlertEffect
  title_en: string
  title_ms: string | null
  title_zh: string | null
  title_ar: string | null
  body_en: string
  body_ms: string | null
  body_zh: string | null
  body_ar: string | null
  line_ids: string[]
  station_names: string[]
  planner_rule: PlannerRule | null
  starts_at: string
  ends_at: string | null
  status: AlertStatus
  published_at: string | null
  updated_at?: string
}

const COLUMNS = 'id, source, source_url, effect, title_en, title_ms, title_zh, title_ar, body_en, body_ms, body_zh, body_ar, line_ids, station_names, planner_rule, starts_at, ends_at, status, published_at, updated_at'

export const alertTitle = (a: ServiceAlert, lang: Lang) => ({ en: a.title_en, ms: a.title_ms, zh: a.title_zh, ar: a.title_ar })[lang] || a.title_en
export const alertBody = (a: ServiceAlert, lang: Lang) => ({ en: a.body_en, ms: a.body_ms, zh: a.body_zh, ar: a.body_ar })[lang] || a.body_en

// Alerts riders see, newest first; kept for a minute so every trip on the page uses one request
let cache: { at: number; data: Promise<ServiceAlert[]> } | null = null
const TTL_MS = 60_000

export function loadLiveAlerts(): Promise<ServiceAlert[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data
  const data = Promise.resolve(
    supabase.from('service_alerts').select(COLUMNS).eq('status', 'published').order('published_at', { ascending: false }),
  ).then(({ data: rows, error }) => {
    if (error) throw new Error(error.message)
    // the database already hides alerts that have not started or have ended; checked again for a page left open
    const now = Date.now()
    return ((rows ?? []) as ServiceAlert[]).filter((a) => Date.parse(a.starts_at) <= now && (!a.ends_at || Date.parse(a.ends_at) > now))
  })
  cache = { at: Date.now(), data }
  data.catch(() => { cache = null })
  return data
}

export function clearAlertCache() {
  cache = null
}

// ---------- admin ----------

export async function loadAllAlerts(): Promise<ServiceAlert[]> {
  const { data, error } = await supabase.from('service_alerts').select(COLUMNS).order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ServiceAlert[]
}

export type AlertDraft = Omit<ServiceAlert, 'id' | 'published_at' | 'updated_at'>

const DRAFT_KEYS: (keyof AlertDraft)[] = ['source', 'source_url', 'effect', 'title_en', 'title_ms', 'title_zh', 'title_ar', 'body_en', 'body_ms', 'body_zh', 'body_ar', 'line_ids', 'station_names', 'planner_rule', 'starts_at', 'ends_at', 'status']

export async function saveAlert(input: AlertDraft, id?: string): Promise<void> {
  // only the editable columns (an alert being edited also carries its id and dates)
  const draft = Object.fromEntries(DRAFT_KEYS.map((k) => [k, input[k]])) as AlertDraft
  const { error } = id
    ? await supabase.from('service_alerts').update(draft).eq('id', id)
    : await supabase.from('service_alerts').insert(draft)
  if (error) throw new Error(error.message)
  clearAlertCache()
}

export async function setAlertStatus(id: string, status: AlertStatus): Promise<void> {
  const patch = status === 'ended' ? { status, ends_at: new Date().toISOString() } : { status }
  const { error } = await supabase.from('service_alerts').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
  clearAlertCache()
}
