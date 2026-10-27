import { expect, test } from './mocks'

test('RONDA 300: one map with the places in view listed beside it, filtered by kind, each plannable', async ({ page, backend }) => {
  await page.goto('/ronda-300')
  await expect(page.getByRole('heading', { name: 'RONDA 300', level: 1 })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Map of the rail stations in the Klang Valley' })).toBeVisible()
  await expect.poll(() => backend.calls.some((c) => c.path === '/rest/v1/stops')).toBe(true)
  // the search flies the map to the station; the list follows the map
  await page.getByRole('combobox', { name: 'Find a station' }).fill('klcc')
  await page.getByRole('option', { name: /LRT KLCC/ }).click()
  const panel = page.getByRole('region', { name: /places in this area/ })
  await expect(panel.getByRole('listitem')).toHaveCount(3)
  await expect(panel.getByRole('listitem').first()).toContainText('Test Kopitiam')
  await expect(panel.getByRole('listitem').first()).toContainText('About 1 min walk from LRT KLCC')
  await panel.getByRole('button', { name: /Parks/ }).click()
  await expect(panel.getByRole('listitem')).toHaveCount(1)
  await expect(panel.getByRole('link', { name: 'Plan a trip here' })).toHaveAttribute('href', /toLat=3\.158&toLon=101\.712&toName=Test%20Park/)
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
