// RONDA logo: the "R" mark (with the gold pin) and the RONDA wordmark, as sharp SVGs from /public/brand.
// `tone="light"` is the white version for dark blue backgrounds.

type Props = {
  tone?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  wordmark?: boolean
  wordmarkClassName?: string   // e.g. "hidden sm:block" to show only the mark on phones
  className?: string
}

// mark height / wordmark height in px
const SIZES = {
  sm: [32, 16],
  md: [40, 20],
  lg: [64, 30],
  xl: [96, 44],
} as const

function BrandLogo({ tone = 'dark', size = 'sm', wordmark = true, wordmarkClassName = '', className = '' }: Props) {
  const [markH, wordH] = SIZES[size]
  const suffix = tone === 'light' ? '-light' : ''
  return (
    <span dir="ltr" className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label="RONDA">
      <img src={`/brand/ronda-mark${suffix}.svg`} alt="" style={{ height: markH }} className="w-auto" />
      {wordmark && (
        <img src={`/brand/ronda-wordmark${suffix}.svg`} alt="" style={{ height: wordH }} className={`w-auto ${wordmarkClassName}`} />
      )}
    </span>
  )
}

export default BrandLogo
