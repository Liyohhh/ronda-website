import { describe, expect, it } from 'vitest'
import { passwordOk, passwordRules } from './passwordRules'

const failing = (pw: string, email = '') => passwordRules(pw, email).filter((r) => !r.ok).map((r) => r.key)

describe('password rules', () => {
  it('accepts a long mixed password', () => {
    expect(passwordOk('Kereta-Api-77!')).toBe(true)
    expect(passwordOk('Ketua-Kampung-9', 'aina@example.test')).toBe(true)
  })

  it('names each missing part', () => {
    expect(failing('')).toEqual(['pwRuleLength', 'pwRuleCase', 'pwRuleNumber', 'pwRuleSymbol', 'pwRuleNotEmail'])
    expect(failing('Short1!')).toEqual(['pwRuleLength'])
    expect(failing('alllowercase1!')).toEqual(['pwRuleCase'])
    expect(failing('NoNumbersHere!')).toEqual(['pwRuleNumber'])
    expect(failing('NoSymbols123')).toEqual(['pwRuleSymbol'])
  })

  it('refuses the email name inside the password', () => {
    expect(failing('Aina-2026!x', 'aina@example.test')).toEqual(['pwRuleNotEmail'])
    expect(failing('Ab-2026!xyz', 'ab@example.test')).toEqual([]) // too short a name to matter
  })

  it('counts bytes for the 72 limit (bcrypt), so long non-Latin passwords are caught', () => {
    expect(failing(`Aa1!${'x'.repeat(68)}`)).toEqual([])
    expect(failing(`Aa1!${'x'.repeat(69)}`)).toEqual(['pwRuleLength'])
    expect(failing(`Aa1!${'密'.repeat(23)}`)).toEqual(['pwRuleLength']) // 23 x 3 bytes + 4 = 73
  })
})
