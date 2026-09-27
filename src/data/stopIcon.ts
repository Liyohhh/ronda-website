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
  for (const rule of PLACE_RULES) {
    if (rule.pattern.test(stopName)) return rule.kind
  }
  if (/feeder|bus|brt|gokl|hoho|nadi putra|smart selangor/i.test(category)) return 'bus'
  if (RAIL.test(category)) return 'train'
  return 'bus'
}

export function isRailCategory(category: string) {
  return RAIL.test(category) && !/feeder/i.test(category)
}
