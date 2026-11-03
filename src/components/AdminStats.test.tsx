import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AdminView } from './AdminStats'
import { translations, type TranslationKey } from '../i18n/translations'
import type { AdminStats, Ops } from '../services/adminStats'

const t = (k: TranslationKey) => translations.en[k]
const days = (f: (i: number) => number) => Array.from({ length: 30 }, (_, i) => ({ d: `2026-10-${String(i + 1).padStart(2, '0')}`, n: f(i), s: 0 }))

const base: AdminStats = {
  active_today: 12, active_week: 50, active_month: 340, active_today_prev: 10, active_week_prev: 40, active_month_prev: 200, signed_in_today: 2,
  stickiness: 0.1, active_daily: days((i) => i), active_weekly: days((i) => i * 3).slice(0, 12), active_monthly: days((i) => i * 9).slice(0, 12),
  cohorts: [], busy_hours: [], top_trips: [], hot_stations: [{ s: 'LRT Titiwangsa', n: 55 }], top_searches: [], no_result_searches: [],
  live_shares: 9, live_shares_prev: 0, live_share_minutes: 20, platforms: [{ p: 'web', n: 92 }, { p: 'app', n: 6 }], languages: [{ l: 'en', n: 78 }],
  funnel: { search: 171, plan: 168, open: 0, share: 9 }, places: [], trails: [], alert_reach: [], accounts: 25, accounts_new_week: 3, countries: [],
}

const ops: Ops = {
  feeds_total: 20, feeds_published: 8, feeds: [{ id: 'ktmb', name: 'KTM Berhad', status: 'live', published: true, last: '2026-11-02T17:30:13Z' }],
  imports_failed: 0, live_vehicles: 0, live_fetched_at: '2026-11-01T14:44:07Z',
  last_import: { feed_id: 'ktmb', status: 'done', at: '2026-11-02T17:30:13Z', error: null },
  live_sources: [{ source: 'kiosk', ok: true, vehicles: 480, at: '2026-11-01T14:44:07Z' }],
  alerts_in_force: 1, data_alerts_open: 3, data_alerts: [{ kind: 'route_audit', feed_id: 'plan-trip', message: '14 of 56 trips flagged', first: '2026-10-14T17:26:39Z' }],
  ai_chats_30d: 0, ai_cost_30d: 0, ad_enquiries_new: 0,
}

const tile = (id: string) => document.querySelector(`[data-tile="${id}"]`) as HTMLElement

describe('AdminView', () => {
  it('shows each headline number once, with its change and where it comes from', () => {
    render(<AdminView stats={base} t={t} lang="en" />)
    expect(tile('active')).toHaveTextContent('340')
    expect(tile('active')).toHaveTextContent('+70%')
    expect(tile('active')).toHaveTextContent('+140 vs previous 30 days')
    expect(tile('today')).toHaveTextContent('2 signed in · 10 guests')
    expect(tile('trips')).toHaveTextContent('from 171 searches')
    expect(tile('accounts')).toHaveTextContent('+3 new this week')
    expect(screen.getAllByText('340')).toHaveLength(1)
    expect(screen.getAllByText('168')).toHaveLength(1)
    expect(screen.queryByText('171')).toBeNull() // only in the trips card's line
  })

  it('switches the chart and the top lists', () => {
    render(<AdminView stats={{ ...base, daily_events: days(() => 0).map((p) => ({ d: p.d, search: 2, plan: 1 })) }} t={t} lang="en" />)
    const chart = screen.getByRole('region', { name: 'Trends' })
    expect(chart).toHaveTextContent('Active users per day:')
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'trips' } })
    expect(chart).toHaveTextContent('Trips planned per day:')
    expect(screen.getByRole('region', { name: 'Top lists' })).toHaveTextContent('LRT Titiwangsa')
    fireEvent.click(screen.getByRole('button', { name: 'Languages' }))
    expect(screen.getByRole('region', { name: 'Top lists' })).toHaveTextContent('English')
  })

  it('offers trips and searches per day only when the database sends them', () => {
    render(<AdminView stats={base} t={t} lang="en" />)
    expect(screen.queryByRole('option', { name: 'Trips planned per day' })).toBeNull()
    expect(screen.getByRole('option', { name: 'Active users per week' })).toBeInTheDocument()
  })

  it('shows what happens after a trip is planned, with live sharing and website or app', () => {
    render(<AdminView stats={base} t={t} lang="en" />)
    const f = screen.getByRole('region', { name: 'After a trip is planned' })
    expect(f).toHaveTextContent('5%') // 9 of 168 trips shared live
    expect(f).toHaveTextContent('Average share 20 min')
    expect(f).toHaveTextContent('Website94%')
  })

  it('leaves out data and systems until the database sends them, then flags problems', () => {
    const { unmount } = render(<AdminView stats={base} t={t} lang="en" />)
    expect(screen.queryByRole('region', { name: 'Data and systems' })).toBeNull()
    unmount()
    render(<AdminView stats={{ ...base, ops }} t={t} lang="en" />)
    expect(tile('feeds')).toHaveTextContent('8of 20 feeds')
    expect(tile('import')).toHaveTextContent('Done')
    expect(tile('warnings')).toHaveTextContent('Data warnings: 3')
    expect(tile('vehicles').className).toContain('border-[#E8B4A6]')
    expect(screen.getByRole('region', { name: 'Data and systems' })).toHaveTextContent('14 of 56 trips flagged')
  })

  it('has every new text in all four languages', () => {
    const keys = Object.keys(translations.en).filter((k) => /^adm_(ov|ops|side|role|m[A-Z]|tab|top|trends|vsPrev|todaySplit|fromSearches|ofPlanned|afterPlan|imp)/.test(k)) as TranslationKey[]
    for (const l of ['ms', 'zh', 'ar'] as const) for (const k of keys) expect(translations[l][k], `${l} ${k}`).toBeTruthy()
  })
})
