import { expect, test } from './mocks'

// Smart search in the trip planner: typos, places before look-alike bus stops, repeated bus stops shown once,
// recent picks when the box is empty.
test.describe('smart search', () => {
  test.beforeEach(async ({ page, backend }) => {
    void backend
    await page.goto('/')
  })

  test('a typo still finds the station and says what was searched', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Start', exact: true }).fill('mrrt mluri')
    await expect(page.getByRole('status').filter({ hasText: 'Showing results for' })).toContainText('mrt maluri')
    const options = page.getByRole('option')
    await expect(options.first()).toContainText('MRT Maluri')
    // the bus stop across the road is listed once
    await expect(options.filter({ hasText: 'MRT Maluri Pintu B' })).toHaveCount(1)
  })

  test('the mall comes before a bus stop that only looks alike', async ({ page }) => {
    await page.getByRole('combobox', { name: 'End', exact: true }).fill('pavilion kl')
    await expect(page.getByRole('option').first()).toContainText('Pavilion Kuala Lumpur')
  })

  test('an empty box shows the places picked before', async ({ page }) => {
    const start = page.getByRole('combobox', { name: 'Start', exact: true })
    await start.fill('pasar')
    await page.getByRole('option', { name: /LRT Pasar Seni/ }).first().click()
    await start.fill('')
    await start.focus()
    await expect(page.getByText('Recent', { exact: true })).toBeVisible()
    await expect(page.getByRole('option').first()).toContainText('LRT Pasar Seni')
  })
})
