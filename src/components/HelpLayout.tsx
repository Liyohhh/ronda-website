import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { HelpCategory } from '../data/helpCategories'
import SiteLayout from './SiteLayout'

// Help Centre pages: the normal site frame plus a slim Help Centre bar under the header
export function HelpLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <SiteLayout
      subheader={
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between text-sm">
            <Link to="/help" className="font-semibold text-[#002472]">
              RONDA {t('helpCentre')}
            </Link>
            <Link to="/help/policies" className="font-medium text-gray-600 hover:text-[#002472]">
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
  const paths: Record<HelpCategory['icon'], ReactNode> = {
    payments: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    refunds: (
      <>
        <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
        <path d="M18 3v4h-4M6 21v-4h4" />
      </>
    ),
    general: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <circle cx="12" cy="8" r="0.6" fill="currentColor" />
      </>
    ),
    policies: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h7M9 16h7" />
      </>
    ),
  }
  return (
    <span className="w-10 h-10 rounded-full bg-[#002472]/10 text-[#002472] flex items-center justify-center flex-shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[icon]}
      </svg>
    </span>
  )
}
