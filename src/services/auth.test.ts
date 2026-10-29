import { beforeEach, describe, expect, it, vi } from 'vitest'
import { translations } from '../i18n/translations'

// a stand-in for supabase.auth: records what each call sent, answers with `result`
let result: { data: unknown; error: unknown } = { data: {}, error: null }
const calls: { op: string; args: unknown[] }[] = []
const op = (name: string) => (...args: unknown[]) => { calls.push({ op: name, args }); return Promise.resolve(result) }
vi.mock('./supabase', () => ({
  supabase: { auth: { signUp: op('signUp'), signInWithPassword: op('signIn'), resend: op('resend'), resetPasswordForEmail: op('reset'), signOut: op('signOut') } },
}))

const { authErrorKey, linkError, readName, resendConfirmation, sendResetLink, signIn, signOut, signUp } = await import('./auth')

describe('auth', () => {
  beforeEach(() => { calls.length = 0; result = { data: {}, error: null } })

  it('signs up with the name and a confirmation link back to the site', async () => {
    expect(await signUp({ first: ' Aina ', last: ' Rahman ' }, ' aina@example.test ', 'a-long-password', 'ms')).toBeNull()
    expect(calls[0]).toEqual({ op: 'signUp', args: [{
      email: 'aina@example.test', password: 'a-long-password',
      options: { data: { first_name: 'Aina', last_name: 'Rahman', full_name: 'Aina Rahman', lang: 'ms', terms_accepted_at: expect.any(String) }, emailRedirectTo: `${window.location.origin}/login?confirmed=1&next=%2Faccount`, captchaToken: undefined },
    }] })
  })

  it('passes the bot-check token on', async () => {
    await signUp({ first: 'A', last: 'B' }, 'a@example.test', 'pw', 'en', 'tok1')
    await signIn('a@example.test', 'pw', 'tok2')
    await resendConfirmation('a@example.test', 'tok3')
    await sendResetLink('a@example.test', 'tok4')
    expect(calls[0].args[0]).toMatchObject({ options: { captchaToken: 'tok1' } })
    expect(calls[1].args[0]).toMatchObject({ options: { captchaToken: 'tok2' } })
    expect(calls[2].args[0]).toMatchObject({ options: { captchaToken: 'tok3' } })
    expect(calls[3].args[1]).toMatchObject({ captchaToken: 'tok4' })
  })

  it('signs in, resends the confirmation, sends reset links, signs out of this browser only', async () => {
    await signIn('a@example.test ', 'pw')
    await resendConfirmation('a@example.test')
    await sendResetLink('a@example.test')
    await signOut()
    expect(calls.map((c) => c.op)).toEqual(['signIn', 'resend', 'reset', 'signOut'])
    expect(calls[0].args[0]).toEqual({ email: 'a@example.test', password: 'pw', options: { captchaToken: undefined } })
    expect(calls[1].args[0]).toMatchObject({ type: 'signup', email: 'a@example.test' })
    expect(calls[2].args[1]).toEqual({ redirectTo: `${window.location.origin}/reset-password`, captchaToken: undefined })
    expect(calls[3].args[0]).toEqual({ scope: 'local' })
  })

  it('passes an error back', async () => {
    result = { data: {}, error: { code: 'invalid_credentials', status: 400, message: 'Invalid login credentials' } }
    expect(await signIn('a@example.test', 'x')).toMatchObject({ code: 'invalid_credentials' })
  })

  it('turns Supabase errors into messages in every language', () => {
    const cases: [Parameters<typeof authErrorKey>[0], string | null][] = [
      [null, null],
      [{ code: 'invalid_credentials', status: 400, message: '' }, 'authErrBadLogin'],
      [{ code: 'email_not_confirmed', status: 400, message: '' }, 'authErrNotConfirmed'],
      [{ code: 'weak_password', status: 422, message: '' }, 'authErrWeakPassword'],
      [{ code: 'same_password', status: 422, message: '' }, 'authErrSamePassword'],
      [{ code: 'user_already_exists', status: 422, message: '' }, 'authErrExists'],
      [{ code: 'email_address_invalid', status: 400, message: '' }, 'authErrBadEmail'],
      [{ code: 'signup_disabled', status: 422, message: '' }, 'authErrSignupOff'],
      [{ code: 'captcha_failed', status: 400, message: '' }, 'authErrCaptcha'],
      [{ code: 'over_email_send_rate_limit', status: 429, message: '' }, 'authErrTooMany'],
      [{ code: undefined, status: 429, message: 'slow down' }, 'authErrTooMany'],
      [{ code: undefined, status: 400, message: 'Invalid login credentials' }, 'authErrBadLogin'],
      [{ code: undefined, status: 0, message: 'Failed to fetch' }, 'authErrNetwork'],
      [{ code: 'unexpected_failure', status: 500, message: 'boom' }, 'authErrGeneric'],
    ]
    for (const [err, key] of cases) expect(authErrorKey(err)).toBe(key)
    for (const lang of ['en', 'ms', 'zh', 'ar'] as const)
      for (const [, key] of cases) if (key) expect(translations[lang][key as keyof typeof translations.en], `${lang} ${key}`).toBeTruthy()
  })

  it('reads a failed email link from the address', () => {
    expect(linkError('')).toBeNull()
    expect(linkError('#access_token=x&type=signup')).toBeNull()
    expect(linkError('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid')).toBe('expired')
    expect(linkError('#error=server_error&error_description=x')).toBe('failed')
    expect(linkError('', '?error=access_denied&error_code=otp_expired')).toBe('expired')
  })

  it('reads first and last name; an older account with only a full name shows it all as the first name', () => {
    expect(readName({ first_name: 'Aina', last_name: 'Rahman', full_name: 'Aina Rahman' })).toEqual({ first: 'Aina', last: 'Rahman' })
    expect(readName({ full_name: ' Siti Aisyah binti Ahmad ' })).toEqual({ first: 'Siti Aisyah binti Ahmad', last: '' })
    expect(readName(undefined)).toEqual({ first: '', last: '' })
  })
})
