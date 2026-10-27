import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import PageHero from './PageHero'
import Icon from './Icon'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import type { IconName } from '../data/icons'

// The signed-in pages (rider, partner, admin): a title, what is ready now as working links, and what is coming;
// a page can add its own tools below the tiles
export type DashTile = { label: TranslationKey; text: TranslationKey; icon: IconName; to?: string }

function DashboardPage({ title, intro, tiles, children }: { title: TranslationKey; intro: TranslationKey; tiles: DashTile[]; children?: ReactNode }) {
  const { t } = useLanguage()
  return (
    <SiteLayout>
      <PageHero title={t(title)} intro={t(intro)} />
      <div className="wrap py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((d) => {
            const body = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#222D52]/10 text-[#222D52]" aria-hidden="true">
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
                  <Link to={d.to} className="block h-full rounded-[24px] border border-gray-200 bg-gray-50 p-6 hover:border-[#222D52]/40 hover:bg-white transition-colors">{body}</Link>
                ) : (
                  <div className="h-full rounded-[24px] border border-dashed border-gray-300 bg-white p-6">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
        {children}
      </div>
    </SiteLayout>
  )
}

export default DashboardPage
