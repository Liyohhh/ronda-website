import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithLang } from '../test/render'

const loadAllAlerts = vi.fn()
const saveAlert = vi.fn()
const setAlertStatus = vi.fn()
vi.mock('../services/serviceAlerts', () => ({
  loadAllAlerts: () => loadAllAlerts(),
  saveAlert: (...a: unknown[]) => saveAlert(...a),
  setAlertStatus: (...a: unknown[]) => setAlertStatus(...a),
}))
const { default: ServiceAlertsAdmin } = await import('./ServiceAlertsAdmin')

const DRAFT = {
  id: 'a1', source: 'myrapid', source_url: null, effect: 'modified', title_en: 'Ampang Line: change at Chan Sow Lin',
  title_ms: null, title_zh: null, title_ar: null, body_en: 'Trains from Ampang turn back at Chan Sow Lin.', body_ms: null,
  body_zh: null, body_ar: null, line_ids: ['lrt-ampang'], station_names: ['Chan Sow Lin'], starts_at: '2026-10-23T08:00:00Z',
  ends_at: null, status: 'draft', published_at: null, planner_rule: null,
}

describe('ServiceAlertsAdmin', () => {
  beforeEach(() => {
    loadAllAlerts.mockReset().mockResolvedValue([DRAFT])
    saveAlert.mockReset().mockResolvedValue(undefined)
    setAlertStatus.mockReset().mockResolvedValue(undefined)
  })

  it('lists alerts with their state; a draft can be published', async () => {
    renderWithLang(<ServiceAlertsAdmin />)
    const row = (await screen.findByText('Ampang Line: change at Chan Sow Lin')).closest('li')!
    expect(within(row).getByText('Draft')).toBeInTheDocument()
    fireEvent.click(within(row).getByRole('button', { name: 'Publish' }))
    await waitFor(() => expect(setAlertStatus).toHaveBeenCalledWith('a1', 'published'))
  })

  it('a new alert needs an English title and a line before it saves', async () => {
    renderWithLang(<ServiceAlertsAdmin />)
    fireEvent.click(await screen.findByRole('button', { name: 'New alert' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Add an English title and at least one line.')
    expect(saveAlert).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Title (English)'), { target: { value: 'Kelana Jaya Line: fewer trains' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'LRT Kelana Jaya Line' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(saveAlert).toHaveBeenCalled())
    const [draft, id] = saveAlert.mock.calls[0]
    expect(id).toBeUndefined()
    expect(draft).toMatchObject({ title_en: 'Kelana Jaya Line: fewer trains', line_ids: ['lrt-kelana-jaya'], status: 'draft' })
  })

  it('a turn-back rule needs both stations and saves with the route of the line', async () => {
    renderWithLang(<ServiceAlertsAdmin />)
    const row = (await screen.findByText('Ampang Line: change at Chan Sow Lin')).closest('li')!
    fireEvent.click(within(row).getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Trains turn back at a station/ }))
    expect(screen.getByRole('combobox', { name: 'Line' })).toHaveValue('lrt-ampang')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Pick the line and fill in both stations')
    fireEvent.change(screen.getByLabelText('Trains from (end of the line)'), { target: { value: 'Ampang' } })
    fireEvent.change(screen.getByLabelText('Turn back at (station)'), { target: { value: 'Chan Sow Lin' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(saveAlert).toHaveBeenCalled())
    const [draft, id] = saveAlert.mock.calls[0]
    expect(id).toBe('a1')
    expect(draft.planner_rule).toEqual({ kind: 'turn_back', line_id: 'lrt-ampang', feed_id: 'rapid-rail-kl', route_id: 'AG', branch_from: 'Ampang', at_station: 'Chan Sow Lin' })
  })
})
