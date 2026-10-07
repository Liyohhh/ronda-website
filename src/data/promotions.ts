// Promotions on the home page. Every banner is an ad and is labelled "Ad" on screen.
// For now these are RONDA's own house ads (so the section is never empty); later they will come from the
// merchant tier in the database (paid placements), with the same shape. No tracking scripts, no third-party ad tags.
// Art is drawn in code (PromoArt.tsx), not photos; all words stay real text so they translate and read aloud.
// Never put an offer, price or discount here that a real partner has not given us in writing.

import type { TranslationKey } from '../i18n/translations'

export type PromoTheme = 'blue' | 'gold' | 'teal' | 'coral'
export type PromoArt = 'tickets' | 'cafe' | 'hotel' | 'trail'

export type Promotion = {
  id: string
  title: TranslationKey
  text: TranslationKey
  to: string
  theme: PromoTheme
  art: PromoArt
  /** big word or figure printed on the banner, already in every language (e.g. "300 m") */
  big?: string
}

// the wide banner on top
export const PROMO_FEATURE = {
  id: 'advertise',
  title: 'promoAdvertiseTitle',
  ribbon: 'promoHeroRibbon',
  foot: 'promoHeroFoot',
  to: '/help/general#business',
  tickets: ['promoTicketBanner', 'promoTicketListing', 'promoTicketOffers'],
} as const satisfies {
  id: string
  title: TranslationKey
  ribbon: TranslationKey
  foot: TranslationKey
  to: string
  tickets: readonly TranslationKey[]
}

// the row of smaller banners under it
export const PROMOTIONS: Promotion[] = [
  { id: 'ronda300', title: 'promoRonda300Title', text: 'promoRonda300Text', to: '/ronda-300', theme: 'gold', art: 'cafe', big: '300 m' },
  { id: 'partners', title: 'promoPartnersTitle', text: 'promoPartnersText', to: '/help/general#business', theme: 'teal', art: 'hotel' },
  { id: 'trails', title: 'trailsTitle', text: 'trailsSubtitle', to: '/trails', theme: 'coral', art: 'trail' },
]
