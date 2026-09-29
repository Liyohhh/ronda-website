// Content of the header's hover menus. Every item is a working link: plan a trip to a station,
// open a trail category, or jump to a section of the About page.
// Place and station names are proper nouns and stay the same in every language.

import type { TranslationKey } from '../i18n/translations'
import { TRAIL_CATEGORIES, categoryKey } from './trails'

// /?to=<stop name>&toName=<shown name> opens Home with the End box filled in
const planTo = (stop: string, shown = stop) => `/?to=${encodeURIComponent(stop)}&toName=${encodeURIComponent(shown)}`
// a place with no station of its own; coordinates from OpenStreetMap
const planToPlace = (lat: number, lon: number, shown: string) => `/?toLat=${lat}&toLon=${lon}&toName=${encodeURIComponent(shown)}`

export type NavItem = { to: string; name?: string; label?: TranslationKey; detail?: string; detailLabel?: TranslationKey }
export type NavColumn = { title: TranslationKey; items: NavItem[] }
export type NavMenu = {
  key: 'navTravel' | 'navExplore' | 'navServices' | 'about'
  columns: NavColumn[]
  promo: { title: TranslationKey; text: TranslationKey; cta: TranslationKey; to: string }
}

export const NAV_MENUS: NavMenu[] = [
  {
    key: 'navTravel',
    columns: [
      {
        title: 'navAirports',
        items: [
          { name: 'KLIA Terminal 1', detail: 'ERL KLIA T1', to: planTo('ERL KLIA T1', 'KLIA Terminal 1') },
          { name: 'KLIA Terminal 2', detail: 'ERL KLIA T2', to: planTo('ERL KLIA T2', 'KLIA Terminal 2') },
          { name: 'KL Sentral', detail: 'KLIA Ekspres · KLIA Transit', to: planTo('ERL KL Sentral', 'KL Sentral') },
        ],
      },
      {
        title: 'navBusTerminals',
        items: [
          { name: 'Terminal Bersepadu Selatan (TBS)', detail: 'LRT / KTM / ERL Bandar Tasik Selatan', to: planTo('LRT Bandar Tasik Selatan', 'Terminal Bersepadu Selatan (TBS)') },
          { name: 'Pudu Sentral', detail: 'LRT Plaza Rakyat', to: planTo('LRT Plaza Rakyat', 'Pudu Sentral') },
          // OSM way 871914528 (Gombak Integrated Transport Terminal)
          { name: 'Terminal Bersepadu Gombak (TBG)', detail: 'Gombak, Selangor', to: planToPlace(3.2304945, 101.7250658, 'Terminal Bersepadu Gombak (TBG)') },
        ],
      },
    ],
    promo: { title: 'navPlanTitle', text: 'navPlanText', cta: 'navPlanCta', to: '/' },
  },
  {
    key: 'navExplore',
    columns: [
      {
        title: 'navTrailCats',
        items: TRAIL_CATEGORIES.map((c) => ({ label: categoryKey(c), to: `/trails?category=${c}` })),
      },
      {
        title: 'navPopular',
        items: [
          { name: 'Petronas Twin Towers', detail: 'LRT KLCC', to: planTo('LRT KLCC', 'Petronas Twin Towers') },
          { name: 'Pavilion Kuala Lumpur', detail: 'MRT Bukit Bintang', to: planTo('MRT Bukit Bintang', 'Pavilion Kuala Lumpur') },
          { name: 'Batu Caves', detail: 'KTM Batu Caves', to: planTo('KTM Batu Caves', 'Batu Caves') },
          { name: 'Central Market (Pasar Seni)', detail: 'MRT Pasar Seni', to: planTo('MRT Pasar Seni', 'Central Market (Pasar Seni)') },
        ],
      },
    ],
    promo: { title: 'trailsTitle', text: 'trailsSubtitle', cta: 'navSeeTrails', to: '/trails' },
  },
  {
    // Chauffeur and private-car transfers (enquiries through the Help Centre)
    key: 'navServices',
    columns: [
      {
        title: 'navChauffeur',
        items: [
          { label: 'svc_hourly', detailLabel: 'svc_hourly_d', to: '/services#chauffeur' },
          { label: 'svc_fullday', detailLabel: 'svc_fullday_d', to: '/services#chauffeur-day' },
          { label: 'svc_corporate', detailLabel: 'svc_corporate_d', to: '/services#chauffeur-events' },
        ],
      },
      {
        title: 'navCarTransfer',
        items: [
          { label: 'navCarTransfer', detailLabel: 'svc_private_d', to: '/services#transfer' },
          { label: 'svc_van', detailLabel: 'svc_upTo', to: '/services#transfer-van' },
          { label: 'svc_coach', detail: 'KL Sentral ↔ KLIA T1 / T2', to: '/services#transfer-coach' },
        ],
      },
    ],
    promo: { title: 'navChauffeur', text: 'svc_chauffeurText', cta: 'svc_promoCta', to: '/services' },
  },
  {
    key: 'about',
    columns: [
      {
        title: 'navAboutRonda',
        items: [
          { label: 'howTitle', to: '/about#about-how' },
          { label: 'networksTitle', to: '/about#about-networks' },
          { label: 'faqTitle', to: '/about#about-faq' },
          { label: 'helpCentre', to: '/help' },
        ],
      },
    ],
    promo: { title: 'navMerchantTitle', text: 'navMerchantText', cta: 'navMerchantCta', to: '/help' },
  },
]
