import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import RequireAuth from './components/RequireAuth'
import ScrollToTop from './components/ScrollToTop'
import { SERVICES_ENABLED } from './data/serviceOptions'
import { LanguageProvider } from './i18n/LanguageProvider'
import { useLanguage } from './hooks/useLanguage'
import { trackOpen } from './services/analytics'

// Every page but Home loads when first visited, so the home page doesn't download the map engine and the
// dashboards (one 1.9 MB script before, 4 Oct 2026)
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Account = lazy(() => import('./pages/Account'))
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const Help = lazy(() => import('./pages/Help'))
const HelpCategory = lazy(() => import('./pages/HelpCategory'))
const Trails = lazy(() => import('./pages/Trails'))
const TrailDetail = lazy(() => import('./pages/TrailDetail'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const LiveMap = lazy(() => import('./pages/LiveMap'))
const Ronda300 = lazy(() => import('./pages/Ronda300'))
const Credits = lazy(() => import('./pages/Credits'))
const Hub = lazy(() => import('./pages/Hub'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoading() {
  const { t } = useLanguage()
  return <div className="min-h-screen flex items-center justify-center text-gray-500" role="status">{t('loading')}</div>
}

function App() {
  // counts this browser as active today (anonymous, once a day; services/analytics.ts)
  useEffect(() => { trackOpen() }, [])
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          {/* the old "My RONDA" page was removed (owner, 29 Oct 2026): links to it open the account page */}
          <Route path="/dashboard" element={<Navigate to="/account" replace />} />
          <Route path="/partner-dashboard" element={<RequireAuth role="merchant"><PartnerDashboard /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth role="admin"><Admin /></RequireAuth>} />
          <Route path="/help" element={<Help />} />
          <Route path="/help/:category" element={<HelpCategory />} />
          <Route path="/trails" element={<Trails />} />
          <Route path="/trails/:slug" element={<TrailDetail />} />
          <Route path="/about" element={<About />} />
          {SERVICES_ENABLED && <Route path="/services" element={<Services />} />}
          <Route path="/live" element={<LiveMap />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/ronda-300" element={<Ronda300 />} />
          <Route path="/hub/:slug" element={<Hub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App