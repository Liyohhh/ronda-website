// Promotions on the home page. Every card is an ad and is labelled "Ad" on screen.
// For now these are RONDA's own placeholder ads (so the section is never empty); later they will come from the
// merchant tier in the database (paid placements), with the same shape. No tracking scripts, no third-party ad tags.
// Photos are reused from trailPhotos.ts, already credited in About -> photo credits.

import type { TranslationKey } from '../i18n/translations'
import { TRAIL_PHOTOS, type TrailPhoto } from './trailPhotos'

export type Promotion = {
  id: string
  title: TranslationKey
  text: TranslationKey
  to: string
  photo: TrailPhoto
  alt: string
}

export const PROMOTIONS: Promotion[] = [
  { id: 'advertise', title: 'promoAdvertiseTitle', text: 'promoAdvertiseText', to: '/help/general#business', photo: TRAIL_PHOTOS['night-market'], alt: 'Night market near LRT Jelatek' },
  { id: 'ronda300', title: 'promoRonda300Title', text: 'promoRonda300Text', to: '/ronda-300', photo: TRAIL_PHOTOS['cafe-hopping'], alt: 'Tingkap Cafe, Kuala Lumpur' },
  { id: 'partners', title: 'promoPartnersTitle', text: 'promoPartnersText', to: '/help/general#business', photo: TRAIL_PHOTOS['rooftop-dining'], alt: 'Kuala Lumpur skyline at dusk' },
]
