import type { ReactNode } from 'react'
import Header from './Header'
import AppDownloadBanner from './AppDownloadBanner'
import Footer from './Footer'

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
    </div>
  )
}

export default SiteLayout
