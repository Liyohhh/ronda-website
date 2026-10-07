import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './mocks'

// Account: forgot / reset password, the account page (name, password, sign out everywhere, delete account).
// Made-up user in the place supabase-js keeps its session (see access.spec.ts); never sent anywhere.
async function signIn(page: Page) {
  const session = {
    access_token: 'e2e-access-token', refresh_token: 'e2e-refresh-token', token_type: 'bearer',
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'tester@example.test',
            app_metadata: { provider: 'email' }, user_metadata: { full_name: 'Test Rider' }, identities: [{ provider: 'email' }],
            created_at: '2026-10-01T00:00:00Z' },
  }
  // once per test (not on every page load), so signing out sticks across a reload
  await page.addInitScript((s) => {
    if (sessionStorage.getItem('e2e-signed-in')) return
    sessionStorage.setItem('e2e-signed-in', '1')
    localStorage.setItem('sb-e2e-auth-token', JSON.stringify(s))
  }, session)
}

async function noSeriousA11y(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
}

test('forgot password: link from sign-in, same answer whether or not the email has an account', async ({ page, backend }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await expect(page).toHaveURL(/\/forgot-password$/)
  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
  await page.getByLabel('Email address').fill('someone@example.test')
  await page.getByRole('button', { name: 'Send link' }).click()
  await expect(page.getByRole('status')).toContainText('If an account uses this email')
  const call = backend.calls.find((c) => c.path === '/auth/v1/recover')
  expect(call, 'reset email requested').toBeTruthy()
  await noSeriousA11y(page)
})

test('reset password: an old or used link offers a new one', async ({ page, backend }) => {
  void backend
  await page.goto('/reset-password')
  await expect(page.getByRole('alert')).toContainText('expired')
  await page.getByRole('link', { name: 'Request a new link' }).click()
  await expect(page).toHaveURL(/\/forgot-password$/)
})

test('reset password: checks length and match, then saves', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/reset-password')
  await page.getByLabel('New password').fill('short1')
  await page.getByLabel('Confirm password').fill('short1')
  await page.getByRole('button', { name: 'Save password' }).click()
  // the browser's own minLength check stops the form first; nothing is sent
  expect(backend.calls.some((c) => c.path === '/auth/v1/user')).toBe(false)
  await page.getByLabel('New password').fill('a-long-password-1')
  await page.getByLabel('Confirm password').fill('a-long-password-2')
  await page.getByRole('button', { name: 'Save password' }).click()
  await expect(page.getByRole('alert')).toHaveText('Passwords do not match.')
  await page.getByLabel('Confirm password').fill('a-long-password-1')
  await page.getByRole('button', { name: 'Save password' }).click()
  await expect(page.getByRole('status')).toContainText('Password changed')
  expect(backend.calls.find((c) => c.path === '/auth/v1/user')?.body).toMatchObject({ password: 'a-long-password-1' })
})

test('account page needs sign-in', async ({ page, backend }) => {
  void backend
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/)
})

test('account page: from the menu, shows the email, saves the name', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/dashboard')
  await page.getByRole('link', { name: /^Account/ }).first().click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('heading', { name: 'Your account', level: 1 })).toBeVisible()
  await expect(page.getByText('tester@example.test')).toBeVisible()
  const name = page.getByLabel('Full name')
  await expect(name).toHaveValue('Test Rider')
  await name.fill('New Name')
  await page.getByRole('button', { name: 'Save name' }).click()
  await expect(page.getByRole('status')).toHaveText('Saved.')
  expect(backend.calls.find((c) => c.path === '/auth/v1/user')?.body).toMatchObject({ data: { full_name: 'New Name' } })
  await noSeriousA11y(page)
})

test('delete account: only after typing DELETE; then signed out and home', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/account')
  const del = page.getByRole('button', { name: 'Delete my account' })
  await expect(del).toBeDisabled()
  await page.getByLabel('Type DELETE to confirm').fill('delete')
  await expect(del).toBeDisabled()
  await page.getByLabel('Type DELETE to confirm').fill('DELETE')
  await del.click()
  await expect(page).toHaveURL(/\/$/)
  expect(backend.calls.find((c) => c.path === '/functions/v1/delete-account')?.body).toEqual({ confirm: 'DELETE' })
  await expect(page.getByRole('banner').getByRole('link', { name: 'Login' })).toBeVisible()
})

test('delete account: a failure says so and keeps the person signed in', async ({ page, backend }) => {
  backend.deleteAccount = () => ({ status: 500, json: { error: 'could not delete, try later' } })
  await signIn(page)
  await page.goto('/account')
  await page.getByLabel('Type DELETE to confirm').fill('DELETE')
  await page.getByRole('button', { name: 'Delete my account' }).click()
  await expect(page.getByRole('alert')).toContainText("We couldn't delete your account just now")
  await expect(page).toHaveURL(/\/account$/)
})
