import { Link } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import ServiceAlertsAdmin from '../components/ServiceAlertsAdmin'
import AdminStats from '../components/AdminStats'
import Icon from '../components/Icon'
import { useLanguage } from '../hooks/useLanguage'
import { useSession } from '../hooks/useSession'
import type { IconName } from '../data/icons'
import type { TranslationKey } from '../i18n/translations'

// /admin (admin role only): a greeting and a pill menu that jumps to each part, the dashboard (services/adminStats.ts;
// the app's admin screen shows the same), quick links to what riders see, then the operator service alerts editor.
const JUMPS: [string, TranslationKey][] = [['adm-top', 'adm_navOverview'], ['adm-users', 'adm_navUsers'], ['adm-trips', 'adm_navTrips'], ['adm-places', 'adm_navPlaces'], ['adm-alerts-editor', 'adm_navAlerts']]
const LINKS: { label: TranslationKey; text: TranslationKey; icon: IconName; to: string }[] = [
  { label: 'dash_live', text: 'dash_liveText', icon: 'train', to: '/live' },
  { label: 'dash_trails', text: 'dash_trailsText', icon: 'hiking', to: '/trails' },
  { label: 'dash_credits', text: 'dash_creditsText', icon: 'descriptionOutline', to: '/credits' },
]

function Admin() {
  const { t } = useLanguage()
  const session = useSession()
  const name = ((session?.user.user_metadata?.full_name as string | undefined) ?? '').trim().split(/\s+/)[0]
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kuala_Lumpur' }))
  const greeting = t(hour < 12 ? 'adm_morning' : hour < 18 ? 'adm_afternoon' : 'adm_evening')

  return (
    <SiteLayout>
      <div className="bg-[#F2F6FB]">
        <div id="adm-top" className="wrap scroll-mt-24 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-extrabold leading-tight text-[#222D52] sm:text-[34px]">{greeting}{name && <>, <span className="text-[#2559B8]">{name}</span></>}</h1>
              <p className="mt-1 text-[#5B6576]">{t('dash_adminIntro')}</p>
            </div>
            <span className="rounded-full border border-[#DEE5EE] bg-white px-4 py-2 text-[14px] font-semibold text-[#222D52]">{t('adm_last30')}</span>
          </div>
          <nav aria-label={t('dash_adminTitle')} className="mt-5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {JUMPS.map(([id, k], i) => (
              <a key={id} href={`#${id}`} className={`shrink-0 rounded-full px-5 py-2 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BD8] ${i === 0 ? 'bg-[#222D52] text-white' : 'bg-white text-[#222D52] hover:bg-[#E3E9F1]'}`}>{t(k)}</a>
            ))}
          </nav>

          <div className="mt-6"><AdminStats /></div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="flex h-full items-start gap-3 rounded-[22px] bg-white p-5 transition-colors hover:bg-[#F8FAFD]">
                  <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F2F6FB] text-[#222D52]"><Icon name={l.icon} size={20} /></span>
                  <span><b className="block text-[#222D52]">{t(l.label)}</b><span className="text-sm text-[#5B6576]">{t(l.text)}</span></span>
                </Link>
              </li>
            ))}
          </ul>

          <div id="adm-alerts-editor" className="mt-8 scroll-mt-24 rounded-[22px] bg-white p-5 sm:p-6"><ServiceAlertsAdmin /></div>
        </div>
      </div>
    </SiteLayout>
  )
}

export default Admin
