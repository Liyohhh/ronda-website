import { useEffect, useState, type ReactNode } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useTrails } from '../hooks/useTrails'
import { countryName } from '../data/countries'
import type { Line } from '../data/lines'
import { useRailStations } from '../hooks/useRailStations'
import { trailNameKey } from '../data/trails'
import { LANGUAGES, type Lang, type TranslationKey } from '../i18n/translations'
import { change, loadAdminStats, type AdminStats as Stats, type Point } from '../services/adminStats'

// The admin dashboard (top of /admin; the app's admin screen shows the same numbers in the same order): active users
// first (today, this week, this month, how many come on a given day), active users per day / week / month, who comes
// back, busy hours, most planned trips, countries, stations, searches, live sharing, website or app, language,
// search-to-trip steps, RONDA 300 places and trails, and service alert reach. Sections stack on phones.

type Period = 'daily' | 'weekly' | 'monthly'
const LOCALE: Record<Lang, string> = { en: 'en-GB', ms: 'ms-MY', zh: 'zh-CN', ar: 'ar' }
const NAVY = '#222D52'
const day = (d: string) => new Date(`${d.slice(0, 10)}T00:00:00`)
const fmtNum = (n: number, lang: Lang) => n.toLocaleString(LOCALE[lang])


function Card({ id, title, aside, children, className = '' }: { id?: string; title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-label={title} className={`scroll-mt-24 rounded-[22px] bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[17px] font-extrabold text-[#222D52]">{title}</h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-full bg-[#F2F6FB] p-1 text-[13px] font-semibold">
      {options.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={`rounded-full px-3 py-1 transition-colors ${value === k ? 'bg-white text-[#222D52] shadow-sm' : 'text-[#5F6979] hover:text-[#222D52]'}`}>{l}</button>
      ))}
    </div>
  )
}

const None = ({ t }: { t: (k: TranslationKey) => string }) => <p className="text-sm text-[#5B6576]">{t('adm_none')}</p>

// active users as stacked bars (signed in at the bottom, guests on top), the latest in gold
function ActiveBars({ points, period, lang, t }: { points: Point[]; period: Period; lang: Lang; t: (k: TranslationKey) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(10, ...points.map((p) => p.n)) * 1.1
  const label = (d: string) => day(d).toLocaleDateString(LOCALE[lang], period === 'monthly' ? { month: 'short' } : { day: 'numeric', month: 'short' })
  const every = points.length > 14 ? 7 : points.length > 8 ? 3 : 1
  const shown = hover ?? points.length - 1
  const p = points[shown]
  return (
    <figure>
      <figcaption className="sr-only">{points.map((x) => `${label(x.d)}: ${x.n}`).join(', ')}</figcaption>
      <div className="mb-2 flex h-5 items-baseline gap-2 text-[13px]" aria-hidden="true">
        {p && <><b className="text-[#222D52]">{label(p.d)}</b><span className="tabular-nums">{fmtNum(p.n, lang)} {t('adm_activeShort')}</span><span className="tabular-nums text-[#2559B8]">{fmtNum(p.s, lang)} {t('adm_signedIn').toLowerCase()}</span></>}
      </div>
      <div aria-hidden="true" className="flex h-48 items-end gap-[3px] border-b border-[#DEE5EE] sm:h-56" onMouseLeave={() => setHover(null)}>
        {points.map((x, i) => {
          const last = i === points.length - 1
          return (
            <div key={x.d} className="flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)}>
              <div className="rounded-t-[4px]" style={{ height: `${((x.n - x.s) / max) * 100}%`, background: last ? '#3A4670' : hover === i ? '#B3BBD3' : '#C9CFE0' }} />
              <div className={x.n - x.s > 0 ? '' : 'rounded-t-[4px]'} style={{ height: `${(x.s / max) * 100}%`, minHeight: x.n ? 2 : 0, background: last ? '#8AB4F8' : NAVY }} />
            </div>
          )
        })}
      </div>
      <div aria-hidden="true" className="mt-1.5 flex gap-[3px] text-[11px] text-[#5B6576]">
        {points.map((x, i) => <span key={x.d} className="flex-1 truncate text-center">{(points.length - 1 - i) % every === 0 ? label(x.d) : ''}</span>)}
      </div>
    </figure>
  )
}

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

function Share({ rows, lang }: { rows: { k: string; n: number; c: string }[]; lang: Lang }) {
  const tot = rows.reduce((s, r) => s + r.n, 0) || 1
  return (
    <>
      <div className="flex h-3.5 overflow-hidden rounded-full bg-[#F2F6FB]">{rows.map((r) => <i key={r.k} style={{ width: `${(r.n / tot) * 100}%`, background: r.c }} />)}</div>
      <ul className="mt-4 space-y-2.5 text-[14px]">
        {rows.map((r) => <li key={r.k} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: r.c }} />{r.k}<span className="ms-auto tabular-nums text-[#5B6576]">{fmtNum(r.n, lang)}</span><b className="w-11 text-end tabular-nums">{Math.round((r.n / tot) * 100)}%</b></li>)}
      </ul>
    </>
  )
}

const COLORS = ['#222D52', '#8AB4F8', '#2C6B66', '#8C2F4E', '#6A5A8C', '#D3DBE6']

function AdminStats() {
  const { t, lang } = useLanguage()
  const { data: trails } = useTrails()
  const stations = useRailStations()
  // a station's lines (an interchange has one per line), from the rail stations by name
  const linesOf = (name: string): Line[] => [...new Map((stations ?? []).filter((x) => x.name.toLowerCase() === name.toLowerCase()).map((x) => [x.line.id, x.line])).values()].slice(0, 3)
  const [stats, setStats] = useState<Stats | null | 'error'>(null)
  const [period, setPeriod] = useState<Period>('daily')
  const [searchTab, setSearchTab] = useState<'top' | 'none'>('top')
  const [placeTab, setPlaceTab] = useState<'places' | 'trails'>('places')
  useEffect(() => { loadAdminStats().then(setStats, () => setStats('error')) }, [])

  if (stats === 'error') return <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t('adm_error')}</p>
  if (!stats) return <p role="status" className="text-sm text-[#5B6576]">{t('loading')}</p>

  const n = (v: number) => fmtNum(v, lang)
  const signedShare = stats.active_today ? Math.round((stats.signed_in_today / stats.active_today) * 100) : 0
  const pct = (s: string | null, dark = false) => s && <span className={`text-[12px] font-bold ${s.startsWith('−') ? (dark ? 'text-[#F0A08F]' : 'text-[#B4492A]') : dark ? 'text-[#9BE3BC]' : 'text-[#2E7D4F]'}`}>{s}</span>
  const points = { daily: stats.active_daily, weekly: stats.active_weekly, monthly: stats.active_monthly }[period] ?? []
  const chips: [string, string, string | null][] = [
    [t('adm_activeWeek'), n(stats.active_week), change(stats.active_week, stats.active_week_prev)],
    [t('adm_activeMonth'), n(stats.active_month), change(stats.active_month, stats.active_month_prev)],
    [t('adm_sticky'), stats.stickiness == null ? '–' : `${Math.round(stats.stickiness * 100)}%`, null],
    [t('adm_accounts'), n(stats.accounts), stats.accounts_new_week ? `+${stats.accounts_new_week}` : null],
  ]

  // busy hours: 6am to 11pm, Monday to Sunday
  const hours = Array.from({ length: 18 }, (_, i) => i + 6)
  const busy = new Map(stats.busy_hours.map((b) => [`${b.dow}-${b.h}`, b.n]))
  const busyMax = Math.max(1, ...stats.busy_hours.map((b) => b.n))
  const weekday = (d: number) => new Date(Date.UTC(2026, 9, 25 + d)).toLocaleDateString(LOCALE[lang], { weekday: 'short', timeZone: 'UTC' }) // 26 Oct 2026 is a Monday
  const hourLabel = (h: number) => new Date(Date.UTC(2026, 0, 1, h)).toLocaleTimeString(LOCALE[lang], { hour: 'numeric', timeZone: 'UTC' })

  const platformName: Record<string, string> = { web: t('adm_web'), android: t('adm_android'), ios: t('adm_ios'), app: t('adm_appOld') }
  const langName = (c: string) => LANGUAGES.find((l) => l.code === c)?.label ?? c
  const trailName = (slug: string) => { const tr = trails?.trails.find((x) => x.slug === slug); return tr ? t(trailNameKey(tr)) : slug }
  const funnel: [string, number][] = [[t('adm_fSearch'), stats.funnel.search], [t('adm_fPlan'), stats.funnel.plan], [t('adm_fOpen'), stats.funnel.open], [t('adm_fShare'), stats.funnel.share]]
  const fMax = Math.max(1, ...funnel.map((f) => f[1]))

  return (
    <div className="space-y-5">
      {/* active today, with this week / month, stickiness and accounts */}
      <section id="adm-users" aria-label={t('adm_activeToday')} className="relative scroll-mt-24 overflow-hidden rounded-[26px] bg-[#222D52] p-6 text-white sm:p-7">
        <svg aria-hidden="true" className="pointer-events-none absolute right-0 top-0 hidden h-full w-[520px] opacity-20 sm:block" viewBox="0 0 520 260" preserveAspectRatio="xMaxYMid slice">
          <g fill="none" stroke="#8AB4F8" strokeWidth="3" strokeLinecap="round"><path d="M40 260 C140 180 220 170 300 120 S440 40 520 30" /><path d="M120 260 C200 200 260 210 340 150 S470 110 520 100" /><path d="M200 0 C240 70 300 120 360 150 S460 230 520 250" /></g>
        </svg>
        <p className="relative text-[13px] font-bold tracking-[0.12em] text-[#8AB4F8]">{t('adm_activeToday').toUpperCase()}</p>
        <div className="relative mt-2 flex flex-wrap items-end gap-3">
          <p className="font-display text-[52px] leading-none tabular-nums sm:text-[64px]">{n(stats.active_today)}</p>
          {change(stats.active_today, stats.active_today_prev) && <span className="mb-2 rounded-full bg-[#7FD1A8]/20 px-2.5 py-0.5 text-sm font-bold text-[#9BE3BC]">{t('adm_vsLastWeekDay').replace('{p}', change(stats.active_today, stats.active_today_prev)!)}</span>}
        </div>
        <p className="relative mt-2 text-sm text-white/70">{t('adm_signedShare').replace('{s}', String(signedShare)).replace('{g}', String(100 - signedShare))}</p>
        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {chips.map(([k, v, d]) => (
            <div key={k} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5">
              <p className="text-[13px] text-white/70">{k}</p>
              <p className="mt-0.5 text-[22px] font-extrabold tabular-nums sm:text-[26px]">{v} {pct(d, true)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <Card title={t('adm_activeUsers')} aside={
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-[12px]"><i className="h-2.5 w-2.5 rounded-full bg-[#222D52]" />{t('adm_signedIn')}</span>
            <span className="flex items-center gap-1.5 text-[12px]"><i className="h-2.5 w-2.5 rounded-full bg-[#C9CFE0]" />{t('adm_guests')}</span>
            <Tabs label={t('adm_activeUsers')} value={period} onChange={setPeriod} options={[['daily', t('adm_daily')], ['weekly', t('adm_weekly')], ['monthly', t('adm_monthly')]]} />
          </div>}>
          <ActiveBars points={points} period={period} lang={lang} t={t} />
        </Card>

        <Card title={t('adm_comingBack')} aside={<span className="text-[12px] text-[#5B6576]">{t('adm_comingBackHint')}</span>}>
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
              <p className="mt-3 text-[12px] text-[#5B6576]">{t('adm_darker')}</p>
            </>
          ) : <None t={t} />}
        </Card>
      </div>

      <div id="adm-trips" className="grid scroll-mt-24 gap-5 lg:grid-cols-[1.15fr_1fr_0.9fr]">
        <Card title={t('adm_busy')} aside={<span className="text-[12px] text-[#5B6576]">{t('adm_busyHint')}</span>}>
          {stats.busy_hours.length ? (
            <div className="overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full min-w-[440px] text-[11px]">
                <thead><tr><td />{hours.map((h) => <th key={h} className="pb-1 text-center font-normal text-[#5B6576]">{h % 3 === 0 ? hourLabel(h) : ''}</th>)}</tr></thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <tr key={d}>
                      <th className="pe-1.5 text-start font-normal text-[#5B6576]">{weekday(d)}</th>
                      {hours.map((h) => { const v = busy.get(`${d}-${h}`) ?? 0; return <td key={h} className="p-[1.5px]"><div title={`${weekday(d)} ${hourLabel(h)}: ${v}`} className="h-[22px] rounded-[4px]" style={{ background: v ? `rgba(34,45,82,${(0.12 + (v / busyMax) * 0.88).toFixed(2)})` : '#F2F6FB' }} /></td> })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <None t={t} />}
        </Card>

        <Card title={t('adm_trips')}>
          {stats.top_trips.length ? <Ranked lang={lang} rows={stats.top_trips.slice(0, 5).map((x) => ({ key: `${x.from}>${x.to}`, n: x.n, k: <><span>{x.from}</span> <span className="text-[#8A93A2]">→</span> <span className="font-normal">{x.to}</span></> }))} /> : <None t={t} />}
        </Card>

        <Card title={t('adm_countries')}>
          {stats.countries.length ? <Share lang={lang} rows={stats.countries.slice(0, 6).map((c, i) => ({ k: c.c ? countryName(c.c, lang) : t('adm_notGiven'), n: c.n, c: c.c ? COLORS[i % 5] : COLORS[5] }))} /> : <None t={t} />}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.8fr]">
        <Card title={t('adm_stationsT')}>
          {stats.hot_stations.length ? <Ranked lang={lang} rows={stats.hot_stations.slice(0, 6).map((s) => ({ key: s.s, n: s.n, k: <span className="inline-flex items-center gap-1.5">{linesOf(s.s).map((l) => <i key={l.id} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: l.color }} />)}{s.s}</span> }))} /> : <None t={t} />}
        </Card>

        <Card title={t('adm_searchesT')} aside={<Tabs label={t('adm_searchesT')} value={searchTab} onChange={setSearchTab} options={[['top', t('adm_mostSearched')], ['none', t('adm_foundNothing')]]} />}>
          {(() => { const rows = searchTab === 'top' ? stats.top_searches : stats.no_result_searches; return rows.length ? <Ranked lang={lang} rows={rows.slice(0, 6).map((s) => ({ key: s.q, n: s.n, k: s.q }))} /> : <None t={t} /> })()}
        </Card>

        <section aria-label={t('adm_live')} className="flex flex-col rounded-[22px] bg-[#8AB4F8] p-6 text-[#222D52]">
          <h2 className="text-[13px] font-bold">{t('adm_live')}</h2>
          <p className="mt-3 font-display text-[46px] leading-none tabular-nums">{n(stats.live_shares)}</p>
          <p className="mt-1 text-[14px]">{t('adm_liveText')}</p>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-6 text-[13px]">
            <div className="rounded-xl bg-white/55 p-3"><p className="text-[#434C5C]">{t('adm_avgShare')}</p><b className="text-[18px]">{stats.live_share_minutes == null ? '–' : t('adm_min').replace('{n}', String(stats.live_share_minutes))}</b></div>
            <div className="rounded-xl bg-white/55 p-3"><p className="text-[#434C5C]">{t('adm_vsLastMonth')}</p><b className="text-[18px]">{change(stats.live_shares, stats.live_shares_prev) ?? '–'}</b></div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title={t('adm_platform')}>
          {stats.platforms.length ? <Share lang={lang} rows={stats.platforms.map((p, i) => ({ k: platformName[p.p] ?? p.p, n: p.n, c: COLORS[i % 5] }))} /> : <None t={t} />}
        </Card>
        <Card title={t('adm_language')}>
          {stats.languages.length ? <Share lang={lang} rows={stats.languages.map((l, i) => ({ k: langName(l.l), n: l.n, c: COLORS[i % 5] }))} /> : <None t={t} />}
        </Card>
        <Card title={t('adm_funnel')}>
          <div className="space-y-2.5">
            {funnel.map(([k, v], i) => (
              <div key={k} className={`flex justify-between gap-3 rounded-xl px-4 py-2.5 text-[14px] ${i ? 'text-[#222D52]' : 'text-white'}`} style={{ width: `${Math.max(64, (v / fMax) * 100)}%`, background: i ? `rgba(34,45,82,${0.06 + (3 - i) * 0.05})` : NAVY }}>
                <span>{k}</span><b className="tabular-nums">{n(v)}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div id="adm-places" className="grid scroll-mt-24 gap-5 lg:grid-cols-[1.4fr_1fr]">
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
      <p className="text-[12px] text-[#5B6576]">{t('adm_soonNote')}</p>
    </div>
  )
}

export default AdminStats
