import { describe, expect, it } from 'vitest'
import { labelLang, mapStyle, OSM_ATTRIBUTION } from './mapStyle'

describe('mapStyle', () => {
  it('our Malaysia map file: vector source through pmtiles://, OSM credit, label fonts', () => {
    const s = mapStyle('en', 'https://map.example/malaysia.pmtiles', 'https://assets.example')
    expect(s.sources.protomaps).toMatchObject({ type: 'vector', url: 'pmtiles://https://map.example/malaysia.pmtiles', attribution: OSM_ATTRIBUTION })
    expect(s.glyphs).toBe('https://assets.example/fonts/{fontstack}/{range}.pbf')
    expect(s.sprite).toBe('https://assets.example/sprites/v4/light')
    expect(s.layers.length).toBeGreaterThan(20)
    expect(s.layers.every((l) => !('source' in l) || l.source === 'protomaps')).toBe(true)
  })

  it('no map file configured (local development): plain OpenStreetMap tiles, still credited', () => {
    const s = mapStyle('en')
    expect(s.sources.osm).toMatchObject({ type: 'raster', attribution: OSM_ATTRIBUTION })
    expect(s.layers).toHaveLength(1)
  })

  it.each([
    ['en', 'en'],
    ['ms', 'ms'],
    ['zh', 'zh-Hans'],
    ['ar', 'ar'],
  ])('labels for %s use %s', (lang, want) => expect(labelLang(lang)).toBe(want))
})
