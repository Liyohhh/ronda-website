import { supabase } from './supabase'

// "Advertise with us" enquiries (/advertise) go to the ad_enquiries table (migration 20261101160000_ad_enquiries.sql
// in the database repo). Anyone may insert; only admins can read them back, so the row is not selected after insert.

export const AD_INTERESTS = ['home_promo', 'ronda300', 'trails', 'other'] as const
export type AdInterest = (typeof AD_INTERESTS)[number]

// kind of business, asked in step 1 so the team knows who is writing
export const AD_BUSINESS_TYPES = ['shop', 'hotel', 'brand', 'event'] as const
export type AdBusinessType = (typeof AD_BUSINESS_TYPES)[number]

export type AdEnquiry = {
  businessType: AdBusinessType | ''
  name: string
  company: string
  email: string
  phone: string
  interest: AdInterest | ''
  message: string
  consent: boolean
}

export type AdField = 'businessType' | 'name' | 'company' | 'email' | 'phone' | 'interest' | 'message' | 'consent'
export type AdErrors = Partial<Record<AdField, 'required' | 'invalid' | 'tooLong'>>

// same limits as the table's checks
export const AD_LIMITS = { name: 120, company: 160, email: 254, phone: 40, message: 2000 } as const
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const PHONE_RE = /^[+()\-.\s\d]{6,40}$/

// the form has two steps: who you are (name, company, email, phone, kind of business), then your idea (interest,
// message, consent)
export const AD_STEP1: AdField[] = ['name', 'company', 'email', 'phone', 'businessType']

export function validateAdEnquiry(f: AdEnquiry): AdErrors {
  const e: AdErrors = {}
  const need = (k: 'name' | 'company' | 'message') => {
    const v = f[k].trim()
    if (!v) e[k] = 'required'
    else if (v.length > AD_LIMITS[k]) e[k] = 'tooLong'
  }
  need('name')
  need('company')
  if (!f.businessType) e.businessType = 'required'
  const email = f.email.trim()
  if (!email) e.email = 'required'
  else if (email.length > AD_LIMITS.email || !EMAIL_RE.test(email)) e.email = 'invalid'
  if (f.phone.trim() && !PHONE_RE.test(f.phone.trim())) e.phone = 'invalid'
  if (!f.interest) e.interest = 'required'
  need('message')
  if (!f.consent) e.consent = 'required'
  return e
}

// returns true when saved; false on any error (network, refused by the database)
export async function sendAdEnquiry(f: AdEnquiry, lang: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('ad_enquiries').insert({
      business_type: f.businessType || null,
      name: f.name.trim(),
      company: f.company.trim(),
      email: f.email.trim(),
      phone: f.phone.trim() || null,
      interest: f.interest,
      message: f.message.trim(),
      lang,
      consent: f.consent,
    })
    return !error
  } catch {
    return false
  }
}
