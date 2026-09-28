// RONDA Trails: curated lifestyle routes you can do by public transport.
// Static for now (no Supabase table yet). All visible text lives in src/i18n/translations.ts:
//   trail_<key>_name / trail_<key>_desc for trails, place_<id> for each stop's blurb.
// Place names are proper nouns and stay the same in every language.
// `station` is the nearest station: `name` is what riders see, `search` is the exact name RONDA's
// search_stops() returns for it (some GTFS names carry sponsor suffixes), `lineIds` are from
// src/data/lines.ts for the badge. null = not confirmed yet (see `todo`).
// No addresses or coordinates here on purpose; don't invent them.

import type { TranslationKey } from '../i18n/translations'

export type TrailCategory = 'food' | 'culture' | 'shopping' | 'nature' | 'explore'

export const TRAIL_CATEGORIES: TrailCategory[] = ['food', 'culture', 'shopping', 'nature', 'explore']

export type Station = { name: string; search: string; lineIds: string[] }

export type Place = {
  id: string
  name: string
  station: Station | null
  todo?: string
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type TrailStop = {
  placeId: string
  day?: Weekday // night-market trail: which evening it runs
  todo?: string
}

export type Trail = {
  slug: string
  key: string // translation key stem: trail_<key>_name, trail_<key>_desc
  category: TrailCategory
  stops: TrailStop[]
}

// ---------- stations used by trails ----------
const st = (name: string, lineIds: string[], search = name): Station => ({ name, search, lineIds })
const S = {
  bukitBintangMrt: st('MRT Bukit Bintang', ['mrt-kajang']),
  klcc: st('LRT KLCC', ['lrt-kelana-jaya']),
  midValley: st('KTM Mid Valley', ['ktm-seremban'], 'KTM Perhentian Midvalley'),
  sunwayLagoon: st('BRT Sunway Lagoon', ['brt-sunway']),
  pasarSeni: st('MRT Pasar Seni', ['mrt-kajang']),
  masjidJamek: st('LRT Masjid Jamek', ['lrt-ampang', 'lrt-sri-petaling', 'lrt-kelana-jaya']),
  kualaLumpurKtm: st('KTM Kuala Lumpur', ['ktm-port-klang', 'ktm-seremban', 'ktm-ets'], 'KTM/ETS Kuala Lumpur'),
  merdeka: st('MRT Merdeka', ['mrt-kajang']),
  muziumNegara: st('MRT Muzium Negara', ['mrt-kajang']),
  titiwangsa: st('Monorail Titiwangsa', ['monorail']),
  bukitNanas: st('Monorail Bukit Nanas', ['monorail']),
  rajaChulan: st('Monorail Raja Chulan', ['monorail']),
  batuCaves: st('KTM Batu Caves', ['ktm-seremban']),
  bangsar: st('LRT Bangsar', ['lrt-kelana-jaya'], 'LRT Bangsar - Bank Rakyat'),
  tamanConnaught: st('MRT Taman Connaught', ['mrt-kajang']),
  medanTuanku: st('Monorail Medan Tuanku', ['monorail']),
  ss15: st('LRT SS15', ['lrt-kelana-jaya'], 'LRT Ss 15'),
  kampungBaru: st('LRT Kampung Baru', ['lrt-kelana-jaya'], 'LRT Kampung Baru - Cbp Coopbank Pertama'),
  chowKit: st('Monorail Chow Kit', ['monorail']),
  klSentralMono: st('Monorail KL Sentral', ['monorail']),
  bandaraya: st('LRT Bandaraya', ['lrt-ampang', 'lrt-sri-petaling'], 'LRT Bandaraya - Uob'),
} satisfies Record<string, Station>

// ---------- places (stops) ----------
const PLACE_LIST: Place[] = [
  // shopping
  { id: 'pavilion', name: 'Pavilion Kuala Lumpur', station: S.bukitBintangMrt },
  { id: 'lot10', name: 'Lot 10', station: S.bukitBintangMrt },
  { id: 'suriaKlcc', name: 'Suria KLCC', station: S.klcc },
  { id: 'midValley', name: 'Mid Valley Megamall', station: S.midValley },
  { id: 'sunwayPyramid', name: 'Sunway Pyramid', station: S.sunwayLagoon },
  // heritage
  { id: 'sultanAbdulSamad', name: 'Sultan Abdul Samad Building', station: S.masjidJamek },
  { id: 'merdekaSquare', name: 'Merdeka Square (Dataran Merdeka)', station: S.masjidJamek },
  { id: 'centralMarket', name: 'Central Market (Pasar Seni)', station: S.pasarSeni },
  { id: 'oldKlStation', name: 'Kuala Lumpur Railway Station (old)', station: S.kualaLumpurKtm },
  { id: 'stadiumMerdeka', name: 'Stadium Merdeka', station: S.merdeka },
  // museums
  { id: 'muziumNegara', name: 'National Museum (Muzium Negara)', station: S.muziumNegara },
  { id: 'iamm', name: 'Islamic Arts Museum Malaysia', station: S.kualaLumpurKtm, todo: 'Confirm nearest station (KTM Kuala Lumpur vs MRT Muzium Negara) and walking route' },
  { id: 'textileMuseum', name: 'National Textile Museum', station: S.masjidJamek },
  { id: 'nationalArtGallery', name: 'National Art Gallery (Balai Seni Negara)', station: S.titiwangsa, todo: 'Confirm nearest station' },
  { id: 'petrosains', name: 'Petrosains', station: S.klcc },
  // nature / parks
  { id: 'klForestEcoPark', name: 'KL Forest Eco Park (Bukit Nanas)', station: S.bukitNanas },
  { id: 'perdanaBotanical', name: 'Perdana Botanical Garden', station: S.muziumNegara }, // ~4 min walk via Entrance B
  { id: 'batuCaves', name: 'Batu Caves', station: S.batuCaves },
  { id: 'frim', name: 'FRIM (Forest Research Institute Malaysia)', station: null, todo: 'Nearest station not confirmed; likely needs a bus or ride-hailing' },
  { id: 'klccPark', name: 'KLCC Park', station: S.klcc },
  { id: 'tamanTugu', name: 'Taman Tugu', station: S.bandaraya, todo: 'About a 30 min walk from the station; confirm the walking route' },
  // food
  { id: 'jalanAlor', name: 'Jalan Alor', station: S.bukitBintangMrt },
  { id: 'petalingStreet', name: 'Petaling Street', station: S.pasarSeni },
  { id: 'bangsar', name: 'Bangsar', station: S.bangsar },
  // street art
  { id: 'kwaiChaiHong', name: 'Kwai Chai Hong', station: S.pasarSeni },
  { id: 'riverOfLife', name: 'River of Life', station: S.masjidJamek },
  // night markets
  { id: 'ss2Market', name: 'SS2 Night Market, Petaling Jaya', station: null, todo: 'Nearest station not confirmed' },
  { id: 'connaughtMarket', name: 'Taman Connaught Night Market', station: S.tamanConnaught },
  { id: 'lorongTarMarket', name: 'Lorong Tuanku Abdul Rahman Night Market', station: S.medanTuanku },
  { id: 'bangsarMarket', name: 'Bangsar Baru Night Market', station: null, todo: 'Nearest station not confirmed (LRT Bangsar is some distance away)' },
  // religious & cultural harmony
  { id: 'masjidJamek', name: 'Masjid Jamek Sultan Abdul Samad', station: S.masjidJamek },
  { id: 'stMarys', name: "St. Mary's Cathedral", station: S.masjidJamek },
  { id: 'sriMahamariamman', name: 'Sri Mahamariamman Temple', station: S.pasarSeni },
  { id: 'guanDi', name: 'Guan Di Temple', station: S.pasarSeni },
  // cafés
  { id: 'chinatownCafes', name: 'Chinatown cafés (Petaling Street area)', station: S.pasarSeni },
  { id: 'bangsarCafes', name: 'Bangsar cafés', station: S.bangsar },
  { id: 'section17Cafes', name: 'Section 17, Petaling Jaya', station: null, todo: 'Nearest station not confirmed' },
  { id: 'ss15Cafes', name: 'SS15, Subang Jaya', station: S.ss15 },
  // hidden gems
  { id: 'kampungBaru', name: 'Kampung Baru', station: S.kampungBaru },
  { id: 'chowKitMarket', name: 'Chow Kit Market', station: S.chowKit },
  { id: 'theanHou', name: 'Thean Hou Temple', station: S.bangsar, todo: 'About a 23 min walk from the station (taxi from KL Sentral is the usual alternative)' },
  { id: 'brickfields', name: 'Brickfields (Little India)', station: S.klSentralMono },
  // instagrammable
  { id: 'twinTowers', name: 'Petronas Twin Towers', station: S.klcc },
  { id: 'batuCavesSteps', name: 'Batu Caves rainbow steps', station: S.batuCaves },
  { id: 'salomaLink', name: 'Saloma Link bridge', station: S.kampungBaru },
  // festive
  { id: 'kampungBaruRaya', name: 'Kampung Baru (Hari Raya)', station: S.kampungBaru },
  { id: 'chinatownCny', name: 'Chinatown (Chinese New Year)', station: S.pasarSeni },
  { id: 'brickfieldsDeepavali', name: 'Brickfields (Deepavali)', station: S.klSentralMono },
  // rooftop / sky dining
  { id: 'heliLounge', name: 'Heli Lounge Bar', station: S.rajaChulan },
  { id: 'marinis', name: "Marini's on 57", station: S.klcc },
  { id: 'skybarTraders', name: 'SkyBar, Traders Hotel', station: S.klcc },
  { id: 'klTowerRevolving', name: 'Atmosphere 360 (KL Tower)', station: S.bukitNanas, todo: 'Confirm nearest station (Monorail Bukit Nanas vs Raja Chulan)' },
]

export const PLACES: Record<string, Place> = Object.fromEntries(PLACE_LIST.map((p) => [p.id, p]))

// ---------- trails ----------
export const TRAILS: Trail[] = [
  { slug: 'shopping', key: 'shopping', category: 'shopping',
    stops: [{ placeId: 'pavilion' }, { placeId: 'lot10' }, { placeId: 'suriaKlcc' }, { placeId: 'midValley' }, { placeId: 'sunwayPyramid' }] },
  { slug: 'heritage', key: 'heritage', category: 'culture',
    stops: [{ placeId: 'sultanAbdulSamad' }, { placeId: 'merdekaSquare' }, { placeId: 'centralMarket' }, { placeId: 'oldKlStation' }, { placeId: 'stadiumMerdeka' }] },
  { slug: 'museum', key: 'museum', category: 'culture',
    stops: [{ placeId: 'muziumNegara' }, { placeId: 'iamm' }, { placeId: 'textileMuseum' }, { placeId: 'nationalArtGallery' }, { placeId: 'petrosains' }] },
  { slug: 'nature', key: 'nature', category: 'nature',
    stops: [{ placeId: 'klForestEcoPark' }, { placeId: 'perdanaBotanical' }, { placeId: 'batuCaves' }, { placeId: 'frim' }] },
  { slug: 'food-hawker', key: 'food', category: 'food',
    stops: [{ placeId: 'jalanAlor' }, { placeId: 'petalingStreet' }, { placeId: 'bangsar' }] },
  { slug: 'street-art', key: 'streetArt', category: 'culture',
    stops: [{ placeId: 'kwaiChaiHong' }, { placeId: 'riverOfLife' }] },
  { slug: 'night-market', key: 'nightMarket', category: 'food',
    stops: [
      { placeId: 'ss2Market', day: 'mon' },
      { placeId: 'connaughtMarket', day: 'wed' },
      { placeId: 'lorongTarMarket', day: 'sat' },
      { placeId: 'bangsarMarket', day: 'sun' },
    ] },
  { slug: 'cultural-harmony', key: 'harmony', category: 'culture',
    stops: [{ placeId: 'masjidJamek' }, { placeId: 'stMarys' }, { placeId: 'sriMahamariamman' }, { placeId: 'guanDi' }] },
  { slug: 'cafe-hopping', key: 'cafe', category: 'food',
    stops: [{ placeId: 'chinatownCafes' }, { placeId: 'bangsarCafes' }, { placeId: 'section17Cafes' }, { placeId: 'ss15Cafes' }] },
  { slug: 'hidden-gems', key: 'hiddenGems', category: 'explore',
    stops: [{ placeId: 'kampungBaru' }, { placeId: 'chowKitMarket' }, { placeId: 'theanHou' }, { placeId: 'brickfields' }] },
  { slug: 'instagrammable', key: 'insta', category: 'explore',
    stops: [{ placeId: 'twinTowers' }, { placeId: 'batuCavesSteps' }, { placeId: 'salomaLink' }, { placeId: 'merdekaSquare' }, { placeId: 'kwaiChaiHong' }] },
  { slug: 'student-budget', key: 'budget', category: 'explore',
    stops: [{ placeId: 'klccPark' }, { placeId: 'centralMarket' }, { placeId: 'batuCaves' }, { placeId: 'muziumNegara', todo: 'Confirm entry fee' }, { placeId: 'klForestEcoPark', todo: 'Confirm whether the canopy walk is free' }] },
  { slug: 'wellness-park', key: 'wellness', category: 'nature',
    stops: [{ placeId: 'klccPark' }, { placeId: 'perdanaBotanical' }, { placeId: 'tamanTugu' }] },
  { slug: 'festive', key: 'festive', category: 'culture',
    stops: [{ placeId: 'kampungBaruRaya' }, { placeId: 'chinatownCny' }, { placeId: 'brickfieldsDeepavali' }] },
  { slug: 'rooftop-dining', key: 'rooftop', category: 'food',
    stops: [{ placeId: 'heliLounge' }, { placeId: 'marinis' }, { placeId: 'skybarTraders' }, { placeId: 'klTowerRevolving' }] },
]

export const findTrail = (slug?: string) => TRAILS.find((t) => t.slug === slug)

// translation keys (checked by the build: a missing translation is a type error at the call site)
export const trailNameKey = (t: Trail) => `trail_${t.key}_name` as TranslationKey
export const trailDescKey = (t: Trail) => `trail_${t.key}_desc` as TranslationKey
export const placeBlurbKey = (id: string) => `place_${id}` as TranslationKey
export const categoryKey = (c: TrailCategory) => `trailCat_${c}` as TranslationKey
export const weekdayKey = (d: Weekday) => `day_${d}` as TranslationKey

// first known station of a trail (for the card footer)
export const firstStation = (t: Trail) => t.stops.map((s) => PLACES[s.placeId]?.station).find(Boolean) ?? null
