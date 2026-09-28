// RONDA logo: the "R" mark (with the gold pin) and the RONDA wordmark, as sharp SVGs from /public/brand.
// `tone="light"` is the white version for dark blue backgrounds.

type Props = {
  tone?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  wordmark?: boolean
  wordmarkClassName?: string   // e.g. "hidden sm:block" to show only the mark on phones
  className?: string
}

// width / height of the traced SVGs (viewBox), so each image gets a fixed size and can't collapse
const MARK_RATIO = 1788 / 1734
const WORD_RATIO = 3936 / 666

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
    <span dir="ltr" className={`inline-flex items-center gap-2 flex-shrink-0 ${className}`} role="img" aria-label="RONDA">
      <img src={`/brand/ronda-mark${suffix}.svg`} alt="" style={{ height: markH, width: Math.round(markH * MARK_RATIO) }} className="max-w-none flex-shrink-0" />
      {wordmark && (
        <img src={`/brand/ronda-wordmark${suffix}.svg`} alt="" style={{ height: wordH, width: Math.round(wordH * WORD_RATIO) }} className={`max-w-none flex-shrink-0 ${wordmarkClassName}`} />
      )}
    </span>
  )
}

export default BrandLogo
