import type { TranslationKey } from '../i18n/translations'
import type { IconName } from './icons'

// "Everything you need for the journey" on the home page (FeaturesSection). Each one is a whole-card link,
// except languages: a button that opens the language menu.
// Title feat_<x>, one line featd_<x> (translations.ts).
export const OPEN_LANGUAGE_MENU = 'ronda:open-language'

export type Feature = { key: TranslationKey; desc: TranslationKey; icon: IconName; to?: string; soon?: boolean }
export const FEATURES: Feature[] = [
  { key: 'feat_directions', desc: 'featd_directions', icon: 'route', to: '/#plan' },
  { key: 'feat_fares', desc: 'featd_fares', icon: 'payments', to: '/help/payments#payFares' },
  { key: 'feat_lines', desc: 'featd_lines', icon: 'train', to: '/?tab=lines' },
  { key: 'feat_ronda300', desc: 'featd_ronda300', icon: 'myLocation', to: '/ronda-300' },
  { key: 'feat_airport', desc: 'featd_airport', icon: 'flight', to: '/?to=ERL%20KLIA%20T1&toName=KLIA%20Terminal%201' },
  { key: 'feat_languages', desc: 'featd_languages', icon: 'translate' },
  { key: 'feat_saved', desc: 'featd_saved', icon: 'bookmark', to: '/dashboard' },
  { key: 'feat_alerts', desc: 'featd_alerts', icon: 'notifications', to: '/about#about-features', soon: true },
]
