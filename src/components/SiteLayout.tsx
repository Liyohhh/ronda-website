import { lazy, Suspense, type ReactNode } from 'react'
import Header from './Header'
import AppDownloadBanner from './AppDownloadBanner'
import Footer from './Footer'
import { CHAT_ENABLED } from '../services/chat'

// the assistant is loaded only when switched on (VITE_AI_CHAT=on), and then only after the page
const ChatWidget = lazy(() => import('./ChatWidget'))

// Page frame for the public site: header, the page's own content, then the app download
// banner and the footer. The banner is always second-last, whatever the page adds above it.
function SiteLayout({ children, subheader }: { children: ReactNode; subheader?: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {subheader}
      <main className="flex-1">{children}</main>
      <AppDownloadBanner />
      <Footer />
      {CHAT_ENABLED && (
        <Suspense fallback={null}>
          {/* room under the footer so the chat launcher never covers its last line */}
          <div className="h-20 bg-[#08333A]" aria-hidden="true" />
          <ChatWidget />
        </Suspense>
      )}
    </div>
  )
}

export default SiteLayout
