import { afterEach, describe, expect, it } from 'vitest'
import { readParking, readPayment, readResident, readSort, saveParking, savePayment, saveResident, saveSort } from './tripPrefs'

describe('trip settings (kept on this device)', () => {
  afterEach(() => localStorage.clear())

  it('start with least walking, Malaysian fares, cashless, parking shown', () => {
    expect(readSort()).toBe('walking')
    expect(readResident()).toBe('citizen')
    expect(readPayment()).toBe('cashless')
    expect(readParking()).toBe(true)
  })
  it('remember what the user picks, with the keys the trip planner already used', () => {
    saveSort('fastest'); saveResident('non_citizen'); savePayment('cash'); saveParking(false)
    expect([readSort(), readResident(), readPayment(), readParking()]).toEqual(['fastest', 'non_citizen', 'cash', false])
    expect(localStorage.getItem('ronda.resident')).toBe('non_citizen')
    expect(localStorage.getItem('ronda.payment')).toBe('cash')
  })
  it('ignore anything unknown in storage', () => {
    localStorage.setItem('ronda.sort', 'priceHigh')
    expect(readSort()).toBe('walking')
  })
})
