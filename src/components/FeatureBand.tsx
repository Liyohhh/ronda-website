import type { ReactNode } from 'react'

// The last section of the home page before the footer: plain white, so the navy app band of the footer follows it.
function FeatureBand({ children }: { children: ReactNode }) {
  return <div className="relative bg-white">{children}</div>
}

export default FeatureBand
