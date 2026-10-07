import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { hasRole, useAuth, type Role } from '../hooks/useSession'
import { useLanguage } from '../hooks/useLanguage'
import SiteLayout from './SiteLayout'

// Page guard: signed out -> the login page (coming back here after signing in); signed in without the role ->
// a "no access" page. Only hides pages: whatever data they show must also be protected in the database (RLS).
type Props = { role?: Role; children: ReactNode }

function RequireAuth({ role, children }: Props) {
  const { session, loading } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (loading) return null
  if (!session) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  if (role && !hasRole(session, role))
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#5B1A3A]">{t('notAllowedTitle')}</h1>
          <p className="mt-3 text-gray-600">{t('notAllowedBody')}</p>
          <Link to="/" className="mt-6 inline-block rounded-full bg-[#5B1A3A] px-6 py-2.5 text-sm font-semibold text-white">
            {t('backToHome')}
          </Link>
        </div>
      </SiteLayout>
    )
  return <>{children}</>
}

export default RequireAuth
