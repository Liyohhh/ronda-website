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
  await page.getByLabel('New password').fill('Kereta-Api-77!')
  await page.getByLabel('Confirm password').fill('Kereta-Api-78!')
  await page.getByRole('button', { name: 'Save password' }).click()
  await expect(page.getByRole('alert')).toHaveText('Passwords do not match.')
  await page.getByLabel('Confirm password').fill('Kereta-Api-77!')
  await page.getByRole('button', { name: 'Save password' }).click()
  await expect(page.getByRole('status')).toContainText('Password changed')
  expect(backend.calls.find((c) => c.path === '/auth/v1/user')?.body).toMatchObject({ password: 'Kereta-Api-77!' })
})

test('account page needs sign-in', async ({ page, backend }) => {
  void backend
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/)
})

test('account page: from the header menu, shows the email, saves the name and country', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/')
  await page.getByRole('banner').getByRole('button', { name: /Test Rider/ }).click()
  // the header menu: who is signed in, the account's parts with icons, help, sign out
  const menu = page.getByRole('navigation', { name: 'Account' })
  await expect(menu.getByRole('link', { name: 'Trip settings' })).toHaveAttribute('href', '/account#trips')
  await expect(menu.getByRole('button', { name: 'Sign out' })).toBeVisible()
  await menu.getByRole('link', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('heading', { name: 'Your account', level: 1 })).toBeAttached()
  await expect(page.getByText('tester@example.test').first()).toBeVisible() // in the side card and the security card
  await page.getByRole('region', { name: 'Profile' }).getByRole('button', { name: 'Edit' }).first().click()
  await page.getByLabel('Where are you from?').selectOption('MY')
  const name = page.getByLabel('Full name')
  await expect(name).toHaveValue('Test Rider')
  await name.fill('New Name')
  await page.getByRole('button', { name: 'Save name' }).click()
  await expect(page.getByRole('status')).toHaveText('Saved.')
  expect(backend.calls.find((c) => c.path === '/auth/v1/user')?.body).toMatchObject({ data: { full_name: 'New Name', country: 'MY' } })
  await noSeriousA11y(page)
})

test('account menu: every part has an icon and a link to its card; language from Preferences', async ({ page, backend }) => {
  void backend
  await signIn(page)
  await page.goto('/account')
  const menu = page.getByRole('navigation', { name: 'Account settings' })
  await expect(menu.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'location')
  await menu.getByRole('link', { name: 'Sign-in and security' }).click()
  await expect(page).toHaveURL(/\/account#security$/)
  await expect(page.getByRole('heading', { name: 'Sign-in and security', level: 2 })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Sign-in and security' })).toHaveAttribute('aria-current', 'location')
  await page.getByRole('combobox', { name: 'Language' }).selectOption('ms')
  await expect(page.getByRole('heading', { name: 'Keutamaan', level: 2 })).toBeVisible()
  await noSeriousA11y(page)
})

test('profile picture: a photo is cut to a square, uploaded to the user’s own folder and linked; it can be removed', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/account')
  // a 40 x 20 PNG made in the page (wide: the centre square is kept)
  const png = await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 40; c.height = 20
    const x = c.getContext('2d')!; x.fillStyle = '#D2B68A'; x.fillRect(0, 0, 40, 20)
    const b: Blob = await new Promise((ok) => c.toBlob((v) => ok(v!), 'image/png'))
    return Array.from(new Uint8Array(await b.arrayBuffer()))
  })
  await page.locator('input[type=file]').setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: Buffer.from(png) })
  await expect(page.getByRole('status')).toHaveText('Picture saved.')
  const up = backend.calls.find((c) => c.path.startsWith('/storage/v1/object/avatars/'))
  expect(up?.path).toBe('/storage/v1/object/avatars/00000000-0000-4000-8000-000000000001/avatar.webp')
  const meta = backend.calls.filter((c) => c.path === '/auth/v1/user').at(-1)?.body as { data?: { avatar_url?: string } }
  expect(meta?.data?.avatar_url).toMatch(/\/storage\/v1\/object\/public\/avatars\/00000000-0000-4000-8000-000000000001\/avatar\.webp\?v=\d+$/)
  await expect(page.getByRole('img', { name: 'Profile picture' })).toBeVisible()
  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByRole('status')).toHaveText('Picture removed.')
  await expect(page.getByRole('button', { name: 'Add a picture' })).toBeVisible()
})

test('password rules show only once a new password is being typed', async ({ page, backend }) => {
  void backend
  await signIn(page)
  await page.goto('/account#security')
  await page.getByRole('region', { name: 'Sign-in and security' }).getByRole('button', { name: 'Change' }).click()
  await expect(page.getByText('8 to 72 characters')).toHaveCount(0)
  await page.getByLabel('New password').fill('a')
  await expect(page.getByText('8 to 72 characters')).toBeVisible()
})

test('trip settings: route order, fares, payment and parking are kept for the trip planner', async ({ page, backend }) => {
  void backend
  await signIn(page)
  await page.goto('/account#trips')
  await expect(page.getByRole('heading', { name: 'Trip settings', level: 2 })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Show routes first by' })).toHaveValue('walking')
  await page.getByRole('combobox', { name: 'Show routes first by' }).selectOption('fastest')
  await page.getByRole('combobox', { name: 'Fares for' }).selectOption('non_citizen')
  await page.getByRole('combobox', { name: 'Pay with' }).selectOption('cash')
  await page.getByRole('switch', { name: /Parking at the start station/ }).uncheck({ force: true }) // drawn by its label
  const kept = await page.evaluate(() => ['ronda.sort', 'ronda.resident', 'ronda.payment', 'ronda.parking'].map((k) => localStorage.getItem(k)))
  expect(kept).toEqual(['fastest', 'non_citizen', 'cash', 'off'])
  await noSeriousA11y(page)
})

test('delete account: only after typing DELETE; then signed out and home', async ({ page, backend }) => {
  await signIn(page)
  await page.goto('/account#delete')
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
  await page.goto('/account#delete')
  await page.getByLabel('Type DELETE to confirm').fill('DELETE')
  await page.getByRole('button', { name: 'Delete my account' }).click()
  await expect(page.getByRole('alert')).toContainText("We couldn't delete your account just now")
  await expect(page).toHaveURL(/\/account#delete$/)
})
