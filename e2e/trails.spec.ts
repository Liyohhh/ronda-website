import { expect, test } from './mocks'

// The halal fine-dining trail category is shown only when the site is in Arabic
const AR_PILL = 'مطاعم حلال راقية'

test('English: no halal fine-dining pill, card or menu item', async ({ page, backend }) => {
  void backend
  await page.goto('/trails')
  await expect(page.getByRole('button', { name: 'Food & Drink' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Halal fine dining' })).toHaveCount(0)
  await expect(page.getByText('Halal hotel dining')).toHaveCount(0)
  // a shared link to the category falls back to all trails
  await page.goto('/trails?category=halal-fine-dining')
  await expect(page.getByRole('button', { name: 'All', pressed: true })).toBeVisible()
})

test('Arabic: the halal pill filters to the halal trail on /trails; Home lists the trail', async ({ page, backend }) => {
  void backend
  await page.addInitScript(() => localStorage.setItem('ronda-lang', 'ar'))
  await page.goto('/trails')
  await page.getByRole('button', { name: AR_PILL }).click()
  await expect(page).toHaveURL(/category=halal-fine-dining/)
  await expect(page.getByText('مطاعم الفنادق الحلال')).toBeVisible()
  await page.goto('/')
  // Home has category cards and a Featured trails row (no pills): the halal trail is in the row
  await expect(page.locator('#explore a[href="/trails/halal-fine-dining"]')).toBeVisible()
})

test('Home "See all trails" keeps the picked category; a trail opened there goes back to it', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  const row = page.locator('#explore')
  await row.getByRole('button', { name: 'Culture & Heritage' }).click()
  await row.getByRole('link', { name: 'See all trails' }).click()
  await expect(page).toHaveURL(/\/trails\?category=culture/)
  await expect(page.getByRole('button', { name: 'Culture & Heritage', pressed: true })).toBeVisible()
  // the trail page's back button returns to the filtered list
  await page.locator('a[href="/trails/heritage"]').click()
  await expect(page).toHaveURL(/\/trails\/heritage$/)
  await page.getByRole('link', { name: 'Back to all trails' }).click()
  await expect(page).toHaveURL(/\/trails\?category=culture/)
})

test('a trail opened from Home goes back to Home', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  await page.locator('#explore a[href="/trails/heritage"]').click()
  await expect(page).toHaveURL(/\/trails\/heritage$/)
  await page.getByRole('link', { name: 'Back to home' }).click()
  await expect(page).toHaveURL(/\/#explore$/)
})
