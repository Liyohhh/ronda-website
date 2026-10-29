// Promotions on the home page. Every card is an ad and is labelled "Ad" on screen.
// For now these are RONDA's own house ads (so the section is never empty); later they will come from the
// merchant tier in the database (paid placements), with the same shape. No tracking scripts, no third-party ad tags.
// The cards carry flat drawings (components/PromoArt.tsx), no photos. All words stay real text so they translate and
// read aloud. Never put an offer, price or discount here that a real partner has not given us in writing.

import type { TranslationKey } from '../i18n/translations'
import { RONDA300_MAP } from './ronda300Link'
import type { PromoArtKind } from '../components/PromoArt'

export type Promotion = {
  id: string
  eyebrow: TranslationKey
  title: TranslationKey
  cta: TranslationKey
  to: string
  art: PromoArtKind
  tone: 'navy' | 'sky' | 'blue' // the card's colour
  stat?: boolean // the wide card shows how many stops and stations riders plan trips at
}

// the wide card first, then the two smaller ones beside it
export const PROMOTIONS: Promotion[] = [
  { id: 'ronda300', eyebrow: 'promo300Eyebrow', title: 'promo300Head', cta: 'promo300Btn', to: RONDA300_MAP, art: 'station', tone: 'navy', stat: true },
  { id: 'partners', eyebrow: 'promoHotelEyebrow', title: 'promoHotelHead', cta: 'promoHotelBtn', to: '/help/general#business', art: 'hotel', tone: 'sky' },
  { id: 'offers', eyebrow: 'promoOfferEyebrow', title: 'promoOfferHead', cta: 'promoOfferBtn', to: '/help/general#business', art: 'offer', tone: 'blue' },
]
