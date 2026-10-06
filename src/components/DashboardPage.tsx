import { Link } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import Icon from './Icon'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import type { IconName } from '../data/icons'

// The signed-in pages (rider, partner, admin): a title, what is ready now as working links, and what is coming
export type DashTile = { label: TranslationKey; text: TranslationKey; icon: IconName; to?: string }

function DashboardPage({ title, intro, tiles }: { title: TranslationKey; intro: TranslationKey; tiles: DashTile[] }) {
  const { t } = useLanguage()
  return (
    <SiteLayout>
      <section className="bg-[#002472] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold">{t(title)}</h1>
          <p className="mt-2 max-w-2xl text-white/80">{t(intro)}</p>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((d) => {
            const body = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002472]/10 text-[#002472]" aria-hidden="true">
                  <Icon name={d.icon} size={22} />
                </span>
                <span className="mt-3 flex items-center gap-2 font-semibold text-gray-900">
                  {t(d.label)}
                  {!d.to && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-600">{t('soon')}</span>}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{t(d.text)}</span>
              </>
            )
            return (
              <li key={d.label}>
                {d.to ? (
                  <Link to={d.to} className="block h-full rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#002472]/40 hover:shadow-sm">{body}</Link>
                ) : (
                  <div className="h-full rounded-2xl border border-dashed border-gray-300 bg-white/60 p-5">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </SiteLayout>
  )
}

export default DashboardPage
