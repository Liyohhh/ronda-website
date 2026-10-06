import { expect, test } from './mocks'

test('RONDA 300: a station with places lists them with plan links', async ({ page, backend }) => {
  void backend
  await page.goto('/ronda-300')
  await expect(page.getByRole('heading', { name: 'RONDA 300', level: 1 })).toBeVisible()
  await page.getByRole('combobox', { name: 'Find a station' }).fill('klcc')
  await page.getByRole('option', { name: /LRT KLCC/ }).click()
  await expect(page.getByRole('heading', { name: 'Places near LRT KLCC' })).toBeVisible()
  const plan = page.getByRole('link', { name: 'Plan a trip here' }).first()
  await expect(plan).toHaveAttribute('href', /\/\?to=LRT%20KLCC&toName=/)
})

test('RONDA 300: a station without places says so and shows the nearest that have some', async ({ page, backend }) => {
  void backend
  await page.goto('/ronda-300')
  await page.getByRole('combobox', { name: 'Find a station' }).fill('pasar seni')
  await page.getByRole('option', { name: /LRT Pasar Seni/ }).click()
  await expect(page.getByText('No places listed near LRT Pasar Seni yet.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nearest stations with places' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /MRT Pasar Seni · 0\.\d km away/ })).toBeVisible()
})

test('header: Hub, Explore, RONDA 300, Services, About in that order; Explore goes to the trails on Home', async ({ page, backend }) => {
  void backend
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about')
  const nav = page.getByRole('navigation', { name: 'Main' }).first()
  await expect(nav.getByRole('button')).toHaveText(['Hub', 'Explore', 'RONDA 300', 'Services', 'About'])
  await nav.getByRole('button', { name: 'Explore' }).click()
  await expect(page).toHaveURL(/\/#explore$/)
  await expect(page.locator('#explore')).toBeInViewport()
  await expect(nav.getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-expanded', 'false')
})
