import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './mocks'

// RONDA assistant (floating chat). The e2e build has VITE_AI_CHAT=on and no CAPTCHA key; ai-chat is mocked.
async function signIn(page: Page) {
  const session = {
    access_token: 'e2e-access-token', refresh_token: 'e2e-refresh-token', token_type: 'bearer',
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'tester@example.test', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' },
  }
  await page.addInitScript((s) => localStorage.setItem('sb-e2e-auth-token', JSON.stringify(s)), session)
}
const launcher = (page: Page) => page.locator('[data-chat-launcher]')

test('signed in: a starter question gets an answer and a card that opens the planner', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/')
  await launcher(page).click()
  const dialog = page.getByRole('dialog', { name: /RONDA assistant/ })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('textbox', { name: 'Type your question' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Hotels near LRT KLCC' }).click()
  await expect(dialog.getByText('There is one hotel within 500 m of LRT KLCC.')).toBeVisible()
  await expect(dialog.getByText('LRT KLCC · 240 m · 3 min walk')).toBeVisible()
  const sent = backend.calls.find((c) => c.path === '/functions/v1/ai-chat')?.body as { messages: { content: string }[]; lang: string }
  expect(sent.lang).toBe('en')
  expect(sent.messages.at(-1)?.content).toBe('Hotels near LRT KLCC')
  await dialog.getByRole('link', { name: 'Plan a trip here' }).click()
  await expect(page.getByRole('combobox', { name: 'End', exact: true })).toHaveValue('Test Hotel')
})

test('the conversation survives a page change in the same tab; New chat clears it', async ({ page, backend }) => {
  void backend
  await signIn(page)
  await page.goto('/about')
  await launcher(page).click()
  await page.getByRole('button', { name: 'Hotels near LRT KLCC' }).click()
  await expect(page.getByText('There is one hotel within 500 m of LRT KLCC.')).toBeVisible()
  await page.goto('/help')
  await launcher(page).click()
  await expect(page.getByText('There is one hotel within 500 m of LRT KLCC.')).toBeVisible()
  await page.getByRole('button', { name: 'New chat' }).click()
  await expect(page.getByText('There is one hotel within 500 m of LRT KLCC.')).toHaveCount(0)
})

test('guest without the CAPTCHA set up: told to log in, nothing sent', async ({ page, backend }) => {
  await page.goto('/')
  await launcher(page).click()
  await page.getByRole('textbox', { name: 'Type your question' }).fill('hello')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByRole('alert')).toContainText('guest chat isn’t available')
  expect(backend.calls.some((c) => c.path === '/functions/v1/ai-chat')).toBe(false)
})

test('rate limited: the reason is shown', async ({ page, backend }) => {
  backend.chat = () => ({ status: 429, json: { error: 'rate_limited', reason: 'day', guest: false } })
  await signIn(page)
  await page.goto('/')
  await launcher(page).click()
  await page.getByRole('textbox', { name: 'Type your question' }).fill('hello')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('alert')).toContainText('limit of questions for today')
})

test('Escape closes and focus returns to the launcher', async ({ page, backend }) => {
  void backend
  await page.goto('/')
  await launcher(page).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(launcher(page)).toBeFocused()
})

test('Arabic: labels translated, launcher on the left (bottom end in RTL)', async ({ page, backend }) => {
  void backend
  await page.addInitScript(() => localStorage.setItem('ronda-lang', 'ar'))
  await page.goto('/')
  const box = (await launcher(page).boundingBox())!
  const width = page.viewportSize()!.width
  expect(box.x + box.width / 2).toBeLessThan(width / 2)
  await launcher(page).click()
  await expect(page.getByRole('dialog', { name: /مساعد RONDA/ })).toBeVisible()
})

test('the launcher hides while a side panel is open, so it never covers it', async ({ page, backend }) => {
  void backend
  await page.goto('/?tab=lines')
  await expect(launcher(page)).toBeVisible()
  await page.getByRole('combobox', { name: 'Line', exact: true }).click()
  await page.getByTestId('line-grid').getByRole('button', { name: 'LRT Kelana Jaya Line' }).click()
  await expect(launcher(page)).toBeHidden()
})

test('phones: the chat opens as a full-screen sheet', async ({ page, backend }, info) => {
  test.skip(info.project.name !== 'mobile', 'phone layout only')
  void backend
  await page.goto('/')
  await launcher(page).click()
  const box = (await page.getByRole('dialog').boundingBox())!
  const vp = page.viewportSize()!
  expect(Math.round(box.width)).toBe(vp.width)
  expect(Math.round(box.height)).toBe(vp.height)
})

test('open chat has no serious accessibility violations', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/')
  await launcher(page).click()
  await page.getByRole('button', { name: 'Hotels near LRT KLCC' }).click()
  await expect(page.getByText('There is one hotel within 500 m of LRT KLCC.')).toBeVisible()
  void backend
  const r = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
})
