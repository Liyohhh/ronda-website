import { useLanguage } from '../hooks/useLanguage'
import { LINES_BY_ID } from '../data/lines'
import { ECRL_SOURCES, ECRL_STATIONS } from '../data/ecrl'
import LineBadge from './LineBadge'

// About page: the ECRL as a line that is coming. Its 20 stations north to south on a drawn line (phase 1 solid,
// phase 2 dashed) with the starting fare from Gombak, the two phases with their dates, the fare rules, and the sources.
// Data and sources: src/data/ecrl.ts. Station names stay as they are in every language.
function EcrlCard() {
  const { t } = useLanguage()
  return (
    <section aria-labelledby="about-ecrl" className="mt-6 rounded-[32px] border border-gray-200 bg-gray-50 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h3 id="about-ecrl" className="text-xl md:text-2xl font-bold text-[#222D52]">{t('ecrlTitle')}</h3>
        <span className="inline-block rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#222D52]">
          {t('soon')}
        </span>
      </div>
      <p className="mt-2 text-gray-600 max-w-3xl">{t('ecrlIntro')}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-3 text-[15px] text-gray-800">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1 w-6 flex-shrink-0 rounded-full bg-[#222D52]" />
            {t('ecrlPhase1')}
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1 w-6 flex-shrink-0 rounded-full border-t-4 border-dashed border-gray-400" />
            {t('ecrlPhase2')}
          </li>
          <li className="rounded-2xl bg-gold-soft px-4 py-3 text-[#222D52]">
            <p className="font-medium">{t('ecrlFares')}</p>
            <p className="mt-1.5 text-sm">{t('ecrlFareNote')}</p>
            <p className="mt-1.5 text-sm">{t('ecrlConcession')}</p>
          </li>
        </ul>

        {/* the stations, north to south, on a drawn line */}
        <ol className="sm:columns-2 gap-8">
          {ECRL_STATIONS.map((s, i) => {
            const last = i === ECRL_STATIONS.length - 1
            const line = s.link ? LINES_BY_ID[s.link] : undefined
            return (
              <li key={s.name} className="relative break-inside-avoid ps-7 pb-3">
                {!last && (
                  <span
                    aria-hidden="true"
                    className={`absolute start-[5px] top-3 -bottom-0 w-0.5 ${s.phase === 1 && ECRL_STATIONS[i + 1].phase === 1 ? 'bg-[#222D52]' : 'border-s-2 border-dashed border-gray-400 w-0'}`}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`absolute start-0 top-1.5 h-3 w-3 rounded-full border-2 bg-white ${s.phase === 1 ? 'border-[#222D52]' : 'border-gray-400'} ${line ? 'ring-2 ring-gold' : ''}`}
                />
                <span className="text-[15px] font-medium text-gray-900">{s.name}</span>
                {s.fareRm !== undefined && <span className="ms-2 text-xs font-semibold text-[#222D52]">RM {s.fareRm}</span>}
                {line && (
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                    <LineBadge line={line} size={16} decorative />
                    {t('ecrlChange')} {line.name}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        {t('ecrlSources')}:{' '}
        {ECRL_SOURCES.map((s, i) => (
          <span key={s.url}>
            {i > 0 && ' · '}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#222D52]">{s.label}</a>
          </span>
        ))}
      </p>
    </section>
  )
}

export default EcrlCard
