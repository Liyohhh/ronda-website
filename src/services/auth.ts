import type { AuthError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Lang, TranslationKey } from '../i18n/translations'

// Email + password accounts on Supabase Auth. Sign-up sends a confirmation email (Supabase's mailer for now);
// the link comes back to /login, which then goes on to the dashboard.

// Where links in Supabase's emails send people back to (each must be in Auth -> URL Configuration -> Redirect URLs)
export const confirmUrl = () => `${window.location.origin}/login?confirmed=1&next=${encodeURIComponent('/account')}`
export const resetUrl = () => `${window.location.origin}/reset-password`

// Cloudflare Turnstile token, when a CAPTCHA site key is set (VITE_CAPTCHA_SITE_KEY; Supabase Auth -> Attack
// Protection must then have CAPTCHA on, and asks for a token on every call below)
type Captcha = string | undefined

// lang: the site language at sign-up; Supabase's emails to this person use it (docs/email-templates)
export async function signUp(name: string, email: string, password: string, lang: Lang, captchaToken?: Captcha, country?: string) {
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    // when the person agreed to the terms and privacy notice (PDPA consent record)
    // country: ISO code from "Where are you from?", counted on the admin dashboard
    options: { data: { full_name: name.trim(), lang, ...(country ? { country } : {}), terms_accepted_at: new Date().toISOString() }, emailRedirectTo: confirmUrl(), captchaToken },
  })
  // an email that already has an account gets the same "check your inbox" answer (Supabase sends nothing new),
  // so the form can't be used to find out who is registered
  return error
}

export async function signIn(email: string, password: string, captchaToken?: Captcha) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password, options: { captchaToken } })
  return error
}

// another confirmation email, for an account that hasn't confirmed yet
export async function resendConfirmation(email: string, captchaToken?: Captcha) {
  const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: confirmUrl(), captchaToken } })
  return error
}

export async function sendResetLink(email: string, captchaToken?: Captcha) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: resetUrl(), captchaToken })
  return error
}

// this browser only; "sign out on all devices" is on the account page
export async function signOut() {
  await supabase.auth.signOut({ scope: 'local' })
}

// A Supabase Auth error as a message in the reader's language. Supabase's own text is English only.
export function authErrorKey(error: Pick<AuthError, 'code' | 'status' | 'message'> | null | undefined): TranslationKey | null {
  if (!error) return null
  switch (error.code) {
    case 'invalid_credentials':
      return 'authErrBadLogin'
    case 'email_not_confirmed':
      return 'authErrNotConfirmed'
    case 'weak_password':
      return 'authErrWeakPassword'
    case 'same_password':
      return 'authErrSamePassword'
    case 'user_already_exists':
    case 'email_exists':
      return 'authErrExists'
    case 'email_address_invalid':
    case 'validation_failed':
      return 'authErrBadEmail'
    case 'captcha_failed':
      return 'authErrCaptcha'
    case 'signup_disabled':
      return 'authErrSignupOff'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'authErrTooMany'
  }
  if (error.status === 429) return 'authErrTooMany'
  if (/invalid login credentials/i.test(error.message)) return 'authErrBadLogin'
  if (/email not confirmed/i.test(error.message)) return 'authErrNotConfirmed'
  if (/fetch|network/i.test(error.message) || !error.status) return 'authErrNetwork'
  return 'authErrGeneric'
}

// A link from an email that didn't work comes back as "#error=...&error_code=otp_expired" (or in the query)
export function linkError(hash: string, search = ''): 'expired' | 'failed' | null {
  const p = new URLSearchParams(hash.replace(/^#/, ''))
  const q = new URLSearchParams(search)
  const code = p.get('error_code') ?? q.get('error_code')
  if (!code && !p.get('error') && !q.get('error')) return null
  return code === 'otp_expired' ? 'expired' : 'failed'
}
