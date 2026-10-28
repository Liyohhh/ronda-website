import type { PlaceKind } from '../services/places'
import type { TrailPhoto } from './trailPhotos'

// UDA Holdings buildings near KL's trains, put first wherever RONDA lists places: first among the RONDA picks and the
// places in view on the RONDA 300 map (with a star), and first in the place search of the trip planner and RONDA 300.
// Researched 28 Oct 2026 from UDA's own pages (udamalls.com.my, uda.com.my) and news of the openings; positions from
// OpenStreetMap; nearest station from our own transit data (nearest_transit).
// Only buildings UDA owns or co-owns and that are a short walk from a station: Hentian Duta (no train near), City
// Parking and the townships are left out. LaLaport is in Bukit Bintang City Centre, UDA's joint venture with Eco
// World and EPF (UDA 40%, landowner) on the old Pudu Jail land; the mall itself is run by Mitsui Fudosan.
// TODO: Kompleks Jalan Raja Bot (Chow Kit) is not on OpenStreetMap yet; add it when its position is known.

export type FeaturedPlace = {
  id: string
  osm: string // OpenStreetMap id, as osm_pois has it ("way/123")
  name: string
  aliases: string[] // other names people search by (old names, the building's own name, the area)
  detail: string // shown under the name in the search list
  kind: PlaceKind
  lat: number
  lon: number
  photo?: TrailPhoto // from Wikimedia Commons, credited on the About page. Commons has no photo of Chinatown 1974,
  // Cahaya Suria or Sinar Kota themselves yet: those show their street (Jalan Petaling, Jalan Tun Perak by the Lebuh Pudu hub)
}

export const FEATURED_PLACES: FeaturedPlace[] = [
  {
    // the 1983 Tunas Utama building, reopened 5 Sep 2026: kopitiam, dim sum, hot pot, spa, boutique hotel, rooftop
    id: 'chinatown1974', osm: 'way/1311565853', name: 'Chinatown 1974', aliases: ['Tunas Utama', 'Menara Rezeki', 'Petaling Street', 'Jalan Petaling', 'Chinatown'],
    detail: 'Food, stay and rooftop, Jalan Petaling', kind: 'attraction', lat: 3.141134, lon: 101.698286,
    photo: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Jalan_Petaling_in_2026.jpg/960px-Jalan_Petaling_in_2026.jpg', author: 'Renek78', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Jalan_Petaling_in_2026.jpg' },
  },
  {
    // UDA's bus terminal (Hentian Puduraya until 2011), with UTC KL inside; LRT Plaza Rakyat 220 m
    id: 'puduSentral', osm: 'way/23766100', name: 'Pudu Sentral', aliases: ['Puduraya', 'Hentian Puduraya', 'UTC KL', 'Pudu bus terminal'],
    detail: 'Bus terminal and UTC KL, Jalan Pudu', kind: 'useful', lat: 3.145615, lon: 101.70091,
    photo: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Pudu_Sentral_%28230313%29.jpg/960px-Pudu_Sentral_%28230313%29.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Pudu_Sentral_(230313).jpg' },
  },
  {
    // since 1976 on Jalan TAR, UDA's head office; LRT Bandaraya 210 m
    id: 'pertamaComplex', osm: 'way/23064356', name: 'Pertama Complex', aliases: ['Kompleks Pertama', 'Jalan TAR', 'Jalan Tuanku Abdul Rahman'],
    detail: 'Shopping complex, Jalan Tuanku Abdul Rahman', kind: 'shopping', lat: 3.15734, lon: 101.695263,
    photo: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Kompleks_Pertama.jpg/960px-Kompleks_Pertama.jpg', author: 'Vano111ru', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Kompleks_Pertama.jpg' },
  },
  {
    // Bukit Bintang City Centre; Monorail Hang Tuah 220 m
    id: 'lalaportBbcc', osm: 'way/1113555095', name: 'LaLaport Bukit Bintang City Centre', aliases: ['Mitsui Shopping Park LaLaport', 'LaLaport', 'BBCC', 'Bukit Bintang City Centre', 'Zepp Kuala Lumpur'],
    detail: 'Mall, Bukit Bintang City Centre', kind: 'shopping', lat: 3.140691, lon: 101.70796,
    photo: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Mitsui_Shopping_Park_LaLaport_Bukit_Bintang_City_Centre_20260101_162722.jpg/960px-Mitsui_Shopping_Park_LaLaport_Bukit_Bintang_City_Centre_20260101_162722.jpg', author: 'Wiki Farazi', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Mitsui_Shopping_Park_LaLaport_Bukit_Bintang_City_Centre_20260101_162722.jpg' },
  },
  {
    // office and shops since 1977, Jalan Tun Tan Siew Sin; LRT Plaza Rakyat 410 m
    id: 'cahayaSuria', osm: 'way/1254987722', name: 'Cahaya Suria', aliases: ['Bangunan Cahaya Suria'],
    detail: 'Shops and offices, Jalan Tun Tan Siew Sin', kind: 'shopping', lat: 3.146182, lon: 101.699053,
    photo: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Rapid_Penang_academy_bus_near_Cahaya_Suria_%28230313%29.jpg/960px-Rapid_Penang_academy_bus_near_Cahaya_Suria_%28230313%29.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Rapid_Penang_academy_bus_near_Cahaya_Suria_(230313).jpg' },
  },
  {
    // shops on Jalan Tun Perak; LRT Masjid Jamek 390 m
    id: 'sinarKota', osm: 'way/24577043', name: 'Sinar Kota', aliases: ['Bangunan Sinar Kota'],
    detail: 'Shops, Jalan Tun Perak', kind: 'shopping', lat: 3.146467, lon: 101.698562,
    photo: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Lebuh_Pudu_Bus_Hub_%28TP%29_%28230127%29.jpg/960px-Lebuh_Pudu_Bus_Hub_%28TP%29_%28230127%29.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Lebuh_Pudu_Bus_Hub_(TP)_(230127).jpg' },
  },
]

export const FEATURED_OSM = new Set(FEATURED_PLACES.map((p) => p.osm))

// letters and digits only, lower case: "Lala-port" and "lalaport" are the same search
const fold = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()

// at most one letter wrong, missing or extra (for words of 5 letters or more): "lalapot", "pertma"
function nearWord(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0, j = 0, edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else { i++; j++ }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

// the featured places a search matches: the start of a name or one of its words, or a near miss on a whole word
export function matchFeatured(query: string): FeaturedPlace[] {
  const q = fold(query)
  if (q.length < 3) return []
  const words = q.split(' ')
  return FEATURED_PLACES.filter((p) => [p.name, ...p.aliases].some((n) => {
    const f = fold(n)
    if (f.startsWith(q) || f.split(' ').some((w) => w.startsWith(q)) || f.replace(/ /g, '').startsWith(q.replace(/ /g, ''))) return true
    const nw = f.split(' ')
    return words.every((w) => w.length >= 5 ? nw.some((x) => nearWord(w, x) || (x.length > w.length && nearWord(w, x.slice(0, w.length)))) : nw.some((x) => x.startsWith(w)))
  }))
}
