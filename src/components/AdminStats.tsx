import { useEffect, useState, type ReactNode } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useTrails } from '../hooks/useTrails'
import { countryName } from '../data/countries'
import type { Line } from '../data/lines'
import { useRailStations } from '../hooks/useRailStations'
import LineBadge from './LineBadge'
import Icon from './Icon'
import type { IconName } from '../data/icons'
import { trailNameKey } from '../data/trails'
import { LANGUAGES, type Lang, type TranslationKey } from '../i18n/translations'
import { change, loadAdminStats, type AdminStats as Stats } from '../services/adminStats'

// The admin dashboard (/admin; the app's admin screen reads the same admin_dashboard() numbers). Every number shows
// once: four headline cards (active users, active today, trips planned, user accounts), one chart you can switch
// (active users per day / week / month, trips planned or searches per day), the top lists (stations, countries,
// languages), busy hours, after a trip is planned (opened, shared live; website or app), most planned trips, searches,
// who comes back, RONDA 300 places and trails, service alert reach, then data and systems (live vehicles, feeds,
// last GTFS import, alerts in force, AI chats, ad enquiries, data warnings). Sections stack on phones.

type T = (k: TranslationKey) => string
const LOCALE: Record<Lang, string> = { en: 'en-GB', ms: 'ms-MY', zh: 'zh-CN', ar: 'ar' }
const BLUE = '#2F6BD8'
const BARS = [BLUE, '#38BDF8', '#7C5CE0', '#F08A3C', '#2EAD6B'] // top list bars, in order
const STALE_MIN = 15 // live vehicles older than this count as not updating
const day = (d: string) => new Date(`${d.slice(0, 10)}T00:00:00`)
const fmtNum = (n: number, lang: Lang) => n.toLocaleString(LOCALE[lang])

function Card({ id, title, aside, children, className = '' }: { id?: string; title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-label={title} className={`min-w-0 scroll-mt-24 rounded-[18px] border border-[#E6EBF2] bg-white p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px] font-extrabold text-[#222D52]">{title}</h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Tabs<V extends string>({ value, options, onChange, label }: { value: V; options: [V, string][]; onChange: (v: V) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5 text-[13px] font-semibold">
      {options.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={`rounded-lg px-3 py-1.5 transition-colors ${value === k ? 'bg-[#EAF1FD] text-[#2F6BD8]' : 'border border-[#E6EBF2] text-[#5F6979] hover:text-[#222D52]'}`}>{l}</button>
      ))}
    </div>
  )
}

// small rounded label with a change: green up, red down
function Delta({ v }: { v: string | null }) {
  if (!v) return null
  const down = v.startsWith('−')
  return <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums ${down ? 'bg-[#FBE7E3] text-[#B4492A]' : 'bg-[#E3F4EA] text-[#2E7D4F]'}`}>{down ? '↘' : '↗'} {v}</span>
}

const None = ({ t }: { t: T }) => <p className="text-sm text-[#5B6576]">{t('adm_none')}</p>

// ranked rows with a light bar behind the count
function Ranked({ rows, lang }: { rows: { k: ReactNode; n: number; key: string }[]; lang: Lang }) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <ol>
      {rows.map((r, i) => (
        <li key={r.key} className="flex items-center gap-3 border-b border-[#EDF1F6] py-2.5 last:border-0">
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold ${i ? 'bg-[#F2F6FB]' : 'bg-[#222D52] text-white'}`}>{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-3 text-[14px]"><span className="min-w-0 truncate font-semibold">{r.k}</span><span className="tabular-nums">{fmtNum(r.n, lang)}</span></div>
            <div className="mt-1.5 h-1.5 rounded-full bg-[#E6ECF5]"><i className="block h-full rounded-full bg-[#222D52]" style={{ width: `${(r.n / max) * 100}%` }} /></div>
          </div>
        </li>
      ))}
    </ol>
  )
}

// top list: name and count, then a coloured bar
function TopBars({ rows, lang }: { rows: { k: ReactNode; n: number; key: string }[]; lang: Lang }) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <ul className="space-y-3.5">
      {rows.map((r, i) => (
        <li key={r.key}>
          <div className="flex justify-between gap-3 text-[14px]"><span className="min-w-0 truncate font-semibold text-[#222D52]">{r.k}</span><span className="tabular-nums text-[#434C5C]">{fmtNum(r.n, lang)}</span></div>
          <div className="mt-1.5 h-2 rounded-full bg-[#EEF2F7]"><i className="block h-full rounded-full" style={{ width: `${(r.n / max) * 100}%`, background: BARS[i % BARS.length] }} /></div>
        </li>
      ))}
    </ul>
  )
}

// a round number at or above v, for the chart's top line
function niceMax(v: number) {
  if (v <= 5) return 5
  const p = 10 ** Math.floor(Math.log10(v))
  return ([1, 2, 2.5, 5, 10].find((m) => m * p >= v) ?? 10) * p
}

// a smooth line through the points (Catmull-Rom as cubic curves)
function smooth(p: [number, number][]) {
  return p.reduce((d, [x, y], i) => {
    if (!i) return `M${x},${y}`
    const [x0, y0] = p[i - 2] ?? p[i - 1], [x1, y1] = p[i - 1], [x3, y3] = p[i + 1] ?? [x, y]
    return `${d} C${x1 + (x - x0) / 6},${y1 + (y - y0) / 6} ${x - (x3 - x1) / 6},${y - (y3 - y1) / 6} ${x},${y}`
  }, '')
}

// area chart with a value scale, dates under it and the hovered (else latest) point marked; oldest on the left in
// every language
function AreaChart({ points, label, monthly, lang }: { points: { d: string; v: number }[]; label: string; monthly: boolean; lang: Lang }) {
  const [hover, setHover] = useState<number | null>(null)
  if (points.length < 2) return null
  const top = niceMax(Math.max(...points.map((p) => p.v)))
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(top * f))
  const xy = points.map((p, i): [number, number] => [(i / (points.length - 1)) * 600, 200 - (p.v / top) * 200])
  const name = (d: string) => day(d).toLocaleDateString(LOCALE[lang], monthly ? { month: 'short' } : { day: 'numeric', month: 'short' })
  const every = Math.ceil(points.length / 7)
  const i = hover ?? points.length - 1
  const at = points[i]
  return (
    <figure dir="ltr">
      <figcaption className="sr-only">{label}: {points.map((p) => `${name(p.d)} ${p.v}`).join(', ')}</figcaption>
      <div aria-hidden="true" className="flex gap-3">
        <div className="flex h-56 flex-col justify-between text-end text-[11px] tabular-nums text-[#8A93A2]">{ticks.map((v) => <span key={v} className="-my-1.5">{fmtNum(v, lang)}</span>)}</div>
        <div className="relative h-56 flex-1" onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1))) }}>
          {ticks.map((v, k) => <div key={v} className="absolute inset-x-0 border-t border-dashed border-[#E6EBF2]" style={{ top: `${k * 25}%` }} />)}
          <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs><linearGradient id="adm-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={BLUE} stopOpacity="0.22" /><stop offset="1" stopColor={BLUE} stopOpacity="0.02" /></linearGradient></defs>
            <path d={`${smooth(xy)} L600,200 L0,200 Z`} fill="url(#adm-area)" />
            <path d={smooth(xy)} fill="none" stroke={BLUE} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            <line x1={xy[i][0]} x2={xy[i][0]} y1={xy[i][1]} y2="200" stroke={BLUE} strokeDasharray="4 4" opacity="0.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <i className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#2F6BD8] shadow" style={{ left: `${(xy[i][0] / 600) * 100}%`, top: `${(xy[i][1] / 200) * 100}%` }} />
          <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-lg border border-[#E6EBF2] bg-white px-2.5 py-1 text-center shadow-sm"
            style={{ left: `clamp(40px, ${(xy[i][0] / 600) * 100}%, calc(100% - 40px))`, top: `${(xy[i][1] / 200) * 100}%` }}>
            <span className="block text-[11px] text-[#5B6576]">{name(at.d)}</span><b className="text-[14px] tabular-nums text-[#222D52]">{fmtNum(at.v, lang)}</b>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="ms-9 mt-2 flex justify-between text-[11px] text-[#8A93A2]">
        {points.map((p, k) => (k % every === 0 || k === points.length - 1) && <span key={p.d}>{name(p.d)}</span>)}
      </div>
    </figure>
  )
}

type Metric = 'daily' | 'weekly' | 'monthly' | 'trips' | 'searches'

// the dashboard itself, from the numbers (kept apart from loading so it can be tested)
export function AdminView({ stats, t, lang, linesOf = () => [], trailName = (s) => s }: { stats: Stats; t: T; lang: Lang; linesOf?: (name: string) => Line[]; trailName?: (slug: string) => string }) {
  const [now] = useState(() => Date.now()) // when the page loaded the numbers
  const [metric, setMetric] = useState<Metric>('daily')
  const [topTab, setTopTab] = useState<'stations' | 'countries' | 'languages'>('stations')
  const [searchTab, setSearchTab] = useState<'top' | 'none'>('top')
  const [placeTab, setPlaceTab] = useState<'places' | 'trails'>('places')
  const n = (v: number) => fmtNum(v, lang)
  const when = (iso: string) => new Date(iso).toLocaleString(LOCALE[lang], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' })
  const ops = stats.ops
  const ev = stats.daily_events

  // headline cards
  const guests = Math.max(0, stats.active_today - stats.signed_in_today)
  const monthDiff = stats.active_month - stats.active_month_prev
  const heads: { id: string; to: string; icon: IconName; label: string; value: string; delta?: string | null; foot: string }[] = [
    { id: 'active', to: 'adm-chart', icon: 'personOutline', label: t('adm_activeUsers'), value: n(stats.active_month), delta: change(stats.active_month, stats.active_month_prev),
      foot: t('adm_vsPrev30').replace('{n}', `${monthDiff >= 0 ? '+' : '−'}${n(Math.abs(monthDiff))}`) },
    { id: 'today', to: 'adm-chart', icon: 'scheduleOutline', label: t('adm_activeToday'), value: n(stats.active_today), delta: change(stats.active_today, stats.active_today_prev),
      foot: t('adm_todaySplit').replace('{s}', n(stats.signed_in_today)).replace('{g}', n(guests)) },
    { id: 'trips', to: 'adm-funnel', icon: 'routeOutline', label: t('adm_ovTrips'), value: n(stats.funnel.plan), foot: t('adm_fromSearches').replace('{n}', n(stats.funnel.search)) },
    { id: 'accounts', to: 'adm-users', icon: 'badge', label: t('adm_ovAccounts'), value: n(stats.accounts), foot: t('adm_ovNewWeek').replace('{n}', n(stats.accounts_new_week)) },
  ]

  // the switchable chart
  const metrics: [Metric, string][] = [
    ['daily', t('adm_mDaily')], ['weekly', t('adm_mWeekly')], ['monthly', t('adm_mMonthly')],
    ...(ev ? [['trips', t('adm_ovTripsDaily')], ['searches', t('adm_mSearches')]] as [Metric, string][] : []),
  ]
  const series = metric === 'trips' ? (ev ?? []).map((p) => ({ d: p.d, v: p.plan })) : metric === 'searches' ? (ev ?? []).map((p) => ({ d: p.d, v: p.search }))
    : ({ daily: stats.active_daily, weekly: stats.active_weekly, monthly: stats.active_monthly }[metric] ?? []).map((p) => ({ d: p.d, v: p.n }))
  const chartLabel = metrics.find(([k]) => k === metric)?.[1] ?? ''

  // top lists
  const langName = (c: string) => LANGUAGES.find((l) => l.code === c)?.label ?? c
  const tops = {
    stations: stats.hot_stations.slice(0, 5).map((s) => ({ key: s.s, n: s.n, k: <span className="inline-flex items-center gap-1">{linesOf(s.s).map((l) => <LineBadge key={l.id} line={l} size={20} />)}{s.s}</span> })),
    countries: stats.countries.slice(0, 5).map((c) => ({ key: c.c ?? '-', n: c.n, k: c.c ? countryName(c.c, lang) : t('adm_notGiven') })),
    languages: stats.languages.slice(0, 5).map((l) => ({ key: l.l, n: l.n, k: langName(l.l) })),
  }[topTab]

  // busy hours: 6am to 11pm, Monday to Sunday
  const hours = Array.from({ length: 18 }, (_, i) => i + 6)
  const busy = new Map(stats.busy_hours.map((b) => [`${b.dow}-${b.h}`, b.n]))
  const busyMax = Math.max(1, ...stats.busy_hours.map((b) => b.n))
  const weekday = (d: number) => new Date(Date.UTC(2026, 9, 25 + d)).toLocaleDateString(LOCALE[lang], { weekday: 'short', timeZone: 'UTC' }) // 26 Oct 2026 is a Monday
  const hourLabel = (h: number) => new Date(Date.UTC(2026, 0, 1, h)).toLocaleTimeString(LOCALE[lang], { hour: 'numeric', timeZone: 'UTC' })

  // after a trip is planned (searches and trips planned are on the headline card): opened, shared live
  const f = stats.funnel
  const of = (v: number) => (f.plan ? `${Math.round((v / f.plan) * 100)}%` : '–')
  const steps: [string, number, ReactNode][] = [
    [t('adm_fOpen'), f.open, null],
    [t('adm_fShare'), f.share, <><Delta v={change(stats.live_shares, stats.live_shares_prev)} />{stats.live_share_minutes != null && <span className="text-[12px] text-[#5B6576]">{t('adm_avgShare')} {t('adm_min').replace('{n}', String(stats.live_share_minutes))}</span>}</>],
  ]
  const platformName: Record<string, string> = { web: t('adm_web'), android: t('adm_android'), ios: t('adm_ios'), app: t('adm_appOld') }
  const platTotal = stats.platforms.reduce((s, p) => s + p.n, 0) || 1

  // data and systems
  const stale = !ops?.live_fetched_at || now - new Date(ops.live_fetched_at).getTime() > STALE_MIN * 60_000
  const down = ops?.live_sources.filter((s) => !s.ok).length ?? 0
  const imp = ops?.last_import
  const sys = ops ? [
    { id: 'vehicles', label: t('adm_ovVehicles'), value: n(ops.live_vehicles), warn: stale, sub: ops.live_fetched_at ? t('adm_ovUpdated').replace('{t}', when(ops.live_fetched_at)) : t('adm_none') },
    { id: 'feeds', label: t('adm_ovFeeds'), value: n(ops.feeds_published), sub: t('adm_ovFeedsOf').replace('{n}', n(ops.feeds_total)) },
    { id: 'import', label: t('adm_ovImport'), value: imp ? (imp.status === 'done' ? t('adm_impDone') : imp.error ? t('adm_impFailed') : imp.status) : '–', warn: !!imp?.error, sub: imp ? `${imp.feed_id}${imp.at ? ` · ${when(imp.at)}` : ''}` : undefined },
    { id: 'alerts', label: t('adm_ovAlerts'), value: n(ops.alerts_in_force) },
    { id: 'ai', label: t('adm_ovAi'), value: n(ops.ai_chats_30d), sub: t('adm_ovAiCost').replace('{n}', ops.ai_cost_30d.toFixed(2)) },
    { id: 'ads', label: t('adm_ovAds'), value: n(ops.ad_enquiries_new) },
  ] : []
  const warnCount = (ops?.data_alerts_open ?? 0) + (ops?.imports_failed ?? 0) + down

  return (
    <div className="space-y-5">
      {/* headline cards */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {heads.map((h) => (
          <li key={h.id} data-tile={h.id} className="flex flex-col rounded-[18px] border border-[#E6EBF2] bg-white">
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-semibold text-[#5B6576]">{h.label}</span><span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-[#F2F6FB] text-[#222D52]"><Icon name={h.icon} size={18} /></span></div>
              <p className="mt-1 flex flex-wrap items-center gap-2"><b className="text-[28px] font-extrabold leading-tight tabular-nums text-[#222D52]">{h.value}</b><Delta v={h.delta ?? null} /></p>
            </div>
            <a href={`#${h.to}`} className="mt-auto flex items-center justify-between gap-2 border-t border-[#EEF2F7] px-4 py-2.5 text-[13px] text-[#434C5C] hover:bg-[#F8FAFD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BD8]">
              <span>{h.foot}</span><Icon name="chevronRight" size={18} className="text-[#8A93A2] rtl:rotate-180" />
            </a>
          </li>
        ))}
      </ul>

      {/* the chart and the top lists */}
      <div id="adm-users" className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <Card id="adm-chart" title={t('adm_trends')} aside={
          <label className="flex items-center gap-2 text-[13px] text-[#5B6576]">
            <span className="sr-only">{t('adm_mShow')}</span>
            <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)} className="rounded-lg border border-[#E6EBF2] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#222D52]">
              {metrics.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>}>
          <AreaChart key={metric} points={series} label={chartLabel} monthly={metric === 'monthly'} lang={lang} />
        </Card>
        <Card title={t('adm_topTitle')}>
          <Tabs label={t('adm_topTitle')} value={topTab} onChange={setTopTab} options={[['stations', t('adm_tabStations')], ['countries', t('adm_tabCountries')], ['languages', t('adm_tabLanguages')]]} />
          <div className="mt-5">{tops.length ? <TopBars rows={tops} lang={lang} /> : <None t={t} />}</div>
        </Card>
      </div>

      {/* busy hours, and from search to trip */}
      <div id="adm-trips" className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title={t('adm_busy')} aside={<span className="text-[12px] text-[#5B6576]">{t('adm_busyHint')}</span>}>
          {stats.busy_hours.length ? (
            <div className="overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full min-w-[440px] table-fixed text-[11px]">
                <colgroup><col className="w-10" />{hours.map((h) => <col key={h} />)}</colgroup>
                <thead><tr><td />{hours.map((h) => <th key={h} className="overflow-visible whitespace-nowrap pb-1 text-center font-normal text-[#5B6576]">{h % 3 === 0 ? hourLabel(h) : ''}</th>)}</tr></thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <tr key={d}>
                      <th className="pe-1.5 text-start font-normal text-[#5B6576]">{weekday(d)}</th>
                      {hours.map((h) => { const v = busy.get(`${d}-${h}`) ?? 0; return <td key={h} className="p-[1.5px]"><div title={`${weekday(d)} ${hourLabel(h)}: ${v}`} className="h-[24px] rounded-[5px]" style={{ background: v ? `rgba(47,107,216,${(0.15 + (v / busyMax) * 0.85).toFixed(2)})` : '#F2F6FB' }} /></td> })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <None t={t} />}
        </Card>

        <Card id="adm-funnel" title={t('adm_afterPlan')} aside={<span className="text-[12px] text-[#5B6576]">{t('adm_ov30')}</span>}>
          <table className="w-full text-[14px]">
            <thead><tr className="text-[12px] text-[#5B6576]"><th className="pb-2 text-start font-normal" /><th className="pb-2 text-end font-normal">{t('adm_ofPlanned')}</th></tr></thead>
            <tbody>
              {steps.map(([k, v, extra]) => (
                <tr key={k} className="border-t border-[#EDF1F6] align-top">
                  <td className="py-2.5"><span className="block text-[12px] text-[#5B6576]">{k}</span><b className="text-[20px] font-extrabold tabular-nums text-[#222D52]">{n(v)}</b>{extra && <span className="ms-2 inline-flex flex-wrap items-center gap-2">{extra}</span>}</td>
                  <td className="py-2.5 text-end align-middle font-semibold tabular-nums text-[#434C5C]">{of(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="mt-4 border-t border-[#EDF1F6] pt-4 text-[13px] font-bold text-[#222D52]">{t('adm_platform')}</h3>
          {stats.platforms.length ? (
            <ul className="mt-3 grid grid-cols-3 gap-3">
              {stats.platforms.slice(0, 3).map((p, i) => (
                <li key={p.p}>
                  <span className="block truncate text-[12px] text-[#5B6576]">{platformName[p.p] ?? p.p}</span>
                  <b className="text-[20px] font-extrabold tabular-nums text-[#222D52]">{Math.round((p.n / platTotal) * 100)}%</b>
                  <span className="block text-[12px] tabular-nums text-[#5B6576]">{n(p.n)}</span>
                  <i className="mt-1.5 block h-1.5 rounded-full" style={{ background: BARS[(i * 2) % BARS.length] }} />
                </li>
              ))}
            </ul>
          ) : <div className="mt-3"><None t={t} /></div>}
        </Card>
      </div>

      {/* trips, searches, coming back */}
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card title={t('adm_trips')}>
          {stats.top_trips.length ? <Ranked lang={lang} rows={stats.top_trips.slice(0, 5).map((x) => ({ key: `${x.from}>${x.to}`, n: x.n, k: <><span>{x.from}</span> <span className="text-[#8A93A2]">→</span> <span className="font-normal">{x.to}</span></> }))} /> : <None t={t} />}
        </Card>
        <Card id="adm-searches" title={t('adm_searchesT')} aside={<Tabs label={t('adm_searchesT')} value={searchTab} onChange={setSearchTab} options={[['top', t('adm_mostSearched')], ['none', t('adm_foundNothing')]]} />}>
          {(() => { const rows = searchTab === 'top' ? stats.top_searches : stats.no_result_searches; return rows.length ? <Ranked lang={lang} rows={rows.slice(0, 5).map((s) => ({ key: s.q, n: s.n, k: s.q }))} /> : <None t={t} /> })()}
        </Card>
        <Card title={t('adm_comingBack')} className="lg:col-span-2 xl:col-span-1" aside={<span className="text-[12px] text-[#5B6576]">{stats.stickiness == null ? '' : `${Math.round(stats.stickiness * 100)}% ${t('adm_sticky').toLowerCase()}`}</span>}>
          {stats.cohorts.length ? (
            <>
              <table className="w-full text-[13px]">
                <thead><tr className="text-[12px] text-[#5B6576]"><th className="pb-1 text-start font-normal">{t('adm_started')}</th><th className="pb-1 pe-2 text-end font-normal">{t('adm_people')}</th><th className="pb-1 font-normal">{t('adm_wk1')}</th><th className="pb-1 font-normal">{t('adm_wk2')}</th><th className="pb-1 font-normal">{t('adm_wk4')}</th></tr></thead>
                <tbody>
                  {stats.cohorts.map((c) => (
                    <tr key={c.w}>
                      <td className="font-semibold">{day(c.w).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' })}</td>
                      <td className="pe-2 text-end tabular-nums">{n(c.n)}</td>
                      {[c.w1, c.w2, c.w4].map((v, i) => (
                        <td key={i} className="p-1">
                          {v == null ? <div className="h-9 rounded-lg bg-[#F2F6FB]" /> : <div className={`grid h-9 place-items-center rounded-lg font-bold ${v > 35 ? 'text-white' : 'text-[#222D52]'}`} style={{ background: `rgba(34,45,82,${Math.max(0.08, v / 50).toFixed(2)})` }}>{v}%</div>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[12px] text-[#5B6576]">{t('adm_comingBackHint')}. {t('adm_darker')}</p>
            </>
          ) : <None t={t} />}
        </Card>
      </div>

      {/* places and trails, alert reach */}
      <div id="adm-places" className="grid scroll-mt-24 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title={t('adm_places')} aside={<Tabs label={t('adm_places')} value={placeTab} onChange={setPlaceTab} options={[['places', t('adm_placesTab')], ['trails', t('adm_trailsTab')]]} />}>
          {placeTab === 'places' ? (
            stats.places.length ? (
              <table className="w-full text-[14px]">
                <thead><tr className="text-[12px] text-[#5B6576]"><th className="pb-1 text-start font-normal">{t('adm_place')}</th><th className="pb-1 text-end font-normal">{t('adm_views')}</th><th className="pb-1 text-end font-normal">{t('adm_go')}</th></tr></thead>
                <tbody>{stats.places.map((p) => <tr key={p.id} className="border-t border-[#EDF1F6]"><td className="py-2.5 font-semibold">{p.name ?? p.id}</td><td className="py-2.5 text-end tabular-nums">{n(p.views)}</td><td className="py-2.5 text-end tabular-nums">{n(p.go)}</td></tr>)}</tbody>
              </table>
            ) : <None t={t} />
          ) : stats.trails.length ? <Ranked lang={lang} rows={stats.trails.map((x) => ({ key: x.slug, n: x.views, k: trailName(x.slug) }))} /> : <None t={t} />}
        </Card>
        <Card title={t('adm_alerts')}>
          {stats.alert_reach.length ? (
            <ul>
              {stats.alert_reach.map((a) => (
                <li key={a.id} className="border-b border-[#EDF1F6] py-3 last:border-0">
                  <p className="text-[14px] font-semibold">{a.title || a.id}</p>
                  <p className="mt-0.5 text-[12px] text-[#5B6576]">{day(a.first).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' })} · {t('adm_seenBy').replace('{n}', n(a.n))}</p>
                </li>
              ))}
            </ul>
          ) : <None t={t} />}
        </Card>
      </div>

      {/* data and systems */}
      {ops && (
        <Card id="adm-ops" title={t('adm_ovSystems')} aside={<span data-tile="warnings" className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${warnCount ? 'bg-[#FBE7E3] text-[#B4492A]' : 'bg-[#E3F4EA] text-[#2E7D4F]'}`}>{t('adm_ovWarnings')}: {n(warnCount)}</span>}>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
            {sys.map((x) => (
              <li key={x.id} data-tile={x.id} className={`rounded-xl border p-3 ${x.warn ? 'border-[#E8B4A6] bg-[#FFF8F6]' : 'border-[#EDF1F6]'}`}>
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#5B6576]">{x.warn && <i aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#B4492A]" />}{x.label}</span>
                <b className="block text-[20px] font-extrabold leading-tight tabular-nums text-[#222D52]">{x.value}</b>
                {x.sub && <span className="block text-[12px] text-[#5B6576]">{x.sub}</span>}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-[#222D52]">{t('adm_opsFeeds')}</h3>
              <div className="mt-2 max-h-[340px] overflow-auto">
                <table className="w-full min-w-[380px] text-[13px]">
                  <thead><tr className="text-[12px] text-[#5B6576]"><th className="pb-1 text-start font-normal">{t('adm_opsFeed')}</th><th className="pb-1 text-start font-normal">{t('adm_opsOnSite')}</th><th className="pb-1 text-end font-normal">{t('adm_ovImport')}</th></tr></thead>
                  <tbody>
                    {ops.feeds.map((fd) => (
                      <tr key={fd.id} className="border-t border-[#EDF1F6]">
                        <td className="py-2 font-semibold">{fd.name}</td>
                        <td className="py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${fd.published ? 'bg-[#E3F4EA] text-[#2E7D4F]' : 'bg-[#F2F6FB] text-[#5B6576]'}`}>{t(fd.published ? 'adm_opsPublished' : 'adm_opsHidden')}</span></td>
                        <td className="py-2 text-end tabular-nums text-[#5B6576]">{fd.last ? when(fd.last) : t('adm_opsNever')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="min-w-0 space-y-5">
              <div>
                <h3 className="text-[13px] font-bold text-[#222D52]">{t('adm_opsLive')}</h3>
                {ops.live_sources.length ? (
                  <ul className="mt-2 text-[13px]">
                    {ops.live_sources.map((s) => (
                      <li key={s.source} className="flex items-center gap-2 border-b border-[#EDF1F6] py-2 last:border-0">
                        <i aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${s.ok ? 'bg-[#2E7D4F]' : 'bg-[#B4492A]'}`} />
                        <span className="font-semibold">{s.source}</span><span className="text-[12px] text-[#5B6576]">{t(s.ok ? 'adm_opsOk' : 'adm_opsDown')}</span>
                        <span className="ms-auto text-end text-[12px] tabular-nums text-[#5B6576]">{s.vehicles != null && <>{n(s.vehicles)} · </>}{when(s.at)}</span>
                      </li>
                    ))}
                  </ul>
                ) : <div className="mt-2"><None t={t} /></div>}
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-[#222D52]">{t('adm_ovWarnings')}</h3>
                <p className="text-[12px] text-[#5B6576]">{t('adm_ovWarnSub').replace('{d}', n(ops.data_alerts_open)).replace('{i}', n(ops.imports_failed)).replace('{l}', n(down))}</p>
                {ops.data_alerts.length ? (
                  <ul className="mt-1">
                    {ops.data_alerts.map((a) => (
                      <li key={`${a.kind}-${a.feed_id}-${a.first}`} className="border-b border-[#EDF1F6] py-2 last:border-0">
                        <p className="text-[13px] font-semibold">{a.feed_id ?? a.kind} <span className="font-normal text-[#8A93A2]">· {day(a.first).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' })}</span></p>
                        <p className="text-[12px] text-[#5B6576]">{a.message}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      )}
      <p className="text-[12px] text-[#5B6576]">{t('adm_soonNote')}</p>
    </div>
  )
}

function AdminStats() {
  const { t, lang } = useLanguage()
  const { data: trails } = useTrails()
  const stations = useRailStations()
  const [stats, setStats] = useState<Stats | null | 'error'>(null)
  useEffect(() => { loadAdminStats().then(setStats, () => setStats('error')) }, [])

  if (stats === 'error') return <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t('adm_error')}</p>
  if (!stats) return <p role="status" className="text-sm text-[#5B6576]">{t('loading')}</p>
  // a station's lines (an interchange has one per line), from the rail stations by name
  const linesOf = (name: string): Line[] => [...new Map((stations ?? []).filter((x) => x.name.toLowerCase() === name.toLowerCase()).map((x) => [x.line.id, x.line])).values()].slice(0, 3)
  const trailName = (slug: string) => { const tr = trails?.trails.find((x) => x.slug === slug); return tr ? t(trailNameKey(tr)) : slug }
  return <AdminView stats={stats} t={t} lang={lang} linesOf={linesOf} trailName={trailName} />
}

export default AdminStats
