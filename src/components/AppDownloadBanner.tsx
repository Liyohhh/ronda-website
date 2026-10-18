import { useLanguage } from '../hooks/useLanguage'
import { Accent, Eyebrow } from './Motion'
import BrandLogo from './BrandLogo'
import LineBadge from './LineBadge'
import WalkIcon from './WalkIcon'

const PLAY_URL = import.meta.env.VITE_PLAY_STORE_URL as string | undefined
const APPSTORE_URL = import.meta.env.VITE_APP_STORE_URL as string | undefined

const PLAY_PATH =
  'M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z'
const APPLE_PATH =
  'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701'

function StoreBadge({ href, iconPath, small, big, soon }: { href?: string; iconPath: string; small: string; big: string; soon: string }) {
  const body = (
    <>
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d={iconPath} />
      </svg>
      <span className="flex flex-col leading-none text-start">
        <span className="text-[10px] tracking-wide text-gray-600">{small}</span>
        <span className="text-lg font-semibold mt-1">{big}</span>
      </span>
    </>
  )
  const cls =
    'h-14 w-48 px-5 inline-flex items-center gap-3 rounded-full bg-white text-[#222D52]'
  return (
    <div className="flex items-center gap-3">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={`${cls} hover:bg-gray-100 active:scale-95 transition`}>
          {body}
        </a>
      ) : (
        <span className={cls} aria-disabled="true">
          {body}
        </span>
      )}
      {!href && <span className="text-[11px] font-semibold text-gold-light uppercase tracking-wider">{soon}</span>}
    </div>
  )
}

// Phone mock-up with a simplified RONDA screen (an illustration, not live data): a planned trip with two options.
// Two small cards float beside it (gently moving; still for reduced motion).
function PhoneMockup() {
  const { t } = useLanguage()
  return (
    <div className="w-[240px] rounded-[2.6rem] bg-[#0b0d16] p-2.5 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10" aria-hidden="true">
      <div className="relative rounded-[2rem] overflow-hidden bg-[#FAF8F5] h-[470px]">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-[#0b0d16]" />
        <div className="bg-[#222D52] px-4 pt-10 pb-4">
          <BrandLogo tone="light" size="sm" />
          <div className="mt-3 rounded-xl bg-white px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] text-gray-600"><span className="w-2 h-2 rounded-full border-2 border-[#222D52]" />KL Sentral</div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600"><span className="w-2 h-2 rounded-full bg-gold" />KLCC</div>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {[
            { lines: ['lrt-kelana-jaya'], time: '07:52 – 08:04', dur: t('durMin').replace('{m}', '12'), best: true },
            { lines: ['monorail', 'lrt-kelana-jaya'], time: '07:55 – 08:15', dur: t('durMin').replace('{m}', '20'), best: false },
          ].map((r) => (
            <div key={r.time} className={`rounded-xl bg-white p-2.5 border ${r.best ? 'border-gold' : 'border-gray-200'}`}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#222D52]">{r.dur}</span>
                <span className="text-[9px] text-gray-500">{r.time}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <WalkIcon size={12} className="text-gray-500" />
                {r.lines.map((l) => (
                  <LineBadge key={l} line={l} size={18} decorative />
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-white border border-gray-200 p-2.5">
            <div className="h-2 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-2 w-16 rounded bg-gray-100" />
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-2.5">
            <div className="h-2 w-20 rounded bg-gray-200" />
            <div className="mt-2 h-2 w-28 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  )
}

// "Get the RONDA app": a velvet band at the top of the footer. The words and store badges on one side; on the other
// the phone preview rising out of a soft champagne glow, with two small cards floating beside it. Store links come
// from env vars; until the app is published the badges show "Coming soon".
function AppDownloadBanner() {
  const { t } = useLanguage()
  return (
    <section id="download" aria-labelledby="download-title" className="scroll-mt-24 relative overflow-hidden bg-[#222D52] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -end-40 top-1/2 -translate-y-1/2 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(210_182_138/0.28),transparent)]" />
      <div className="wrap relative grid items-center gap-12 py-20 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="text-center lg:text-start">
          <Eyebrow tone="dark" center>{t('getApp')}</Eyebrow>
          <h2 id="download-title" className="mt-5 max-w-xl mx-auto lg:mx-0 [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em]">
            <Accent text={t('appBannerTitle')} dark />
          </h2>
          <p className="mt-4 max-w-md mx-auto lg:mx-0 text-base md:text-lg text-white/80">{t('appBannerText')}</p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
            <StoreBadge href={PLAY_URL} iconPath={PLAY_PATH} small="GET IT ON" big="Google Play" soon={t('soon')} />
            <StoreBadge href={APPSTORE_URL} iconPath={APPLE_PATH} small="Download on the" big="App Store" soon={t('soon')} />
          </div>
        </div>

        <div className="relative hidden md:flex justify-center" aria-hidden="true">
          <PhoneMockup />
          {/* floating cards: the network in a number, and a line on the way */}
          <div className="float-y absolute top-16 start-[calc(50%-260px)] rounded-2xl bg-white px-4 py-3 text-[#222D52] shadow-xl">
            <span className="block font-display text-2xl font-semibold leading-none">6,500+</span>
            <span className="mt-1 block text-xs text-gray-600">{t('why_stops')}</span>
          </div>
          <div className="float-y absolute bottom-20 end-[calc(50%-270px)] flex items-center gap-2 rounded-2xl bg-gold px-4 py-3 text-[#222D52] shadow-xl [animation-delay:-2.5s]">
            <LineBadge line="mrt-kajang" size={22} decorative />
            <span className="text-sm font-semibold">{t('durMin').replace('{m}', '12')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadBanner
