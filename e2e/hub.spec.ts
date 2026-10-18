import { expect, test } from './mocks'

test('hub page: popular places from KLIA T1 with time, changes, fare and lines; plan opens Home with both boxes filled', async ({ page, backend }) => {
  void backend
  await page.goto('/hub/klia1')
  await expect(page.getByRole('heading', { name: 'From KLIA Terminal 1', level: 1 })).toBeVisible()
  const klcc = page.getByRole('listitem').filter({ hasText: 'KLCC & Petronas Twin Towers' })
  await expect(klcc).toContainText('1 change')
  await expect(klcc).toContainText('RM57.10')
  await expect(klcc).toContainText('ERL KLIA Ekspres / Transit → LRT Kelana Jaya Line')
  await expect(page.getByRole('listitem').filter({ hasText: 'Putrajaya' })).toContainText('no change')
  await klcc.getByRole('link', { name: 'Plan this trip' }).click()
  await expect(page.locator('#start-input')).toHaveValue('KLIA Terminal 1')
  await expect(page.locator('#end-input')).toHaveValue('KLCC & Petronas Twin Towers')
})


test('just landed: type the hotel on the airport hub page, pick it, the planner opens from the airport to the hotel', async ({ page, backend }) => {
  void backend
  await page.goto('/hub/klia1')
  await expect(page.getByRole('heading', { name: 'Just landed? Where are you staying?' })).toBeVisible()
  await page.getByRole('combobox', { name: /Type your hotel/ }).fill('grand hyatt')
  await page.getByRole('option', { name: /Grand Hyatt/ }).click()
  await expect(page.locator('#start-input')).toHaveValue('KLIA Terminal 1')
  await expect(page.locator('#end-input')).toHaveValue('Grand Hyatt')
})
