import { expect, test } from './mocks'

test('RONDA 300: before a search, a map of the rail stations to start from', async ({ page, backend }) => {
  await page.goto('/ronda-300')
  await expect(page.getByRole('heading', { name: 'RONDA 300', level: 1 })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Map of the rail stations in the Klang Valley' })).toBeVisible()
  await expect(page.getByText('Press a station to see what is around it')).toBeVisible()
  await expect.poll(() => backend.calls.some((c) => c.path === '/rest/v1/stops')).toBe(true)
  // no hand-picked list any more: picking a station shows only what is mapped around it
  await page.getByRole('combobox', { name: 'Find a station' }).fill('klcc')
  await page.getByRole('option', { name: /LRT KLCC/ }).click()
  await expect(page.getByRole('region', { name: 'Around LRT KLCC' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Places near LRT KLCC' })).toHaveCount(0)
})

test('RONDA 300: places mapped around the station, nearest first, filtered by kind, each plannable', async ({ page, backend }) => {
  void backend
  await page.goto('/ronda-300')
  await page.getByRole('combobox', { name: 'Find a station' }).fill('klcc')
  await page.getByRole('option', { name: /LRT KLCC/ }).click()
  const around = page.getByRole('region', { name: 'Around LRT KLCC' })
  await expect(around.getByRole('listitem')).toHaveCount(3)
  await expect(around.getByRole('listitem').first()).toContainText('Test Kopitiam')
  await expect(around.getByRole('listitem').first()).toContainText('60 m · about 1 min walk')
  await around.getByRole('button', { name: /Parks/ }).click()
  await expect(around.getByRole('listitem')).toHaveCount(1)
  await expect(around.getByRole('link', { name: 'Plan a trip here' })).toHaveAttribute('href', /toLat=3\.158&toLon=101\.712&toName=Test%20Park/)
  await expect(around.getByRole('link', { name: '© OpenStreetMap contributors' })).toBeVisible()
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
