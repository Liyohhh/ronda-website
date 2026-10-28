import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test, testSession } from './mocks'

const STRONG = 'Kereta-Api-77!' // made-up test password that meets every rule

// Sign up (with email confirmation), sign in, sign out, the confirmation link coming back, in all languages.
// The made-up account lives only in the mocked backend (e2e/mocks.ts).

async function noSeriousA11y(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
}

test('sign up from the header: check-your-inbox screen, then send the email again', async ({ page, backend }) => {
  await page.goto('/')
  await page.getByRole('banner').getByRole('link', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL(/\/register$/)
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  await page.getByLabel('Full name').fill('Aina Test')
  await page.getByLabel('Email address').fill('aina@example.test')
  await page.getByLabel('Password', { exact: true }).fill('abcdefgh')
  await expect(page.getByRole('listitem').filter({ hasText: 'Upper and lower case letters' })).toContainText('(still needed)')
  await page.getByLabel('Password', { exact: true }).fill(STRONG)
  await expect(page.getByRole('listitem').filter({ hasText: '(still needed)' })).toHaveCount(0)
  await page.getByLabel('Confirm password').fill(STRONG)
  // the terms box must be ticked: the browser stops the form, nothing is sent
  await page.getByRole('button', { name: 'Create account' }).click()
  expect(backend.calls.some((c) => c.path === '/auth/v1/signup')).toBe(false)
  await page.getByRole('checkbox', { name: /terms and privacy policy/ }).check()
  await noSeriousA11y(page)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('aina@example.test')
  const signup = backend.calls.find((c) => c.path === '/auth/v1/signup')?.body as Record<string, unknown>
  expect(signup).toMatchObject({ email: 'aina@example.test', password: STRONG, data: { full_name: 'Aina Test', lang: 'en' } })
  expect((signup.data as Record<string, string>).terms_accepted_at).toMatch(/^\d{4}-\d\d-\d\dT/)
  await page.getByRole('button', { name: 'Send confirmation email again' }).click()
  await expect(page.getByText('A new confirmation email is on its way.')).toBeVisible()
  expect(backend.calls.find((c) => c.path === '/auth/v1/resend')?.body).toMatchObject({ type: 'signup', email: 'aina@example.test' })
  // still signed out until the link is opened
  await expect(page.getByRole('banner').getByRole('link', { name: 'Login' })).toHaveCount(0) // auth pages have their own slim bar
  await page.goto('/')
  await expect(page.getByRole('banner').getByRole('link', { name: 'Login' })).toBeVisible()
})

test('sign up: Supabase errors come back in plain words', async ({ page, backend }) => {
  backend.signUp = () => ({ status: 422, json: { code: 422, error_code: 'weak_password', msg: 'Password should contain at least one character of each' } })
  await page.goto('/register')
  await page.getByLabel('Full name').fill('Aina Test')
  await page.getByLabel('Email address').fill('aina@example.test')
  // passes the rules here, but Supabase still says no (for example a password found in a data leak)
  await page.getByLabel('Password', { exact: true }).fill(STRONG)
  await page.getByLabel('Confirm password').fill(STRONG)
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('alert')).toHaveText('Choose a stronger password: at least 8 characters, mixing letters and numbers.')
})

test('sign in, see the name in the header, sign out', async ({ page, backend }) => {
  await page.goto('/')
  await page.getByRole('banner').getByRole('link', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Email address').fill('tester@example.test')
  await page.getByLabel('Password', { exact: true }).fill('a-long-password-1')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  const menu = page.getByRole('banner').getByRole('button', { name: 'Test Rider' })
  await expect(menu).toBeVisible()
  expect(backend.calls.find((c) => c.path === '/auth/v1/token')?.body).toMatchObject({ email: 'tester@example.test', password: 'a-long-password-1' })
  await menu.click()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('banner').getByRole('link', { name: 'Login' })).toBeVisible()
  expect(backend.calls.some((c) => c.path === '/auth/v1/logout')).toBe(true)
  // signed out for real: the account page asks for a sign-in again
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/)
})

test('sign in goes back to the page that asked for it', async ({ page, backend }) => {
  void backend
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/)
  await page.getByLabel('Email address').fill('tester@example.test')
  await page.getByLabel('Password', { exact: true }).fill('a-long-password-1')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('heading', { name: 'Your account', level: 1 })).toBeVisible()
})

test('sign in: wrong password, and an unconfirmed email can get a new link', async ({ page, backend }) => {
  backend.signIn = () => ({ status: 400, json: { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' } })
  await page.goto('/login')
  await page.getByLabel('Email address').fill('tester@example.test')
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Wrong email or password.')
  await expect(page.getByRole('button', { name: 'Send confirmation email again' })).toHaveCount(0)

  backend.signIn = () => ({ status: 400, json: { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' } })
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Please confirm your email first')
  await page.getByRole('button', { name: 'Send confirmation email again' }).click()
  await expect(page.getByRole('status')).toHaveText('A new confirmation email is on its way.')
  expect(backend.calls.find((c) => c.path === '/auth/v1/resend')?.body).toMatchObject({ type: 'signup', email: 'tester@example.test' })
})

test('confirmation link: signs the person in and opens the dashboard', async ({ page, backend }) => {
  void backend
  const s = testSession()
  // how Supabase sends the person back after the link in the email (implicit flow: tokens in the #hash)
  const hash = new URLSearchParams({ access_token: s.access_token, refresh_token: s.refresh_token, expires_in: '3600', expires_at: String(s.expires_at), token_type: 'bearer', type: 'signup' })
  await page.goto(`/login?confirmed=1&next=%2Fdashboard#${hash}`)
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('banner').getByRole('button', { name: 'Test Rider' })).toBeVisible()
})

test('confirmation link that expired: says so and offers a new one', async ({ page, backend }) => {
  await page.goto('/login?confirmed=1&next=%2Fdashboard#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')
  await expect(page.getByRole('alert')).toContainText('This email link has expired or was already used')
  const again = page.getByRole('button', { name: 'Send confirmation email again' })
  await expect(again).toBeDisabled() // needs the email first
  await page.getByLabel('Email address').fill('aina@example.test')
  await again.click()
  await expect(page.getByRole('status')).toHaveText('A new confirmation email is on its way.')
  expect(backend.calls.some((c) => c.path === '/auth/v1/resend')).toBe(true)
})

test('sign-in page in Malay, Chinese and Arabic (right to left)', async ({ page, backend }) => {
  void backend
  for (const [lang, title, dir] of [['ms', 'Log masuk ke RONDA', 'ltr'], ['zh', '登录 RONDA', 'ltr'], ['ar', 'تسجيل الدخول إلى RONDA', 'rtl']] as const) {
    await page.addInitScript((l) => localStorage.setItem('ronda-lang', l), lang)
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('dir', dir)
  }
  backend.signIn = () => ({ status: 400, json: { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' } })
  await page.getByLabel('البريد الإلكتروني').fill('tester@example.test')
  await page.getByLabel('كلمة المرور', { exact: true }).fill('wrong-password')
  await page.locator('form button[type=submit]').click()
  await expect(page.getByRole('alert')).toHaveText('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
  await noSeriousA11y(page)
})
