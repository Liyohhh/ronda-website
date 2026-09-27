// Picks an icon for a search suggestion.
// Place keywords in the stop name win (e.g. "Hospital Kajang"); otherwise the
// transport mode is taken from the Hop label returned by search_stops().

export type StopIconKind =
  | 'train'
  | 'bus'
  | 'airport'
  | 'hospital'
  | 'school'
  | 'mall'
  | 'mosque'
  | 'home'
  | 'building'

const PLACE_RULES: { kind: StopIconKind; pattern: RegExp }[] = [
  { kind: 'airport', pattern: /\b(klia|airport|lapangan terbang|skypark)\b/i },
  { kind: 'hospital', pattern: /\b(hospital|klinik|clinic|kpj|pusat perubatan|medical)\b/i },
  { kind: 'school', pattern: /\b(smk|sk|sjk\w*|sekolah|school|universiti|university|kolej|college|uitm|ukm|upm|um|uniten)\b/i },
  { kind: 'mall', pattern: /\b(mall|plaza|pavilion|aeon|mydin|tesco|lotus'?s?|giant|pasar|market|ioi city|pyramid|mid valley)\b/i },
  { kind: 'mosque', pattern: /\b(masjid|surau|mosque)\b/i },
  { kind: 'home', pattern: /\b(taman|tmn|flat|apartment|apartmen|pangsapuri|kondo|condo|residen\w*|perumahan|ppr)\b/i },
  { kind: 'building', pattern: /\b(menara|wisma|kompleks|bangunan|tower|jabatan|dewan|stadium)\b/i },
]

const RAIL = /\b(MRT|LRT|Monorail|KTM|ETS|ERL|ECRL)\b/

export function stopIconKind(stopName: string, category: string): StopIconKind {
  // Train stations (MRT, LRT, Monorail, KTM, ETS, ERL) always get the train icon
  if (isRailCategory(category)) return 'train'
  // Bus stops: show what's there if the name says so (e.g. "Hospital Kajang")
  for (const rule of PLACE_RULES) {
    if (rule.pattern.test(stopName)) return rule.kind
  }
  return 'bus'
}

// "MRT Feeder Hop" is a feeder BUS, and BRT Sunway is a bus rapid transit line
export function isRailCategory(category: string) {
  return RAIL.test(category) && !/feeder|brt/i.test(category)
}
