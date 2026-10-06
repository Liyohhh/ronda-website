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

test('Arabic: the halal pill filters to the halal trail, on /trails and on Home', async ({ page, backend }) => {
  void backend
  await page.addInitScript(() => localStorage.setItem('ronda-lang', 'ar'))
  await page.goto('/trails')
  await page.getByRole('button', { name: AR_PILL }).click()
  await expect(page).toHaveURL(/category=halal-fine-dining/)
  await expect(page.getByText('مطاعم الفنادق الحلال')).toBeVisible()
  await page.goto('/')
  await expect(page.locator('#explore').getByRole('button', { name: AR_PILL })).toBeVisible()
})
