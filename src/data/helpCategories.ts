import type { TranslationKey } from '../i18n/translations'

export type HelpCategory = {
  slug: 'payments' | 'general' | 'policies'
  labelKey: TranslationKey
  icon: 'payments' | 'general' | 'policies'
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { slug: 'payments', labelKey: 'payments', icon: 'payments' },
  { slug: 'general', labelKey: 'general', icon: 'general' },
  { slug: 'policies', labelKey: 'policies', icon: 'policies' },
]

// Help articles: question + answer as translation keys help_<id>_q / help_<id>_a. Facts only (what the site does
// today); policy articles are a draft until reviewed by a lawyer (shown on the page).
export type HelpArticle = { id: string; category: HelpCategory['slug']; draft?: boolean }

export const HELP_ARTICLES: HelpArticle[] = [
  { id: 'payWhere', category: 'payments' },
  { id: 'payFares', category: 'payments' },
  { id: 'payFree', category: 'payments' },
  { id: 'genCover', category: 'general' },
  { id: 'genLive', category: 'general' },
  { id: 'genAccount', category: 'general' },
  { id: 'genData', category: 'general' },
  { id: 'genLanguages', category: 'general' },
  { id: 'business', category: 'general' },
  { id: 'services', category: 'general' },
  { id: 'polPrivacy', category: 'policies', draft: true },
  { id: 'polRights', category: 'policies', draft: true },
  { id: 'polService', category: 'policies', draft: true },
]

// shown on the Help home page
export const HOT_QUESTIONS = ['genLive', 'payWhere', 'payFares', 'business']

export const articleQ = (id: string) => `help_${id}_q` as TranslationKey
export const articleA = (id: string) => `help_${id}_a` as TranslationKey
export const articleHref = (a: HelpArticle) => `/help/${a.category}#${a.id}`
export const findArticle = (id: string) => HELP_ARTICLES.find((a) => a.id === id)

export function findCategory(slug: string | undefined) {
  return HELP_CATEGORIES.find((c) => c.slug === slug)
}
