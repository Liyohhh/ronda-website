import { Link, useLocation } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import { useLanguage } from '../hooks/useLanguage'

// Any address the site doesn't know: say so, and offer the main ways back
function NotFound() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <p className="text-sm font-semibold text-[#2563EB]">404</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-[#1F2F5C]">{t('nf_title')}</h1>
        <p className="mt-4 text-gray-600">
          {t('nf_text')} <span className="font-mono text-gray-800 break-all" dir="ltr">{pathname}</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-[#1F2F5C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2C3F73]">{t('nf_home')}</Link>
          <Link to="/trails" className="rounded-full border border-[#1F2F5C] px-6 py-3 text-sm font-semibold text-[#1F2F5C] hover:bg-[#1F2F5C]/5">{t('trails')}</Link>
          <Link to="/help" className="rounded-full border border-[#1F2F5C] px-6 py-3 text-sm font-semibold text-[#1F2F5C] hover:bg-[#1F2F5C]/5">{t('helpCentre')}</Link>
        </div>
      </div>
    </SiteLayout>
  )
}

export default NotFound
