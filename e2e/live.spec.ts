import { LIVE, expect, test } from './mocks'

test.describe('live bus map', () => {
  test('shows the buses in service and their count', async ({ page, backend }) => {
    await page.goto('/live')
    await expect(page.getByRole('heading', { name: 'Live bus map' })).toBeVisible()
    const inService = LIVE.vehicles.filter((v) => v.status !== 'off_trip').length
    await expect(page.getByText(`${inService} buses live`)).toBeVisible()
    await expect(page.locator('.ronda-bus')).toHaveCount(inService)
    expect(backend.calls.some((c) => c.path === '/functions/v1/live' && (c.body as { action?: string })?.action === 'vehicles')).toBe(true)
  })

  test('route filter accepts a typed route code', async ({ page, backend }) => {
    void backend
    await page.goto('/live')
    await page.getByRole('textbox', { name: /route/i }).fill('t 789')
    await expect(page.locator('.ronda-bus')).toHaveCount(1)
  })

  test('feed error is shown instead of an empty map', async ({ page, backend }) => {
    void backend
    await page.route('https://e2e.supabase.test/functions/v1/live', (r) =>
      r.fulfill({ status: 500, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"error":"down"}' }))
    await page.goto('/live')
    await expect(page.getByText('Live positions are not available right now')).toBeVisible()
  })
})

test.describe('Near me', () => {
  test.describe('location allowed', () => {
    test.use({ geolocation: { latitude: 3.1340, longitude: 101.6865 }, permissions: ['geolocation'] })
    test('centres the map and marks where you are', async ({ page, backend }) => {
      void backend
      await page.goto('/live')
      await page.getByRole('button', { name: 'Near me' }).click()
      await expect(page.locator('.leaflet-interactive[fill="#2563EB"]')).toHaveCount(1)
      await expect(page.getByRole('status')).toHaveCount(0)
    })
  })

  test('location blocked: says so instead of doing nothing', async ({ page, backend, context }) => {
    void backend
    await context.clearPermissions()
    await page.goto('/live')
    await page.getByRole('button', { name: 'Near me' }).click()
    await expect(page.getByRole('status')).toHaveText(/Location is blocked for this site/)
  })
})

test('map tiles failing: says the map could not load', async ({ page, backend }) => {
  void backend
  await page.route('https://tile.openstreetmap.org/**', (r) => r.abort())
  await page.goto('/live')
  await expect(page.getByRole('alert')).toHaveText(/The map could not load/)
})
