import { Link, useLocation } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import PageHero from '../components/PageHero'
import { useLanguage } from '../hooks/useLanguage'

// Any address the site doesn't know: say so, and offer the main ways back
function NotFound() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  return (
    <SiteLayout>
      <PageHero eyebrow="404" title={t('nf_title')} center
        intro={<>{t('nf_text')} <span className="font-mono break-all" dir="ltr">{pathname}</span></>}>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#222D52] hover:bg-gold-hover">{t('nf_home')}</Link>
          <Link to="/trails" className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-[#222D52]">{t('trails')}</Link>
          <Link to="/help" className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-[#222D52]">{t('helpCentre')}</Link>
        </div>
      </PageHero>
    </SiteLayout>
  )
}

export default NotFound
