# RONDA map

Every RONDA map (website now, Android and iPhone apps later) uses **one map file for Malaysia** that we host
ourselves, drawn with **MapLibre** (open source). No per-view bill, the same look everywhere, and no third-party
map rules beyond crediting OpenStreetMap.

| Piece | What | Licence |
|---|---|---|
| Map data | OpenStreetMap, via the Protomaps daily basemap build | ODbL: show "© OpenStreetMap contributors" (MapLibre shows it from the style) |
| Basemap style | `@protomaps/basemaps` (light flavour, labels in the site language) | BSD-3-Clause |
| Map file format | PMTiles: one file, read with HTTP range requests | BSD-3-Clause |
| Renderer | MapLibre GL JS | BSD-3-Clause |

## The map file: `malaysia.pmtiles`

Built on 4 Oct 2026 from the Protomaps build of 3 Oct 2026 (OpenStreetMap data of 3 Oct 2026, 04:00 UTC):
420 MB, zoom 0-15, two boxes: Peninsular Malaysia (with Singapore) and Malaysian Borneo (Sabah, Sarawak, with Brunei).

To build or refresh it (monthly is plenty), with the `pmtiles` tool from
<https://github.com/protomaps/go-pmtiles/releases>:

```bash
pmtiles extract https://build.protomaps.com/YYYYMMDD.pmtiles malaysia.pmtiles --region=malaysia.geojson
```

Pick `YYYYMMDD` from <https://maps.protomaps.com/builds>. `malaysia.geojson`:

```json
{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"MultiPolygon","coordinates":[
[[[99.5,1.1],[104.7,1.1],[104.7,6.8],[99.5,6.8],[99.5,1.1]]],
[[[109.5,0.8],[119.5,0.8],[119.5,7.5],[109.5,7.5],[109.5,0.8]]]]}}]}
```

## Hosting (production)

Upload `malaysia.pmtiles` to a **Cloudflare R2** bucket with public access on our domain (for example
`https://map.<domain>/malaysia.pmtiles`), allow CORS `GET` / `HEAD` from the site with the `Range` header, and set
in the website build:

```
VITE_MAP_PMTILES_URL=https://map.<domain>/malaysia.pmtiles
VITE_MAP_ASSETS_URL=https://map.<domain>/assets      # optional: label fonts and icons (default: Protomaps' public copy)
```

R2 free tier (Cloudflare pricing page, Oct 2026): 10 GB storage and 10 million reads a month, no egress fees;
then US$0.36 per million reads. One map view reads about 15-40 tiles.

## Local development

```bash
node scripts/serve-map.mjs path/to/malaysia.pmtiles      # serves http://localhost:8788/malaysia.pmtiles
```

and put `VITE_MAP_PMTILES_URL=http://localhost:8788/malaysia.pmtiles` in `.env.local` (not committed). Without it
the map falls back to OpenStreetMap's own tile server, which is fine for development and tests but **not allowed
for the public site** (OSM tile usage policy).
