import { expect, test } from './mocks'

test('RONDA 300: map with the places in view beside it, RONDA picks with photos, filtered by kind, each plannable', async ({ page, backend }) => {
  await page.goto('/ronda-300')
  await expect(page.getByRole('heading', { name: 'RONDA 300', level: 1 })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Map of the rail stations in the Klang Valley' })).toBeVisible()
  await expect.poll(() => backend.calls.some((c) => c.path === '/rest/v1/stops')).toBe(true)
  // the search flies the map to the station; the list follows the map
  await page.getByRole('combobox', { name: 'Find a station' }).fill('klcc')
  await page.getByRole('option', { name: /LRT KLCC/ }).click()
  const panel = page.getByRole('region', { name: /places in this area/ })
  // the station in focus, its places within 5 min, and the hand-picked places nearby with photos
  await expect(panel.getByText('3 places within a 5 min walk')).toBeVisible({ timeout: 15_000 }) // the map loads, then flies
  await expect(panel.getByRole('heading', { name: 'RONDA picks' })).toBeVisible()
  await expect(panel.getByRole('link', { name: /Petrosains/ })).toHaveAttribute('href', /toLat=3\.1579&toLon=101\.7119/)
  await expect(page.getByRole('button', { name: 'Petrosains' })).toBeVisible() // its photo pin on the map
  const places = panel.locator('li[data-osm]')
  await expect(places).toHaveCount(3)
  await expect(places.first()).toContainText('Test Kopitiam')
  await expect(places.first()).toContainText('About 1 min walk from LRT KLCC')
  await panel.getByRole('button', { name: /Parks/ }).click()
  await expect(places).toHaveCount(1)
  await expect(panel.getByRole('link', { name: 'Go, plan a trip to Test Park' })).toHaveAttribute('href', /toLat=3\.158&toLon=101\.712&toName=Test%20Park/)
  await expect(panel.getByRole('link', { name: '© OpenStreetMap contributors' })).toBeVisible()
})

test('header: Hub, RONDA 300, About in that order (Services hidden for now); RONDA 300 goes to its section on Home', async ({ page, backend }) => {
  void backend
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about')
  const nav = page.getByRole('navigation', { name: 'Main' }).first()
  await expect(nav.getByRole('button')).toHaveText(['Hub', 'RONDA 300', 'About'])
  await nav.getByRole('button', { name: 'RONDA 300' }).click()
  await expect(page).toHaveURL(/\/#explore$/)
  await expect(page.locator('#explore')).toBeInViewport()
  await expect(nav.getByRole('button', { name: 'RONDA 300' })).toHaveAttribute('aria-expanded', 'false')
})
