import { describe, expect, it, vi } from 'vitest'

vi.mock('./supabase', () => ({ supabase: {} }))
const { validateAdEnquiry } = await import('./adEnquiries')

const OK = { businessType: 'brand', name: 'Aina', company: 'Kopi', email: 'a@b.my', phone: '', interest: 'other', message: 'Hi', consent: true } as const

describe('validateAdEnquiry', () => {
  it('passes a complete enquiry (phone optional)', () => {
    expect(validateAdEnquiry({ ...OK })).toEqual({})
  })

  it('flags empty, bad and too long fields', () => {
    expect(validateAdEnquiry({ ...OK, businessType: '', name: '  ', email: 'a@b', phone: 'call me', interest: '', message: 'x'.repeat(2001), consent: false })).toEqual({
      name: 'required', businessType: 'required', email: 'invalid', phone: 'invalid', interest: 'required', message: 'tooLong', consent: 'required',
    })
  })

  it('accepts Malaysian phone formats', () => {
    for (const phone of ['+60 12-345 6789', '03-2141 1234', '(03) 21411234']) expect(validateAdEnquiry({ ...OK, phone }).phone).toBeUndefined()
  })
})
