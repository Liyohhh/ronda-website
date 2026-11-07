// Title and description for each page (used by SeoTags.tsx)
import { translations, type TranslationKey } from '../i18n/translations'

export type PageMeta = { title: string; description: string }

export const DEFAULT_META: PageMeta = {
  title: "Ronda2Go · Let's Ronda",
  description:
    "Plan trips on all of Malaysia's public transport, trains and buses, in one place. Live buses and trains, fares and routes in English, Malay, Chinese and Arabic.",
}

// Hand-written titles. These win over the automatic trail titles below.
const PAGES: Record<string, PageMeta> = {
  '/': {
    title: 'Ronda2Go – Malaysia Train & Bus Trip Planner',
    description:
      'Plan trips on MRT, LRT, KTM, Monorail and buses across Malaysia. Live arrivals, fares and routes in English, Malay, Chinese and Arabic.',
  },
  '/trails': {
    title: 'Trails: Explore Malaysia by Train & Bus – Ronda2Go',
    description:
      'Ready-made trails for food, heritage, shopping, nature and fun, all reachable by public transport. Pick a trail and Ronda2Go plans the route.',
  },
  '/ronda-300': {
    title: 'RONDA 300: Places Within 300 m of Every Station – Ronda2Go',
    description:
      '18,000+ places to eat, see and shop within 300 m (about a 5-minute walk) of a station, each with a link to plan your trip there.',
  },
  '/live': {
    title: 'Live Bus Map: Real-Time Bus Positions in Malaysia – Ronda2Go',
    description:
      'See where buses are right now on a live map. Search a route, station or place and plan your trip across Malaysia.',
  },
  '/about': {
    title: "About Ronda2Go – Malaysia's Public Transport App",
    description:
      "Ronda2Go by Movinexa makes Malaysia's trains and buses easy to use, with one planner for every line in four languages.",
  },
  '/credits': {
    title: 'Credits & Data Sources – Ronda2Go',
    description:
      "The open data, partners and tools that power Ronda2Go's routes, live arrivals and maps.",
  },
  '/help': {
    title: 'Help Centre – Ronda2Go',
    description:
      "Answers on using Ronda2Go: planning trips, live arrivals, payments, accounts and policies for Malaysia's trains and buses.",
  },
  '/help/general': {
    title: 'Getting Started with Ronda2Go – Help',
    description:
      'How to plan a trip, read routes and live arrivals, switch languages and save places in Ronda2Go.',
  },
  '/help/payments': {
    title: 'Payments & Fares Help – Ronda2Go',
    description:
      "How fares are shown in Ronda2Go and how paying works on Malaysia's trains and buses.",
  },
  '/help/policies': {
    title: 'Privacy, Terms & Policies – Ronda2Go',
    description:
      "Read Ronda2Go's privacy policy, terms of use and how we handle your location and account data.",
  },
  '/trails/food-hawker': {
    title: 'Hawker & Night Market Trail in KL by MRT – Ronda2Go',
    description:
      '9 stops of Chinese, Malay and Indian street food plus a night market for every evening, from MRT Bukit Bintang to MRT Taman Tun Dr Ismail.',
  },
}

// Trail page address (slug) → its key in translations.ts
// e.g. 'street-art' → 'streetArt' → trail_streetArt_name / trail_streetArt_desc
export const TRAIL_KEYS: Record<string, string> = {
  heritage: 'heritage',
  mosques: 'mosques',
  'cultural-harmony': 'harmony',
  museum: 'museum',
  'street-art': 'streetArt',
  'explore-selangor': 'exploreSelangor',
  putrajaya: 'explorePutrajaya',
  'explore-pahang': 'explorePahang',
  'explore-terengganu': 'exploreTerengganu',
  'food-hawker': 'food',
  michelin: 'michelin',
  'rooftop-dining': 'rooftop',
  'cafe-hopping': 'cafe',
  shopping: 'shopping',
  'mall-hopping': 'mallHopping',
  nature: 'nature',
  kids: 'kids',
  'extreme-park': 'extreme',
  instagrammable: 'insta',
  events: 'events',
  'halal-fine-dining': 'halalFine',
  climbing: 'climbing',
  arcades: 'arcades',
  'active-play': 'activePlay',
  'escape-rooms': 'escapeRooms',
  'laser-tag': 'laserTag',
  paintball: 'paintball',
  karting: 'karting',
}

// Builds a trail page's title and description from its English name and description
function trailMeta(slug: string): PageMeta | undefined {
  const key = TRAIL_KEYS[slug]
  if (!key) return undefined
  const name = translations.en[`trail_${key}_name` as TranslationKey]
  const desc = translations.en[`trail_${key}_desc` as TranslationKey]
  if (!name || !desc) return undefined
  return {
    title: `${name} – Ronda2Go`,
    description: `${desc} Every stop is reachable by train and bus.`,
  }
}

export function getPageMeta(pathname: string): PageMeta {
  // treat "/about/" the same as "/about"
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (PAGES[path]) return PAGES[path]
  const trail = path.match(/^\/trails\/([^/]+)$/)
  if (trail) return trailMeta(trail[1]) ?? DEFAULT_META
  return DEFAULT_META
}