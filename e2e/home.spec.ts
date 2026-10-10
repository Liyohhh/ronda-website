import { expect, test } from './mocks'

// Home page order under the search card: Trails (Explore) -> Promotions -> slides -> "Everything you need"
const ORDER = ['trails-title', 'promo-title', 'slides-title', 'features-title']

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
