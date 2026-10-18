import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { HelpCategory } from '../data/helpCategories'
import SiteLayout from './SiteLayout'
import Icon from './Icon'
import type { IconName } from '../data/icons'

// Help Centre pages: the normal site frame plus a slim Help Centre bar under the header
export function HelpLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <SiteLayout
      subheader={
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="wrap h-11 flex items-center justify-between text-sm">
            <Link to="/help" className="font-semibold text-[#222D52]">
              RONDA {t('helpCentre')}
            </Link>
            <Link to="/help/policies" className="font-medium text-gray-600 hover:text-[#222D52]">
              {t('policies')}
            </Link>
          </div>
        </div>
      }
    >
      {children}
    </SiteLayout>
  )
}

export function CategoryIcon({ icon }: { icon: HelpCategory['icon'] }) {
  const names: Record<HelpCategory['icon'], IconName> = {
    payments: 'creditCardOutline',
    general: 'infoOutline',
    policies: 'descriptionOutline',
  }
  return (
    <span className="w-10 h-10 rounded-full bg-[#222D52]/10 text-[#222D52] flex items-center justify-center flex-shrink-0">
      <Icon name={names[icon]} size={20} />
    </span>
  )
}
