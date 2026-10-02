import AxeBuilder from '@axe-core/playwright'
import { PLAN, expect, test } from './mocks'

// Critical path: pick a start and an end from the suggestions, plan, see the journey.
async function pickPlace(page: import('@playwright/test').Page, field: 'Start' | 'End', typed: string, option: RegExp) {
  const box = page.getByRole('combobox', { name: field, exact: true })
  await box.fill(typed)
  await page.getByRole('option', { name: option }).first().click()
  await expect(box).not.toHaveValue(typed)
}

test.describe('plan a journey', () => {
  test('KLCC to Pasar Seni shows the planned options', async ({ page, backend }) => {
    await page.goto('/')
    await pickPlace(page, 'Start', 'kj10', /KLCC/)
    await pickPlace(page, 'End', 'pasar', /LRT Pasar Seni/)
    await page.getByRole('button', { name: 'Search' }).click()

    const panel = page.getByRole('dialog', { name: 'Your journey' })
    await expect(panel).toBeVisible()
    // each option as the planner sent it: duration and fare, and the bus route number on its chip
    for (const o of PLAN.options) {
      await expect(panel.getByText(`${o.duration_min} min`, { exact: true }).first()).toBeVisible()
      await expect(panel.getByText(`RM ${o.fare.amount.toFixed(2)}`).first()).toBeVisible()
    }
    const bus = PLAN.options.flatMap((o: { legs: { route_type?: number; route_short_name?: string }[] }) => o.legs).find((l: { route_type?: number }) => l.route_type === 3)
    if (bus) await expect(panel.getByText(bus.route_short_name!, { exact: true }).first()).toBeVisible()

    // the planner got the chosen stops' coordinates and the default fare options
    const call = backend.calls.find((c) => c.path === '/functions/v1/plan-trip')
    expect(call?.body).toMatchObject({ resident: 'citizen', payment: 'cashless' })
    const [klcc] = (await import('./fixtures/search_klcc.json', { with: { type: 'json' } })).default
    expect(call?.body).toMatchObject({ from: { lat: klcc.stop_lat, lon: klcc.stop_lon } })
  })

  test('journey panel has no serious accessibility violations', async ({ page, backend }) => {
    void backend
    await page.goto('/')
    await pickPlace(page, 'Start', 'kj10', /KLCC/)
    await pickPlace(page, 'End', 'pasar', /LRT Pasar Seni/)
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByRole('dialog', { name: 'Your journey' })).toBeVisible()
    const { violations } = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const bad = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')} - ${v.help}`)).toEqual([])
  })

  test('typed text that is not picked from the list asks to choose', async ({ page, backend }) => {
    void backend
    await page.goto('/')
    await page.getByRole('combobox', { name: 'Start', exact: true }).fill('somewhere')
    await page.getByRole('combobox', { name: 'End', exact: true }).fill('elsewhere')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText('Please choose your Start and End from the suggestion list.')).toBeVisible()
  })

  test('planner error is shown, not a blank panel', async ({ page, backend }) => {
    backend.planTrip = () => ({ status: 500, json: { error: 'boom' } })
    await page.goto('/')
    await pickPlace(page, 'Start', 'kj10', /KLCC/)
    await pickPlace(page, 'End', 'pasar', /LRT Pasar Seni/)
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText('Something went wrong while planning your trip. Please try again.')).toBeVisible()
  })

  test('no route found is explained', async ({ page, backend }) => {
    backend.planTrip = () => ({ json: { ...PLAN, options: [], more_options: [] } })
    await page.goto('/')
    await pickPlace(page, 'Start', 'kj10', /KLCC/)
    await pickPlace(page, 'End', 'pasar', /LRT Pasar Seni/)
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText('No routes found for this trip. Try a different time or nearby stop.')).toBeVisible()
  })

  test('rate limited (429) shows the planner error', async ({ page, backend }) => {
    backend.planTrip = () => ({ status: 429, json: { error: 'too many requests, try again in a minute' } })
    await page.goto('/')
    await pickPlace(page, 'Start', 'kj10', /KLCC/)
    await pickPlace(page, 'End', 'pasar', /LRT Pasar Seni/)
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText(/Something went wrong/)).toBeVisible()
  })
})

test.describe('lines search', () => {
  test('a bus route code finds the route, however it is typed', async ({ page, backend }) => {
    void backend
    await page.goto('/')
    await page.getByRole('button', { name: 'Lines', exact: true }).click()
    const box = page.getByRole('combobox', { name: 'Line', exact: true })
    for (const typed of ['T352', 't 0352']) {
      await box.fill(typed)
      await expect(page.locator('#line-list').getByText('T352', { exact: true }).first()).toBeVisible()
    }
  })
})

test.describe('Enter in the place boxes', () => {
  test('Enter takes the top suggestion; Enter in End plans the trip', async ({ page, backend }) => {
    await page.goto('/')
    const start = page.getByRole('combobox', { name: 'Start', exact: true })
    await start.fill('kj10')
    await expect(page.getByRole('option', { name: /KLCC/ }).first()).toBeVisible()
    await start.press('Enter')
    await expect(start).toHaveValue(/KLCC/)
    const end = page.getByRole('combobox', { name: 'End', exact: true })
    await end.fill('pasar')
    await expect(page.getByRole('option', { name: /Pasar Seni/ }).first()).toBeVisible()
    await end.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Your journey' })).toBeVisible()
    expect(backend.calls.some((c) => c.path === '/functions/v1/plan-trip')).toBe(true)
  })

  test('Enter pressed before the suggestions arrive waits for them', async ({ page, backend }) => {
    void backend
    // slow stop search: Enter is pressed while it is still loading
    await page.route('https://e2e.supabase.test/rest/v1/rpc/search_stops', async (route) => {
      await new Promise((r) => setTimeout(r, 800))
      await route.fallback()
    })
    await page.goto('/')
    const start = page.getByRole('combobox', { name: 'Start', exact: true })
    await start.fill('kj10')
    await start.press('Enter')
    await expect(start).toHaveValue(/KLCC/)
    await expect(page.getByText('Please choose your Start and End from the suggestion list.')).toHaveCount(0)
  })
})
