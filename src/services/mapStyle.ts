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
