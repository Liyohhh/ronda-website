import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import ServiceAlertsAdmin from '../components/ServiceAlertsAdmin'
import AdminStats from '../components/AdminStats'
import Icon from '../components/Icon'
import { useLanguage } from '../hooks/useLanguage'
import { useSession } from '../hooks/useSession'
import { signOut } from '../services/auth'
import type { IconName } from '../data/icons'
import type { TranslationKey } from '../i18n/translations'

// /admin (admin role only), laid out like a dashboard app: a side menu on wide screens (the parts of the page, quick
// links to what riders see, the signed-in admin with profile and sign out), a pill menu instead on phones, then the
// overview band and the dashboard (services/adminStats.ts; the app's admin screen shows the same), then the
// operator service alerts editor.
const JUMPS: [string, TranslationKey, IconName][] = [
  ['adm-top', 'adm_navOverview', 'spaceDashboardOutline'], ['adm-users', 'adm_navUsers', 'personOutline'], ['adm-trips', 'adm_navTrips', 'routeOutline'],
  ['adm-places', 'adm_navPlaces', 'mapOutline'], ['adm-ops', 'adm_navData', 'devices'], ['adm-alerts-editor', 'adm_navAlerts', 'notificationsOutline'],
]
const LINKS: { label: TranslationKey; text: TranslationKey; icon: IconName; to: string }[] = [
  { label: 'dash_live', text: 'dash_liveText', icon: 'train', to: '/live' },
  { label: 'dash_trails', text: 'dash_trailsText', icon: 'hiking', to: '/trails' },
  { label: 'dash_credits', text: 'dash_creditsText', icon: 'descriptionOutline', to: '/credits' },
]

function Admin() {
  const { t } = useLanguage()
  const session = useSession()
  const navigate = useNavigate()
  const [active, setActive] = useState('adm-top')
  const fullName = ((session?.user.user_metadata?.full_name as string | undefined) ?? '').trim()
  const name = fullName.split(/\s+/)[0]
  const initials = (fullName || session?.user.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kuala_Lumpur' }))
  const greeting = t(hour < 12 ? 'adm_morning' : hour < 18 ? 'adm_afternoon' : 'adm_evening')
  const sideLabel = 'px-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#8A93A2]'

  return (
    <SiteLayout>
      <div className="bg-[#F5F7FA]">
        <div className="wrap gap-6 py-6 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:py-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col rounded-[18px] border border-[#E6EBF2] bg-white p-4">
              <p className={sideLabel}>{t('adm_sideDashboard')}</p>
              <nav aria-label={t('dash_adminTitle')} className="mt-2 space-y-0.5">
                {JUMPS.map(([id, k, icon]) => (
                  <a key={id} href={`#${id}`} onClick={() => setActive(id)} aria-current={active === id ? 'location' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BD8] ${active === id ? 'bg-[#EAF1FD] text-[#2F6BD8]' : 'text-[#434C5C] hover:bg-[#F2F6FB]'}`}>
                    <Icon name={icon} size={19} />{t(k)}
                  </a>
                ))}
              </nav>
              <p className={`${sideLabel} mt-6`}>{t('adm_sidePages')}</p>
              <ul className="mt-2 space-y-0.5">
                {LINKS.map((l) => (
                  <li key={l.to}><Link to={l.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#434C5C] hover:bg-[#F2F6FB]"><Icon name={l.icon} size={19} />{t(l.label)}</Link></li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl bg-[#F2F6FB] p-3">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#222D52] text-[13px] font-bold text-white">{initials}</span>
                  <span className="min-w-0"><b className="block truncate text-[14px] text-[#222D52]">{fullName || session?.user.email}</b><span className="text-[12px] text-[#5B6576]">{t('adm_roleAdmin')}</span></span>
                </div>
                <div className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-1.5 whitespace-nowrap text-[13px] font-semibold text-[#434C5C]">
                  <Link to="/account" className="flex items-center gap-1.5 hover:text-[#2F6BD8]"><Icon name="settingsOutline" size={17} />{t('accountProfile')}</Link>
                  <button type="button" onClick={async () => { await signOut(); navigate('/') }} className="flex items-center gap-1.5 hover:text-[#2F6BD8]"><Icon name="logout" size={17} />{t('signOut')}</button>
                </div>
              </div>
            </div>
          </aside>

          <div id="adm-top" className="min-w-0 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-extrabold leading-tight text-[#222D52] sm:text-[32px]">{greeting}{name && <>, <span className="text-[#2F6BD8]">{name}</span></>}</h1>
                <p className="mt-1 text-[#5B6576]">{t('dash_adminIntro')}</p>
              </div>
              <span className="rounded-full border border-[#DEE5EE] bg-white px-4 py-2 text-[14px] font-semibold text-[#222D52]">{t('adm_last30')}</span>
            </div>
            <nav aria-label={t('dash_adminTitle')} className="mt-5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden">
              {JUMPS.map(([id, k]) => (
                <a key={id} href={`#${id}`} onClick={() => setActive(id)} className={`shrink-0 rounded-full px-5 py-2 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BD8] ${active === id ? 'bg-[#222D52] text-white' : 'bg-white text-[#222D52] hover:bg-[#E3E9F1]'}`}>{t(k)}</a>
              ))}
            </nav>

            <div className="mt-6"><AdminStats /></div>

            <ul className="mt-6 grid gap-4 sm:grid-cols-3 lg:hidden">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="flex h-full items-start gap-3 rounded-[18px] border border-[#E6EBF2] bg-white p-5 transition-colors hover:bg-[#F8FAFD]">
                    <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F2F6FB] text-[#222D52]"><Icon name={l.icon} size={20} /></span>
                    <span><b className="block text-[#222D52]">{t(l.label)}</b><span className="text-sm text-[#5B6576]">{t(l.text)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>

            <div id="adm-alerts-editor" className="mt-6 scroll-mt-24 rounded-[18px] border border-[#E6EBF2] bg-white p-5 sm:p-6"><ServiceAlertsAdmin /></div>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

export default Admin
