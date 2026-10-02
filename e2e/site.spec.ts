import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './mocks'

// Every public page loads without errors, the language switch works, and pages pass automated
// accessibility checks (WCAG 2.1 A / AA rules that axe can test).
const PAGES = ['/', '/about', '/help', '/services', '/trails', '/login', '/register', '/live']

for (const path of PAGES) {
  test(`${path} renders`, async ({ page, backend }) => {
    void backend
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1:visible, h2:visible, [role="application"]').first()).toBeVisible()
  })
}

test('language switch to Bahasa Melayu is remembered', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  await page.getByRole('button', { name: /^Language:/ }).first().click()
  await page.getByRole('option', { name: /Melayu/ }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ms')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ms')
})

test('Arabic switches the page to right-to-left', async ({ page, backend }) => {
  void backend
  await page.addInitScript(() => localStorage.setItem('ronda-lang', 'ar'))
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})

// Known violations (a11y-baseline.json) are reported on the test but do not fail it; anything new fails.
const BASELINE: Record<string, string[]> = JSON.parse(readFileSync(new URL('./a11y-baseline.json', import.meta.url), 'utf8'))

for (const path of PAGES) {
  test(`${path} has no new serious accessibility violations`, async ({ page, backend }, info) => {
    void backend
    await page.goto(path)
    await expect(page.locator('h1:visible, h2:visible, [role="application"]').first()).toBeVisible()
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const bad = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    const known = new Set(BASELINE[path] ?? [])
    for (const v of bad.filter((v) => known.has(v.id)))
      info.annotations.push({ type: 'known a11y issue', description: `${v.id}: ${v.nodes.length} element(s) - ${v.help}` })
    const fresh = bad.filter((v) => !known.has(v.id))
    expect(fresh.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')} - ${v.help}`)).toEqual([])
  })
}
