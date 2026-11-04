import { useLanguage } from '../hooks/useLanguage'
import { Accent, Eyebrow } from './Motion'
import Icon from './Icon'

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
    'h-14 w-48 px-5 inline-flex items-center gap-3 rounded-full bg-white text-[#222D52] ring-1 ring-[#DCE3EC] shadow-[0_6px_16px_-10px_rgb(34_45_82/0.35)]'
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
      {!href && <span className="text-[11px] font-semibold text-[#2559B8] uppercase tracking-wider">{soon}</span>}
    </div>
  )
}

// Phone mock-up showing the app's home screen (a real screenshot of the app, phone status bar blurred out).
// Two small cards float beside it (gently moving; still for reduced motion).
function PhoneMockup() {
  return (
    <div className="w-[230px] rounded-[2.4rem] bg-[#0b0d16] p-2.5 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10" aria-hidden="true">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#EFF1F5]">
        <img src="/app/home-screen.webp" alt="" width={440} height={953} loading="lazy" decoding="async" className="block h-auto w-full" />
        <div className="absolute top-2 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b0d16]" />
      </div>
    </div>
  )
}

// "Get the RONDA app": a compact velvet band joined to the top of the footer, as in the earlier design: the words and
// store badges on the left; on the right the phone preview, whose top rises above the band and whose bottom is cut
// off where the band meets the footer, with two small cards floating beside it. Store links come from env vars;
// until the app is published the badges show "Coming soon".
function AppDownloadBanner() {
  const { t } = useLanguage()
  return (
    <section id="download" aria-labelledby="download-title" className="scroll-mt-24 relative mt-12 md:mt-20 bg-gradient-to-br from-[#E9F0F8] via-[#F3F6FA] to-[#F2F6FB] text-[#222D52]">
      {/* the glow stays inside the band; the phone may rise above it */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -end-32 top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(47_107_216/0.12),transparent)]" />
      </div>
      <div className="wrap relative grid items-center gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="py-10 md:py-12 text-center md:text-start">
          <Eyebrow center>{t('getApp')}</Eyebrow>
          <h2 id="download-title" className="mt-4 [text-wrap:balance] font-display text-[28px] md:text-[38px] leading-[1.1] font-semibold tracking-[-0.01em]">
            <Accent text={t('appBannerTitle')} />
          </h2>
          <p className="mt-3 max-w-md mx-auto md:mx-0 text-[15px] text-[#434C5C]">{t('appBannerText')}</p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-3">
            <StoreBadge href={PLAY_URL} iconPath={PLAY_PATH} small="GET IT ON" big="Google Play" soon={t('soon')} />
            <StoreBadge href={APPSTORE_URL} iconPath={APPLE_PATH} small="Download on the" big="App Store" soon={t('soon')} />
          </div>
        </div>

        {/* the phone: rises above the band, cut off at the band's bottom edge */}
        <div className="relative hidden md:flex justify-center self-end -mt-16" aria-hidden="true">
          <div className="h-[400px] overflow-hidden">
            <PhoneMockup />
          </div>
          <div className="float-y absolute hidden lg:block top-24 start-[calc(50%-275px)] rounded-2xl bg-white px-3.5 py-2.5 text-[#222D52] shadow-xl">
            <span className="block font-display text-xl font-semibold leading-none">6,500+</span>
            <span className="mt-1 block text-[11px] text-gray-600">{t('why_stops')}</span>
          </div>
          <div className="float-y absolute top-56 end-[calc(50%-175px)] xl:end-[calc(50%-290px)] hidden lg:flex items-center gap-2.5 rounded-2xl bg-[#222D52] px-3.5 py-2.5 text-white shadow-xl [animation-delay:-2.5s]">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15"><Icon name="hiking" size={18} /></span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{t('app_trailsCard')}</span>
              <span className="hidden text-[11px] text-white/70 xl:block">{t('app_trailsCardSub')}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadBanner
