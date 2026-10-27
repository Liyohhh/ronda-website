import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import { LINES, hasFeed } from '../data/lines'
import LineBadge from './LineBadge'
import { loadAllAlerts, saveAlert, setAlertStatus, type AlertDraft, type AlertEffect, type AlertStatus, type PlannerRule, type ServiceAlert } from '../services/serviceAlerts'

// /admin: operator service alerts. An admin copies a notice from the operator (e.g. MyRapid's alerts page), picks the
// lines it affects, saves it as a draft, checks it, then publishes; riders see it on those lines' trips until it is
// ended. When trains turn back short of the end of a line, a planner rule makes trips change there (plan-trip reads it
// within a minute of publishing). The database allows these writes for admins only.

const RAIL = LINES.filter((l) => l.mode !== 'BUS' && hasFeed(l))
const EFFECTS: [AlertEffect, TranslationKey][] = [['modified', 'alertModified'], ['delay', 'alertDelay'], ['closed', 'alertClosed'], ['info', 'alertInfo']]
const STATUS_LABEL: Record<AlertStatus, TranslationKey> = { draft: 'adminStatusDraft', published: 'adminStatusPublished', ended: 'adminStatusEnded' }
const STATUS_STYLE: Record<AlertStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-emerald-100 text-emerald-800',
  ended: 'bg-gray-100 text-gray-500 line-through',
}

// <input type="datetime-local"> works in local time without a zone; the site's riders and admins are in Malaysia
const toLocalInput = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 8 * 3600_000).toISOString().slice(0, 16) : '')
const fromLocalInput = (v: string) => (v ? new Date(`${v}:00+08:00`).toISOString() : null)

const empty = (): AlertDraft => ({
  source: 'myrapid', source_url: null, effect: 'modified',
  title_en: '', title_ms: null, title_zh: null, title_ar: null,
  body_en: '', body_ms: null, body_zh: null, body_ar: null,
  line_ids: [], station_names: [], planner_rule: null, starts_at: new Date().toISOString(), ends_at: null, status: 'draft',
})

function ServiceAlertsAdmin() {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<ServiceAlert[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [editing, setEditing] = useState<{ id?: string; draft: AlertDraft } | null>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  const reload = useCallback(() => {
    loadAllAlerts().then((a) => { setAlerts(a); setFailed(false) }, () => setFailed(true))
  }, [])
  useEffect(reload, [reload])

  const act = async (job: () => Promise<void>) => {
    setBusy(true)
    setProblem('')
    try {
      await job()
      reload()
      return true
    } catch (e) {
      setProblem(e instanceof Error ? e.message : String(e))
      return false
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const d = editing.draft
    if (!d.title_en.trim() || d.line_ids.length === 0) {
      setProblem(t('adminAlertNeedTitle'))
      return
    }
    const r = d.planner_rule
    if (r && (!r.line_id || !r.branch_from.trim() || !r.at_station.trim())) {
      setProblem(t('adminRuleNeed'))
      return
    }
    if (await act(() => saveAlert(d, editing.id))) setEditing(null)
  }

  const set = <K extends keyof AlertDraft>(k: K, v: AlertDraft[K]) => setEditing((s) => (s ? { ...s, draft: { ...s.draft, [k]: v } } : s))
  // the turn-back rule: the line's GTFS ids come with it, so the planner needs nothing else
  const rule = editing?.draft.planner_rule ?? null
  const setRule = (patch: Partial<PlannerRule> | null) => {
    if (!patch) return set('planner_rule', null)
    const next = { kind: 'turn_back' as const, line_id: '', feed_id: '', route_id: '', branch_from: '', at_station: '', ...rule, ...patch }
    const line = RAIL.find((l) => l.id === next.line_id)
    set('planner_rule', { ...next, feed_id: line?.gtfs.feedId ?? '', route_id: line?.gtfs.routeIds[0] ?? '' })
  }
  const ruleLines = RAIL.filter((l) => editing?.draft.line_ids.includes(l.id) && l.gtfs.routeIds.length)

  const text = (k: keyof AlertDraft, label: TranslationKey, area = false, dir?: 'rtl') => {
    const value = (editing?.draft[k] as string | null) ?? ''
    const onChange = (v: string) => set(k, (v || (k === 'title_en' || k === 'body_en' ? '' : null)) as never)
    const cls = 'mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#222D52] focus:outline-none'
    return (
      <label className="block text-sm font-medium text-gray-800">
        {t(label)}
        {area
          ? <textarea dir={dir} rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
          : <input dir={dir} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
      </label>
    )
  }

  return (
    <section aria-labelledby="admin-alerts" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="admin-alerts" className="text-2xl font-semibold text-[#222D52]">{t('adminAlertsTitle')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">{t('adminAlertsIntro')}</p>
        </div>
        {!editing && (
          <button type="button" onClick={() => { setProblem(''); setEditing({ draft: empty() }) }} className="h-10 rounded-full bg-[#222D52] px-5 text-sm font-semibold text-white hover:bg-[#18203D]">
            {t('adminAlertNew')}
          </button>
        )}
      </div>

      {problem && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{problem}</p>}

      {editing && (
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-[24px] border border-gray-200 bg-white p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-gray-800">
              {t('adminAlertType')}
              <select value={editing.draft.effect} onChange={(e) => set('effect', e.target.value as AlertEffect)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm">
                {EFFECTS.map(([v, k]) => <option key={v} value={v}>{t(k)}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-800">
              {t('adminAlertStarts')}
              <input type="datetime-local" value={toLocalInput(editing.draft.starts_at)} onChange={(e) => set('starts_at', fromLocalInput(e.target.value) ?? new Date().toISOString())} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm font-medium text-gray-800">
              {t('adminAlertEnds')}
              <input type="datetime-local" value={toLocalInput(editing.draft.ends_at)} onChange={(e) => set('ends_at', fromLocalInput(e.target.value))} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-gray-800">{t('adminAlertLines')}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {RAIL.map((l) => {
                const on = editing.draft.line_ids.includes(l.id)
                return (
                  <label key={l.id} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-gold ${on ? 'border-[#222D52] bg-[#222D52]/5' : 'border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => set('line_ids', on ? editing.draft.line_ids.filter((x) => x !== l.id) : [...editing.draft.line_ids, l.id])}
                      className="sr-only"
                    />
                    <LineBadge line={l} size={20} decorative />
                    {l.name}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <label className="block text-sm font-medium text-gray-800">
            {t('adminAlertStations')}
            <input
              type="text"
              value={editing.draft.station_names.join(', ')}
              onChange={(e) => set('station_names', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          {text('source_url', 'adminAlertSourceUrl')}

          <fieldset className="rounded-2xl border border-gray-200 p-4">
            <legend className="px-1 text-sm font-medium text-gray-800">{t('adminRuleTitle')}</legend>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={!!rule}
                onChange={(e) => setRule(e.target.checked ? { line_id: ruleLines[0]?.id ?? '' } : null)}
                className="h-4 w-4 accent-[#222D52]"
              />
              {t('adminRuleTurnBack')}
            </label>
            <p className="mt-1 text-xs text-gray-500">{t('adminRuleHint')}</p>
            {rule && (
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="block text-sm font-medium text-gray-800">
                  {t('adminRuleLine')}
                  <select value={rule.line_id} onChange={(e) => setRule({ line_id: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">-</option>
                    {ruleLines.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-800">
                  {t('adminRuleFrom')}
                  <input type="text" value={rule.branch_from} onChange={(e) => setRule({ branch_from: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                </label>
                <label className="block text-sm font-medium text-gray-800">
                  {t('adminRuleAt')}
                  <input type="text" value={rule.at_station} onChange={(e) => setRule({ at_station: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                </label>
              </div>
            )}
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            {text('title_en', 'adminAlertTitleEn')}
            {text('title_ms', 'adminAlertTitleMs')}
            {text('title_zh', 'adminAlertTitleZh')}
            {text('title_ar', 'adminAlertTitleAr', false, 'rtl')}
            {text('body_en', 'adminAlertBodyEn', true)}
            {text('body_ms', 'adminAlertBodyMs', true)}
            {text('body_zh', 'adminAlertBodyZh', true)}
            {text('body_ar', 'adminAlertBodyAr', true, 'rtl')}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="h-10 rounded-full bg-gold px-5 text-sm font-bold text-[#222D52] hover:bg-gold-hover disabled:opacity-50">{t('adminAlertSave')}</button>
            <button type="button" onClick={() => { setEditing(null); setProblem('') }} className="h-10 rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-700">{t('adminAlertCancel')}</button>
          </div>
        </form>
      )}

      {failed ? (
        <p role="alert" className="mt-6 text-sm text-gray-700">{t('adminAlertsError')}</p>
      ) : !alerts ? (
        <p role="status" className="mt-6 text-sm text-gray-500">{t('loading')}</p>
      ) : alerts.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">{t('adminAlertsEmpty')}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start gap-4 rounded-[20px] border border-gray-200 bg-white p-4">
              <span className="flex flex-shrink-0 gap-1">
                {a.line_ids.map((id) => <LineBadge key={id} line={id} size={28} />)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">{a.title_en}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[a.status]}`}>{t(STATUS_LABEL[a.status])}</span>
                  {a.planner_rule && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{t('adminRuleBadge')}</span>}
                </span>
                {a.body_en && <span className="mt-1 block text-sm text-gray-600 line-clamp-2">{a.body_en}</span>}
              </span>
              <span className="flex flex-shrink-0 flex-wrap gap-2">
                {a.status !== 'ended' && (
                  <button type="button" onClick={() => { setProblem(''); setEditing({ id: a.id, draft: { ...a } }) }} className="h-9 rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-700">{t('adminAlertEdit')}</button>
                )}
                {a.status === 'draft' && (
                  <button type="button" disabled={busy} onClick={() => act(() => setAlertStatus(a.id, 'published'))} className="h-9 rounded-full bg-[#222D52] px-4 text-sm font-semibold text-white disabled:opacity-50">{t('adminAlertPublish')}</button>
                )}
                {a.status === 'published' && (
                  <button type="button" disabled={busy} onClick={() => act(() => setAlertStatus(a.id, 'ended'))} className="h-9 rounded-full border border-red-300 px-4 text-sm font-semibold text-red-700 disabled:opacity-50">{t('adminAlertEnd')}</button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ServiceAlertsAdmin
