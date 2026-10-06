// RONDA Trails: curated lifestyle routes you can do by public transport.
// Loaded from the database (structure only). All visible text lives in src/i18n/translations.ts:
//   trail_<key>_name / trail_<key>_desc for trails, place_<id> for each stop's blurb.
// Place names are proper nouns and stay the same in every language.
// `station` is the nearest station: `name` is what riders see, `search` is the exact name RONDA's
// search_stops() returns for it (some GTFS names carry sponsor suffixes), `lineIds` are from
// src/data/lines.ts for the badge. null = not confirmed yet (see `todo`).
// No addresses or coordinates here on purpose; don't invent them.

import type { Lang, TranslationKey } from '../i18n/translations'

export type TrailCategory = 'food' | 'culture' | 'shopping' | 'nature' | 'explore' | 'halal-fine-dining'

// shown in every language
export const TRAIL_CATEGORIES: TrailCategory[] = ['food', 'culture', 'shopping', 'nature', 'explore']
// shown only when the site is in Arabic (pills, trail lists, the Explore menu); hidden in the other languages
export const ARABIC_ONLY_CATEGORIES: TrailCategory[] = ['halal-fine-dining']

export const isCategoryShown = (c: TrailCategory, lang: Lang) => lang === 'ar' || !ARABIC_ONLY_CATEGORIES.includes(c)
export const categoriesFor = (lang: Lang) => [...TRAIL_CATEGORIES, ...ARABIC_ONLY_CATEGORIES].filter((c) => isCategoryShown(c, lang))

export type Station = { name: string; search: string; lineIds: string[]; feedId?: string; stopId?: string }

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

// The trails themselves are in the database (public.trails, trail_stops, trail_places; src/services/trails.ts).
export type TrailData = { trails: Trail[]; places: Record<string, Place> }

export const findTrail = (d: TrailData, slug?: string) => d.trails.find((t) => t.slug === slug)

// translation keys (checked by the build: a missing translation is a type error at the call site)
export const trailNameKey = (t: Trail) => `trail_${t.key}_name` as TranslationKey
export const trailDescKey = (t: Trail) => `trail_${t.key}_desc` as TranslationKey
export const placeBlurbKey = (id: string) => `place_${id}` as TranslationKey
export const categoryKey = (c: TrailCategory) => `trailCat_${c}` as TranslationKey
export const weekdayKey = (d: Weekday) => `day_${d}` as TranslationKey

// first known station of a trail (for the card footer)
export const firstStation = (t: Trail, places: Record<string, Place>) => t.stops.map((s) => places[s.placeId]?.station).find(Boolean) ?? null
