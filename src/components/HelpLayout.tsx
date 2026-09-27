import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { HelpCategory } from '../data/helpCategories'

export function HelpLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
            <link rel="icon" type="image/jpeg" href="/Image/Logo.jpg" />
              <span className="font-bold text-lg text-[#002472]">RONDA</span>
            </Link>
            <span className="w-px h-5 bg-gray-300" />
            <Link to="/help" className="text-[#002472]">
              RONDA {t('helpCentre')}
            </Link>
          </div>
          <Link to="/help/policies" className="text-sm font-medium text-gray-700 hover:text-[#002472]">
            {t('policies')}
          </Link>
        </div>
      </header>
      {children}
    </div>
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
