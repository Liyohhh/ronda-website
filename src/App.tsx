import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import UserDashboard from './pages/UserDashboard'
import PartnerDashboard from './pages/PartnerDashboard'
import Admin from './pages/Admin'
import Help from './pages/Help'
import HelpCategory from './pages/HelpCategory'
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
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App