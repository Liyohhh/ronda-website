// Promotions on the home page. Every banner is an ad and is labelled "Ad" on screen.
// For now these are RONDA's own house ads (so the section is never empty); later they will come from the
// merchant tier in the database (paid placements), with the same shape. No tracking scripts, no third-party ad tags.
// Photos from Wikimedia Commons (licence allows commercial use; credited on the banner and on the About page).
// Chosen 9 Oct 2026 without recognisable brands or named shops, so no business looks like an advertiser it isn't.
// All words stay real text so they translate and read aloud.
// Never put an offer, price or discount here that a real partner has not given us in writing.

import type { TranslationKey } from '../i18n/translations'
import type { TrailPhoto } from './trailPhotos'

const commons = (path: string, file: string, width = 960) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/${width}px-${file}`

export type Promotion = {
  id: string
  title: TranslationKey
  text: TranslationKey
  to: string
  photo: TrailPhoto & { alt: string }
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
  {
    id: 'ronda300', title: 'promoRonda300Title', text: 'promoRonda300Text', to: '/ronda-300',
    photo: {
      src: commons('9/9f', 'Teh_tarik_20260427_-_01.jpg'), alt: 'A glass of teh tarik',
      author: 'Wiki Asmah', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
      page: 'https://commons.wikimedia.org/wiki/File:Teh_tarik_20260427_-_01.jpg',
    },
  },
  {
    id: 'partners', title: 'promoPartnersTitle', text: 'promoPartnersText', to: '/help/general#business',
    photo: {
      src: commons('6/68', 'Kuala_Lumpur_skyline_and_Petronas_Twin_Towers_night_view_from_Kampung_Baru.jpg_05.jpg'),
      alt: 'Rooftop pool with the Kuala Lumpur skyline at night',
      author: 'ELIZABETH XIONG', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
      page: 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_skyline_and_Petronas_Twin_Towers_night_view_from_Kampung_Baru.jpg_05.jpg',
    },
  },
  {
    id: 'offers', title: 'promoOffersTitle', text: 'promoOffersText', to: '/help/general#business',
    photo: {
      src: commons('f/f8', 'Pasar_Malam_Rice_Stall.jpg'), alt: 'Dishes at a pasar malam rice stall',
      author: 'Dr.Francostein1975', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      page: 'https://commons.wikimedia.org/wiki/File:Pasar_Malam_Rice_Stall.jpg',
    },
  },
]
