import type { TranslationKey } from '../i18n/translations'

export type HelpCategory = {
  slug: string
  labelKey: TranslationKey
  icon: 'payments' | 'refunds' | 'general' | 'policies'
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { slug: 'payments', labelKey: 'payments', icon: 'payments' },
  { slug: 'returns-refunds', labelKey: 'returnsRefunds', icon: 'refunds' },
  { slug: 'general', labelKey: 'general', icon: 'general' },
  { slug: 'policies', labelKey: 'policies', icon: 'policies' },
]

// Placeholder questions. Replace with real help articles later.
export const HOT_QUESTIONS: { category: string; question: string }[] = [
  { category: 'general', question: "[My Account] Why didn't I receive my verification code (OTP)?" },
  { category: 'returns-refunds', question: '[Booking Cancellation] How will I get my refund for a cancelled booking?' },
  { category: 'general', question: '[Trip Tracking] How can I check live arrival times for my bus or train?' },
  { category: 'payments', question: '[Payments] Which payment methods does RONDA accept?' },
]

export function findCategory(slug: string | undefined) {
  return HELP_CATEGORIES.find((c) => c.slug === slug)
}
