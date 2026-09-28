import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '../hooks/useLanguage'
import BrandLogo from './BrandLogo'

// "Get the RONDA app" band. SiteLayout always renders it just above the footer.
// Store links come from env vars; until the app is published the badges show "Coming soon".
const PLAY_URL = import.meta.env.VITE_PLAY_STORE_URL as string | undefined
const APPSTORE_URL = import.meta.env.VITE_APP_STORE_URL as string | undefined
// What the QR code opens: a download page if set, otherwise this website
const DOWNLOAD_URL = (import.meta.env.VITE_APP_DOWNLOAD_URL as string | undefined) || window.location.origin

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

function AppDownloadBanner() {
  const { t } = useLanguage()
  return (
    // Full width, and its bottom fades into the footer's navy so the two read as one block
    <section id="download" aria-labelledby="download-title" className="mt-12">
      <div className="relative overflow-hidden bg-[#002472] text-white">
        {/* KL skyline, darkened so the text reads */}
        <picture>
          <source srcSet="/Image/banner-kl.webp" type="image/webp" />
          <img
            src="/Image/banner-kl.jpg"
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-[#001233]/95 via-[#001233]/80 to-[#001233]/60" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent to-[#002472]" />

        <div className="relative max-w-6xl mx-auto grid gap-8 md:grid-cols-[1.1fr_1fr_auto] items-center px-4 sm:px-6 pt-14 pb-12">
          <div>
            <BrandLogo tone="light" size="md" wordmark={false} />
            <h2 id="download-title" className="mt-4 text-2xl sm:text-3xl font-bold leading-tight">
              {t('appBannerTitle')}
            </h2>
            <p className="mt-2 text-white/75 max-w-md">{t('appBannerText')}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('downloadOn')}</h3>
            <div className="flex flex-col gap-3">
              <StoreBadge href={PLAY_URL} iconPath={PLAY_PATH} small="GET IT ON" big="Google Play" soon={t('soon')} />
              <StoreBadge href={APPSTORE_URL} iconPath={APPLE_PATH} small="Download on the" big="App Store" soon={t('soon')} />
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center">
            <span className="text-sm text-white/80 mb-2">{t('scanToDownload')}</span>
            <div className="bg-white p-2.5 rounded-xl">
              <QRCodeSVG value={DOWNLOAD_URL} size={120} fgColor="#002472" level="M" title={t('scanToDownload')} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadBanner
