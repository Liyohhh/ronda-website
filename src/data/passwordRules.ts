import type { TranslationKey } from '../i18n/translations'

// What a new password must have (sign-up, reset, account page). Keep in step with Supabase Auth -> Providers ->
// Email -> password requirements, which checks the same on the server.
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 72 // Supabase stores passwords with bcrypt, which only reads the first 72 bytes

export type PasswordRule = { key: TranslationKey; ok: boolean }

export function passwordRules(pw: string, email = ''): PasswordRule[] {
  const name = email.split('@')[0].trim().toLowerCase()
  return [
    { key: 'pwRuleLength', ok: pw.length >= PASSWORD_MIN && new TextEncoder().encode(pw).length <= PASSWORD_MAX },
    { key: 'pwRuleCase', ok: /\p{Ll}/u.test(pw) && /\p{Lu}/u.test(pw) },
    { key: 'pwRuleNumber', ok: /\d/.test(pw) },
    { key: 'pwRuleSymbol', ok: /[^\p{L}\d\s]/u.test(pw) },
    // the part of the email before @ is the first thing anyone would try
    { key: 'pwRuleNotEmail', ok: pw.length > 0 && (name.length < 3 || !pw.toLowerCase().includes(name)) },
  ]
}

export const passwordOk = (pw: string, email = '') => passwordRules(pw, email).every((r) => r.ok)
