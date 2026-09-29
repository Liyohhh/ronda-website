import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import UserDashboard from './pages/UserDashboard'
import PartnerDashboard from './pages/PartnerDashboard'
import Admin from './pages/Admin'
import Help from './pages/Help'
import HelpCategory from './pages/HelpCategory'
import Trails from './pages/Trails'
import TrailDetail from './pages/TrailDetail'
import About from './pages/About'
import Services from './pages/Services'
import { LanguageProvider } from './i18n/LanguageProvider'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/help" element={<Help />} />
          <Route path="/help/:category" element={<HelpCategory />} />
          <Route path="/trails" element={<Trails />} />
          <Route path="/trails/:slug" element={<TrailDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App