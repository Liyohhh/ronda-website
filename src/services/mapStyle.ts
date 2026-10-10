import { layers, namedFlavor } from '@protomaps/basemaps'
import type { StyleSpecification } from 'maplibre-gl'

// The map behind every RONDA map: our own Malaysia map file (OpenStreetMap data, Protomaps basemap) stored as one
// PMTiles file, so there is no per-view bill and the website and the apps look the same.
//   VITE_MAP_PMTILES_URL   where malaysia.pmtiles is served (Cloudflare R2 in production)
//   VITE_MAP_ASSETS_URL    fonts and icons for the basemap labels (default: Protomaps' public assets)
// Without VITE_MAP_PMTILES_URL (local development only) the map falls back to OpenStreetMap's own tile server,
// which its usage policy does not allow for a public app.

export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
const DEFAULT_ASSETS = 'https://protomaps.github.io/basemaps-assets'

// basemap label language for the site language (Malay labels are the OSM default names)
export const labelLang = (lang: string) => (lang === 'zh' ? 'zh-Hans' : lang === 'ar' ? 'ar' : lang === 'ms' ? 'ms' : 'en')

export function mapStyle(lang: string, pmtilesUrl?: string, assetsUrl = DEFAULT_ASSETS): StyleSpecification {
  if (!pmtilesUrl) {
    return {
      version: 8,
      sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19, attribution: OSM_ATTRIBUTION } },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    }
  }
  return {
    version: 8,
    glyphs: `${assetsUrl}/fonts/{fontstack}/{range}.pbf`,
    sprite: `${assetsUrl}/sprites/v4/light`,
    sources: { protomaps: { type: 'vector', url: `pmtiles://${pmtilesUrl}`, attribution: OSM_ATTRIBUTION } },
    layers: layers('protomaps', namedFlavor('light'), { lang: labelLang(lang) }),
  }
}

export const mapConfig = () => ({
  pmtilesUrl: (import.meta.env.VITE_MAP_PMTILES_URL as string | undefined) || undefined,
  assetsUrl: (import.meta.env.VITE_MAP_ASSETS_URL as string | undefined) || DEFAULT_ASSETS,
})

// A quieter map for trail maps: soft paper ground, white roads, gentle parks and water, so the walking route and
// the stops stand out (same colours as the printable trail maps).
const SOFT = {
  background: '#F4F5F7', earth: '#F4F5F7', park_a: '#DDE8D6', park_b: '#D3E1CB', wood_a: '#D8E4CF', wood_b: '#CEDDC4', scrub_a: '#E2E9DB', scrub_b: '#DAE3D2',
  glacier: '#F4F5F7', sand: '#ECEAE3', beach: '#ECEAE3', zoo: '#E1E8D9', military: '#EBEBEA', hospital: '#F0E9E8', industrial: '#ECECEC', school: '#EFEDE8',
  pedestrian: '#EFF0F2', aerodrome: '#ECECEC', water: '#BFD5E0', buildings: '#E3E5EA',
  highway: '#FFFFFF', major: '#FFFFFF', minor_a: '#FBFBFC', minor_b: '#FBFBFC', other: '#F7F8F9', link: '#FFFFFF',
  highway_casing_late: '#DCDFE5', highway_casing_early: '#DCDFE5', major_casing_late: '#DCDFE5', major_casing_early: '#DCDFE5', minor_casing: '#E2E5EA',
  railway: '#C3C8D1', boundaries: '#C3C8D1', roads_label_minor: '#858C99', roads_label_major: '#737A87', roads_label_minor_halo: '#FBFBFC', roads_label_major_halo: '#FFFFFF',
  ocean_label: '#6A93A6', city_label: '#555C69', subplace_label: '#858C99', address_label: '#A0A6B0', state_label: '#979DA8', country_label: '#979DA8',
}

export function softMapStyle(lang: string, pmtilesUrl?: string, assetsUrl = DEFAULT_ASSETS): StyleSpecification {
  const base = mapStyle(lang, pmtilesUrl, assetsUrl)
  if (!pmtilesUrl) return base
  return { ...base, layers: layers('protomaps', { ...namedFlavor('light'), ...SOFT }, { lang: labelLang(lang) }) }
}
