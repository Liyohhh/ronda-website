import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './mocks'

// Page guards: signed out -> login (and back after signing in); signed in without the role -> no access.
// A session is put where supabase-js keeps it (localStorage "sb-<project ref>-auth-token"; the fake backend
// host e2e.supabase.test gives the ref "e2e"). Made-up user, never sent anywhere.
async function signIn(page: Page, role?: string) {
  const session = {
    access_token: 'e2e-access-token', refresh_token: 'e2e-refresh-token', token_type: 'bearer',
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'tester@example.test',
            app_metadata: role ? { role } : {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' },
  }
  await page.addInitScript((s) => localStorage.setItem('sb-e2e-auth-token', JSON.stringify(s)), session)
}

for (const path of ['/admin', '/partner-dashboard', '/dashboard']) {
  test(`${path} sends a signed-out visitor to login and remembers the page`, async ({ page, backend }) => {
    void backend
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}$`))
  })
}

test('signed in without a role: admin and partner pages say no access', async ({ page, backend }) => {
  void backend
  await signIn(page)
  for (const path of ['/admin', '/partner-dashboard']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'You do not have access to this page' })).toBeVisible()
  }
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'My RONDA', level: 1 })).toBeVisible()
})

test('merchant sees the partner page but not admin; admin sees both', async ({ page, backend }) => {
  void backend
  await signIn(page, 'merchant')
  await page.goto('/partner-dashboard')
  await expect(page.getByRole('heading', { name: 'Partner dashboard', level: 1 })).toBeVisible()
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'You do not have access to this page' })).toBeVisible()
})

test('admin sees admin and partner pages', async ({ page, backend }) => {
  void backend
  await signIn(page, 'admin')
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Admin', level: 1 })).toBeVisible()
  await page.goto('/partner-dashboard')
  await expect(page.getByRole('heading', { name: 'Partner dashboard', level: 1 })).toBeVisible()
})

test('a role in user_metadata (editable by the user) does not count', async ({ page, backend }) => {
  void backend
  await page.addInitScript(() => localStorage.setItem('sb-e2e-auth-token', JSON.stringify({
    access_token: 'x', refresh_token: 'y', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: '00000000-0000-4000-8000-000000000002', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: { role: 'admin' }, created_at: '2026-10-01T00:00:00Z' },
  })))
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'You do not have access to this page' })).toBeVisible()
})

test('signed-in dashboard: working links, no serious accessibility violations', async ({ page, backend }) => {
  void backend
  await signIn(page)
  await page.goto('/dashboard')
  await expect(page.getByRole('link', { name: /Plan a trip/ })).toHaveAttribute('href', '/#plan')
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
})
