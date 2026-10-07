import { useLanguage } from '../hooks/useLanguage'
import BrandLogo from './BrandLogo'
import LineBadge from './LineBadge'
import WalkIcon from './WalkIcon'

// "Get the RONDA app" band. SiteLayout always renders it just above the footer.
// Store links come from env vars; until the app is published the badges show "Coming soon".
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
        <span className="text-[10px] tracking-wide text-white/80">{small}</span>
        <span className="text-lg font-semibold mt-1">{big}</span>
      </span>
    </>
  )
  const cls =
    'h-14 w-48 px-4 inline-flex items-center gap-3 rounded-xl bg-black/70 text-white border border-white/25 backdrop-blur-sm'
  return (
    <div className="flex items-center gap-4">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={`${cls} hover:bg-black/85 hover:border-white/40 transition`}>
          {body}
        </a>
      ) : (
        <span className={`${cls} opacity-90`} aria-disabled="true">
          {body}
        </span>
      )}
      {!href && <span className="text-xs font-medium text-[#E7C98F] uppercase tracking-wider">{soon}</span>}
    </div>
  )
}

// Phone mock-up with a simplified RONDA screen (illustration, not live data). It rises above the banner's
// top edge and is cut off at the bottom, like app banners on bank / airline sites.
function PhoneMockup() {
  const { t } = useLanguage()
  return (
    <div className="w-[230px] rounded-[2.4rem] bg-[#0b0f1a] p-2.5 shadow-2xl ring-1 ring-white/10" aria-hidden="true">
      <div className="relative rounded-[1.9rem] overflow-hidden bg-gray-50 h-[440px]">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-[#0b0f1a]" />
        <div className="bg-[#08333A] px-4 pt-10 pb-4">
          <BrandLogo tone="light" size="sm" />
          <div className="mt-3 rounded-xl bg-white px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full border-2 border-[#0E5C63]" />KL Sentral</div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-[#F27A5E]" />KLCC</div>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {[
            { lines: ['lrt-kelana-jaya'], time: '07:52 – 08:04', dur: t('durMin').replace('{m}', '12') },
            { lines: ['monorail', 'lrt-kelana-jaya'], time: '07:55 – 08:15', dur: t('durMin').replace('{m}', '20') },
          ].map((r) => (
            <div key={r.time} className="rounded-xl bg-white border border-gray-200 p-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-gray-900">{r.dur}</span>
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
        </div>
      </div>
    </div>
  )
}

function AppDownloadBanner() {
  const { t } = useLanguage()
  return (
    // Full width, and its bottom fades into the footer's navy so the two read as one block.
    // The phone sits outside the clipped background so it can rise above the banner.
    <section id="download" aria-labelledby="download-title" className="relative mt-24 text-white">
      <div className="absolute inset-0 overflow-hidden bg-[#08333A]">
        {/* KL skyline, darkened so the text reads */}
        <picture>
          <source srcSet="/Image/banner-kl.webp" type="image/webp" />
          <img src="/Image/banner-kl.jpg" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover object-[center_40%]" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-[#08333A]/95 via-[#08333A]/80 to-[#08333A]/60" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent to-[#0E5C63]" />
      </div>

      <div className="relative max-w-6xl mx-auto grid gap-8 md:grid-cols-[1.1fr_auto_auto] items-center px-4 sm:px-6">
        <div className="py-12">
          <h2 id="download-title" className="text-2xl sm:text-3xl font-bold leading-tight">
            {t('appBannerTitle')}
          </h2>
          <p className="mt-2 text-white/75 max-w-md">{t('appBannerText')}</p>
        </div>

        <div className="flex flex-col gap-3 pb-12 md:pb-0">
          <StoreBadge href={PLAY_URL} iconPath={PLAY_PATH} small="GET IT ON" big="Google Play" soon={t('soon')} />
          <StoreBadge href={APPSTORE_URL} iconPath={APPLE_PATH} small="Download on the" big="App Store" soon={t('soon')} />
        </div>

        {/* phone: its top pokes above the banner, its bottom is cut at the banner's bottom edge */}
        <div className="hidden md:block self-end -mt-20 h-[calc(100%+5rem)] max-h-[340px] overflow-hidden">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}

export default AppDownloadBanner
