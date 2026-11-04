// Promotions on the home page. Every card is an ad and is labelled "Ad" on screen.
// For now these are RONDA's own house ads (so the section is never empty); later they will come from the
// merchant tier in the database (paid placements), with the same shape. No tracking scripts, no third-party ad tags.
// Each card has a photo in its arched top (the owner's own photos in public/, credited on the About page). All words
// stay real text so they translate and read aloud. Never put an offer, price or discount here that a real partner
// has not given us in writing.

import type { TranslationKey } from '../i18n/translations'
import type { IconName } from './icons'
import { RONDA300_MAP } from './ronda300Link'

export type Promotion = {
  id: string
  eyebrow: TranslationKey
  title: TranslationKey
  cta: TranslationKey
  to: string
  photo: string
  icon: IconName
  lit?: boolean // the one card filled blue and a little taller (the middle one)
  stat?: boolean // shows how many stops and stations riders plan trips at
}

// in screen order: the lit RONDA 300 card sits in the middle
export const PROMOTIONS: Promotion[] = [
  { id: 'partners', eyebrow: 'promoHotelEyebrow', title: 'promoHotelHead', cta: 'promoHotelBtn', to: '/help/general#business', photo: '/Image/banner-kl.webp', icon: 'luggage' },
  { id: 'ronda300', eyebrow: 'promo300Eyebrow', title: 'promo300Head', cta: 'promo300Btn', to: RONDA300_MAP, photo: '/places/centralMarket.jpg', icon: 'storefront', lit: true, stat: true },
  { id: 'offers', eyebrow: 'promoOfferEyebrow', title: 'promoOfferHead', cta: 'promoOfferBtn', to: '/help/general#business', photo: '/places/sultanAbdulSamad.jpg', icon: 'sell' },
]
