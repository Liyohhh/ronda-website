import type { ReactNode } from 'react'
import { LINES } from '../data/lines'

const STRIPE = [...new Set(LINES.map((l) => l.color))]

// Dark band on the home page (Blaze layout): flat deep navy under a stripe of the official line colours, so it reads
// as one block with the footer below it.
function FeatureBand({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-24 md:mt-32 bg-[#14213D] text-white selection:bg-gold selection:text-[#14213D]">
      {/* a thin stripe of every official line colour where the band starts */}
      <div className="flex h-1.5" aria-hidden="true">
        {STRIPE.map((c) => <span key={c} className="flex-1" style={{ backgroundColor: c }} />)}
      </div>
      {children}
    </div>
  )
}

export default FeatureBand
