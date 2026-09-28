import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'

// Feature tiles. `soon` = planned, labelled "Coming soon" so nothing is oversold.
const FEATURES: { key: TranslationKey; icon: string; soon?: boolean }[] = [
  { key: 'feat_directions', icon: 'M5 19l4-14 4 9 3-5 3 10M3 19h18' },
  { key: 'feat_places', icon: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { key: 'feat_lines', icon: 'M6 4h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4 11h16M8 21l2-4M16 21l-2-4' },
  { key: 'feat_fares', icon: 'M3 7h18v10H3zM3 11h18M7 15h3' },
  { key: 'feat_trails', icon: 'M4 20c3-6 6-2 8-8s5-4 8-8M4 20h4M16 4h4v4' },
  { key: 'feat_airport', icon: 'M10.5 20l1.5-6-6 2.5v-2l6-4V5a1.5 1.5 0 0 1 3 0v5.5l6 4v2l-6-2.5 1.5 6-3-1z' },
  { key: 'feat_languages', icon: 'M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 4-3 7-6 8M13 21l4-10 4 10M14.5 17h5' },
  { key: 'feat_ronda300', icon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 12h.01', soon: true },
  { key: 'feat_saved', icon: 'M6 3h12v18l-6-4-6 4z', soon: true },
  { key: 'feat_alerts', icon: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4', soon: true },
]

function FeatureGrid() {
  const { t } = useLanguage()
  return (
    <section aria-labelledby="features-title" className="mt-8 bg-[#e3ebfa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 id="features-title" className="text-2xl md:text-3xl font-bold text-[#002472]">
          {t('featuresTitle')}
        </h2>
        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {FEATURES.map((f) => (
            <li key={f.key} className="relative bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center text-center gap-3">
              {f.soon && (
                <span className="absolute top-2 end-2 text-[10px] font-bold uppercase tracking-wide text-[#8a6a2a] bg-[#C9A45C]/15 px-2 py-0.5 rounded-full">
                  {t('soon')}
                </span>
              )}
              <span className="w-14 h-14 rounded-2xl bg-[#002472]/[0.07] text-[#002472] flex items-center justify-center" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </span>
              <span className={`text-sm font-semibold leading-snug ${f.soon ? 'text-gray-500' : 'text-gray-900'}`}>{t(f.key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default FeatureGrid
