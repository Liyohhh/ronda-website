import { expect, test } from './mocks'

test.use({ geolocation: { latitude: 3.1478, longitude: 101.7111 }, permissions: ['geolocation'] })

test('Near you: with location allowed, the nearest trains and buses show under the search bar; a station becomes the Start', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  const near = page.getByRole('region', { name: 'Near you' })
  await expect(near).toContainText('MRT Bukit Bintang')
  await expect(near).toContainText('MRT Kajang Line')
  await expect(near).toContainText('144 m · 3 min walk')
  await expect(near).toContainText('KL86 · 400 · 420')
  await near.getByRole('button', { name: /^MRT Bukit Bintang, 144 m/ }).click()
  await expect(page.locator('#start-input')).toHaveValue('MRT Bukit Bintang')
})
