import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithLang, tr } from '../test/render'

// signed out; the sign-up call is a stub (no Supabase here); no CAPTCHA site key
const signUp = vi.fn()
const resendConfirmation = vi.fn()
vi.mock('../hooks/useSession', () => ({ useAuth: () => ({ session: null, loading: false }) }))
vi.mock('../components/SocialLogin', () => ({ default: () => null }))
vi.mock('../services/auth', async (orig) => ({ ...(await orig<typeof import('../services/auth')>()), signUp: (...a: unknown[]) => signUp(...a), resendConfirmation: (...a: unknown[]) => resendConfirmation(...a) }))
vi.mock('../services/supabase', () => ({ supabase: {} }))

const { default: Register } = await import('./Register')
const STRONG = 'Kereta-Api-77!'

async function fill(pw: string, pw2: string, agree = true) {
  const u = userEvent.setup()
  await u.type(screen.getByLabelText('Full name'), 'Aina')
  await u.type(screen.getByLabelText('Email address'), 'aina@example.test')
  await u.selectOptions(screen.getByLabelText('Where are you from?'), 'MY')
  await u.type(screen.getByLabelText('Password'), pw)
  await u.type(screen.getByLabelText('Confirm password'), pw2)
  if (agree) await u.click(screen.getByRole('checkbox'))
  return u
}

describe('Register', () => {
  beforeEach(() => { signUp.mockReset().mockResolvedValue(null); resendConfirmation.mockReset().mockResolvedValue(null) })

  it('ticks off the password rules as they are met', async () => {
    renderWithLang(<Register />)
    const u = userEvent.setup()
    const rules = () => screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(rules().every((r) => r?.includes('(still needed)'))).toBe(true)
    await u.type(screen.getByLabelText('Password'), 'abcdefgh')
    expect(rules()[0]).toContain('(done)')
    expect(rules()[1]).toContain('(still needed)')
    await u.clear(screen.getByLabelText('Password'))
    await u.type(screen.getByLabelText('Password'), STRONG)
    expect(rules().every((r) => r?.includes('(done)'))).toBe(true)
  })

  it('shows and hides the password', async () => {
    renderWithLang(<Register />)
    const u = userEvent.setup()
    const pw = screen.getByLabelText('Password')
    expect(pw).toHaveAttribute('type', 'password')
    await u.click(screen.getAllByRole('button', { name: 'Show password' })[0])
    expect(pw).toHaveAttribute('type', 'text')
    await u.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(pw).toHaveAttribute('type', 'password')
  })

  it('stops a weak password and different passwords', async () => {
    renderWithLang(<Register />)
    const u = await fill('abcdefgh', 'abcdefgh')
    await u.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toHaveTextContent("Your password doesn't meet all the rules below yet.")
    await u.clear(screen.getByLabelText('Password'))
    await u.type(screen.getByLabelText('Password'), STRONG)
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(signUp).not.toHaveBeenCalled()
  })

  it('asks the person to check their inbox, and can send the email again', async () => {
    renderWithLang(<Register />)
    const u = await fill(STRONG, STRONG)
    await u.click(screen.getByRole('button', { name: 'Create account' }))
    expect(signUp).toHaveBeenCalledWith('Aina', 'aina@example.test', STRONG, 'en', undefined, 'MY')
    expect(screen.getByRole('heading', { name: 'Check your inbox' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('aina@example.test')
    await u.click(screen.getByRole('button', { name: 'Send confirmation email again' }))
    expect(resendConfirmation).toHaveBeenCalledWith('aina@example.test', undefined)
    expect(await screen.findByText('A new confirmation email is on its way.')).toBeInTheDocument()
  })

  it('shows Supabase errors in the reader language', async () => {
    signUp.mockResolvedValue({ code: 'weak_password', status: 422, message: 'Password should contain...' })
    renderWithLang(<Register />, { lang: 'ms' })
    const u = userEvent.setup()
    await u.type(screen.getByLabelText(tr('ms', 'fullName')), 'Aina')
    await u.type(screen.getByLabelText(tr('ms', 'emailAddress')), 'aina@example.test')
    await u.selectOptions(screen.getByLabelText(tr('ms', 'regCountry')), 'MY')
    await u.type(screen.getByLabelText(tr('ms', 'password')), STRONG)
    await u.type(screen.getByLabelText(tr('ms', 'confirmPassword')), STRONG)
    await u.click(screen.getByRole('checkbox'))
    await u.click(screen.getByRole('button', { name: tr('ms', 'authCreateAccount') }))
    expect(await screen.findByRole('alert')).toHaveTextContent(tr('ms', 'authErrWeakPassword'))
  })
})
