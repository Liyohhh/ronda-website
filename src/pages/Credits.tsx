import { Link } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'

// Data sources and credits. Only licences confirmed at the source are named here. data.gov.my's terms of
// use could not be found on its site (checked 3 Oct 2026), so no licence is claimed for it: TODO confirm.
type Source = { name: string; url: string; licence?: { name: string; url: string } }
type Section = { title: TranslationKey; body?: TranslationKey; sources: Source[] }

const SECTIONS: Section[] = [
  {
    title: 'creditsTimetables', body: 'creditsTimetablesBody',
    sources: [{ name: 'data.gov.my, Government of Malaysia (GTFS Static and GTFS Realtime)', url: 'https://developer.data.gov.my/realtime-api/gtfs-static' }],
  },
  {
    title: 'creditsOperators', body: 'creditsOperatorsBody',
    sources: [
      { name: 'Prasarana Malaysia (MyRapid)', url: 'https://myrapid.com.my/' },
      { name: 'Keretapi Tanah Melayu (KTMB)', url: 'https://www.ktmb.com.my/' },
      { name: 'Express Rail Link (KLIA Ekspres, KLIA Transit)', url: 'https://www.kliaekspres.com/' },
    ],
  },
  {
    title: 'creditsMaps', body: 'creditsMapsBody',
    sources: [
      { name: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright', licence: { name: 'ODbL', url: 'https://opendatacommons.org/licenses/odbl/' } },
      { name: 'Protomaps basemap', url: 'https://protomaps.com/', licence: { name: 'BSD-3-Clause', url: 'https://github.com/protomaps/basemaps/blob/main/LICENSE.md' } },
      { name: 'Photon by komoot', url: 'https://photon.komoot.io/' },
    ],
  },
  {
    title: 'creditsSoftware',
    sources: [
      { name: 'MapLibre GL JS', url: 'https://maplibre.org/', licence: { name: 'BSD-3-Clause', url: 'https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt' } },
      { name: 'PMTiles (Protomaps)', url: 'https://github.com/protomaps/PMTiles', licence: { name: 'BSD-3-Clause', url: 'https://github.com/protomaps/PMTiles/blob/main/LICENSE' } },
      { name: 'Material Symbols and Material Icons (Google)', url: 'https://github.com/google/material-design-icons', licence: { name: 'Apache-2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0' } },
      { name: 'Cupertino Icons (Flutter)', url: 'https://github.com/flutter/packages/tree/main/third_party/packages/cupertino_icons', licence: { name: 'MIT', url: 'https://opensource.org/license/mit' } },
      { name: 'React, React Router, Supabase JS, Tailwind CSS', url: 'https://github.com/Liyohhh/ronda-website/blob/main/package.json', licence: { name: 'MIT', url: 'https://opensource.org/license/mit' } },
    ],
  },
]

function Credits() {
  const { t } = useLanguage()
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-[#8E3424]">{t('creditsTitle')}</h1>
        <p className="mt-3 text-gray-600">{t('creditsIntro')}</p>
        {SECTIONS.map((s) => (
          <section key={s.title} className="mt-8" aria-labelledby={`credits-${s.title}`}>
            <h2 id={`credits-${s.title}`} className="text-lg font-semibold text-[#8E3424]">{t(s.title)}</h2>
            {s.body && <p className="mt-1 text-sm text-gray-600">{t(s.body)}</p>}
            <ul className="mt-2 space-y-1 text-sm">
              {s.sources.map((src) => (
                <li key={src.name}>
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-[#8E3424] underline">{src.name}</a>
                  {src.licence && (
                    <>
                      {' · '}
                      <a href={src.licence.url} target="_blank" rel="noreferrer" className="text-gray-600 underline">{src.licence.name}</a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section className="mt-8" aria-labelledby="credits-photos">
          <h2 id="credits-photos" className="text-lg font-semibold text-[#8E3424]">{t('creditsPhotos')}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {t('creditsPhotosBody')} <Link to="/about#about-credits" className="text-[#8E3424] underline">/about</Link>
          </p>
        </section>
      </div>
    </SiteLayout>
  )
}

export default Credits
