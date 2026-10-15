import { expect, test } from './mocks'

// Fun & Activities: a category of seven small trails; places by a station show it with the walk, bus-only places
// show their bus stop and routes
test('Fun & Activities pill lists its seven trails', async ({ page, backend }) => {
  void backend
  await page.goto('/trails')
  await page.getByRole('button', { name: 'Fun & Activities' }).click()
  await expect(page).toHaveURL(/category=activities/)
  for (const name of ['Climbing & Bouldering', 'Arcades & Indoor Theme Parks', 'Trampoline & Active Play', 'Escape Rooms', 'Laser Tag', 'Paintball', 'Karting']) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  }
})

test('climbing trail: station stop with its walk, bus stop for a bus-only place', async ({ page, backend }) => {
  void backend
  await page.goto('/trails/climbing')
  await expect(page.getByText('Camp5 KL Eco City').first()).toBeVisible()
  await expect(page.getByText('LRT Abdullah Hukum').first()).toBeVisible()
  await expect(page.getByText('Jaya One Mall (bus T787, T790)').first()).toBeVisible()
})

test('paintball trail: both fields with their feeder bus stop', async ({ page, backend }) => {
  void backend
  await page.goto('/trails/paintball')
  await expect(page.getByText('Sri Awana Paintball Park').first()).toBeVisible()
  await expect(page.getByText('Bangi Gateway Mall (bus T464)').first()).toBeVisible()
  await expect(page.getByText('Surau Nurul Iman PUJ 9 (bus T543)').first()).toBeVisible()
})

test('Malay: category and trail names translated', async ({ page, backend }) => {
  void backend
  await page.addInitScript(() => localStorage.setItem('ronda-lang', 'ms'))
  await page.goto('/trails?category=activities')
  await expect(page.getByText('Bilik Lolos', { exact: true }).first()).toBeVisible()
})
