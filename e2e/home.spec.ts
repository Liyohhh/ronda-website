import { expect, test } from './mocks'

// Home page order under the search card: RONDA 300 trails (always first) -> Promotions -> "Everything you need" ->
// Why RONDA (Services and the feature slides are off the page for now)
const ORDER = ['trails-title', 'promo-title', 'features-title', 'why-title']

test('home sections come in the agreed order', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  await expect(page.locator('#features-title')).toBeAttached()
  const ids = await page.locator('main h2[id]').evaluateAll((hs) => hs.map((h) => h.id))
  expect(ids.filter((id) => ORDER.includes(id))).toEqual(ORDER)
  await expect(page.locator('#explore')).toBeAttached()
})

test('every promotion is labelled as an ad', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  const cards = page.locator('section[aria-labelledby="promo-title"] [data-promo]')
  await expect(cards).toHaveCount(4) // wide banner + 3 cards
  for (const card of await cards.all()) await expect(card.getByText('Ad', { exact: true })).toBeVisible()
})

for (const width of [375, 768, 1440]) {
  test(`home sections do not overlap at ${width}px`, async ({ page, backend }) => {
    void backend
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.locator('#features-title')).toBeAttached()
    const boxes = await Promise.all(ORDER.map(async (id) => {
      const sec = page.locator(`section[aria-labelledby="${id}"]`)
      return (await sec.boundingBox())!
    }))
    for (let i = 1; i < boxes.length; i++) {
      // each section starts at or below where the one before it ends (the navy band's overlap sits inside the slides card's own padding)
      expect(boxes[i].y, `${ORDER[i]} vs ${ORDER[i - 1]}`).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height - 1)
    }
    const doc = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(doc).toBeLessThanOrEqual(width)
  })
}

test('RONDA 300 switches between the trails and the station map', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  const section = page.locator('#explore')
  await section.getByRole('button', { name: 'Station map' }).click()
  await expect(section.getByRole('button', { name: 'Station map' })).toHaveAttribute('aria-pressed', 'true')
  await expect(section.getByRole('link', { name: /Open RONDA 300/ })).toHaveAttribute('href', '/ronda-300')
  await section.getByRole('button', { name: 'Trails' }).click()
  await expect(section.getByRole('link', { name: /See all trails/i })).toBeVisible()
})
