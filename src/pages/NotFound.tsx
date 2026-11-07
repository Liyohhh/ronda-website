import { Link, useLocation } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import PageHero from '../components/PageHero'
import { useLanguage } from '../hooks/useLanguage'
import { buttonVariants } from '@/components/ui/button'
import { useNoIndex } from '../lib/seo'

// Any address the site doesn't know: say so, and offer the main ways back
function NotFound() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  useNoIndex()
  return (
    <SiteLayout>
      <PageHero eyebrow="404" title={t('nf_title')} center
        intro={<>{t('nf_text')} <span className="font-mono break-all" dir="ltr">{pathname}</span></>}>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonVariants({ variant: 'default', size: 'default' })}>{t('nf_home')}</Link>
          <Link to="/trails" className={buttonVariants({ variant: 'outline', size: 'default' })}>{t('trails')}</Link>
          <Link to="/help" className={buttonVariants({ variant: 'outline', size: 'default' })}>{t('helpCentre')}</Link>
        </div>
      </PageHero>
    </SiteLayout>
  )
}

export default NotFound
