import { expect, test } from './mocks'

test.use({ geolocation: { latitude: 3.1478, longitude: 101.7111 }, permissions: ['geolocation'] })

test('Near you: with location allowed, the nearest train and bus stop show in one line under the search bar; a station becomes the Start', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  const train = page.getByRole('button', { name: /^MRT Bukit Bintang · 144 m · 3 min walk/ })
  await expect(train).toBeVisible()
  await expect(page.getByRole('button', { name: /MRT Bukit Bintang\/Hsbc \(KL86\) · 29 m/ })).toBeVisible()
  await train.click()
  await expect(page.locator('#start-input')).toHaveValue('MRT Bukit Bintang')
})
