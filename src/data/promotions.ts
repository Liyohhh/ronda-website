// Promotions on the home page. Every banner is an ad and is labelled "Ad" on screen.
// For now these are RONDA's own house ads (so the section is never empty); later they will come from the
// merchant tier in the database (paid placements), with the same shape. No tracking scripts, no third-party ad tags.
// The wide banner has a Wikimedia Commons photo (licence allows commercial use; credited on the About page), chosen
// without recognisable brands or named shops; the smaller cards have small drawn maps (PromoMap), no photos.
// All words stay real text so they translate and read aloud.
// Never put an offer, price or discount here that a real partner has not given us in writing.

import type { TranslationKey } from '../i18n/translations'
import type { TrailPhoto } from './trailPhotos'
import { RONDA300_MAP } from './ronda300Link'
import type { PromoMapKind } from '../components/PromoMap'

const commons = (path: string, file: string, width = 960) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/${width}px-${file}`

export type Promotion = {
  id: string
  title: TranslationKey
  text: TranslationKey
  to: string
  map: PromoMapKind
}

// the wide banner on top: photo with a navy fade, the three ad places as chips, one button
export const PROMO_FEATURE = {
  id: 'advertise',
  title: 'promoAdvertiseTitle',
  text: 'promoHeroFoot',
  note: 'promoHeroRibbon',
  cta: 'promoTalkToUs',
  to: '/help/general#business',
  tickets: ['promoTicketBanner', 'promoTicketListing', 'promoTicketOffers'],
  photo: {
    src: commons('c/cc', 'Kuala_Lumpur_Skyline_at_dusk_1.jpg', 1280), alt: 'Kuala Lumpur skyline at dusk',
    author: 'Walkerssk', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    page: 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_Skyline_at_dusk_1.jpg',
  },
} as const satisfies {
  id: string
  title: TranslationKey
  text: TranslationKey
  note: TranslationKey
  cta: TranslationKey
  to: string
  tickets: readonly TranslationKey[]
  photo: TrailPhoto & { alt: string }
}

// the row of smaller cards under it
export const PROMOTIONS: Promotion[] = [
  { id: 'ronda300', title: 'promoRonda300Title', text: 'promoRonda300Text', to: RONDA300_MAP, map: 'ronda300' },
  { id: 'partners', title: 'promoPartnersTitle', text: 'promoPartnersText', to: '/help/general#business', map: 'partners' },
  { id: 'offers', title: 'promoOffersTitle', text: 'promoOffersText', to: '/help/general#business', map: 'offers' },
]
