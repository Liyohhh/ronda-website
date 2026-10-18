import { lazy, Suspense, type ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { CHAT_ENABLED } from '../services/chat'

// the assistant is loaded only when switched on (VITE_AI_CHAT=on), and then only after the page
const ChatWidget = lazy(() => import('./ChatWidget'))

// Page frame for the public site: header, the page's own content, then the footer (which opens with the app
// download call to action), whatever the page adds above it.
// darkEnd: the page's own last block is the dark band (Home), so the footer joins it without a gap
function SiteLayout({ children, subheader, darkEnd = false }: { children: ReactNode; subheader?: ReactNode; darkEnd?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {subheader}
      <main className="flex-1">{children}</main>
      <Footer flush={darkEnd} />
      {CHAT_ENABLED && (
        <Suspense fallback={null}>
          {/* room under the footer so the chat launcher never covers its last line */}
          <div className="h-20 bg-white" aria-hidden="true" />
          <ChatWidget />
        </Suspense>
      )}
    </div>
  )
}

export default SiteLayout
