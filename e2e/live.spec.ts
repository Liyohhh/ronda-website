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
