import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RequireAuth from './components/RequireAuth'
import { LanguageProvider } from './i18n/LanguageProvider'
import { useLanguage } from './hooks/useLanguage'

// Every page but Home loads when first visited, so the home page doesn't download the map engine and the
// dashboards (one 1.9 MB script before, 4 Oct 2026)
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const Help = lazy(() => import('./pages/Help'))
const HelpCategory = lazy(() => import('./pages/HelpCategory'))
const Trails = lazy(() => import('./pages/Trails'))
const TrailDetail = lazy(() => import('./pages/TrailDetail'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const LiveMap = lazy(() => import('./pages/LiveMap'))
const Credits = lazy(() => import('./pages/Credits'))

function PageLoading() {
  const { t } = useLanguage()
  return <div className="min-h-screen flex items-center justify-center text-gray-500" role="status">{t('loading')}</div>
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
          <Route path="/partner-dashboard" element={<RequireAuth role="merchant"><PartnerDashboard /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth role="admin"><Admin /></RequireAuth>} />
          <Route path="/help" element={<Help />} />
          <Route path="/help/:category" element={<HelpCategory />} />
          <Route path="/trails" element={<Trails />} />
          <Route path="/trails/:slug" element={<TrailDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/live" element={<LiveMap />} />
          <Route path="/credits" element={<Credits />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App