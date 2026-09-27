import { useMemo } from 'react'
import { LINES_BY_ID, lineBadgeSvg, type Line } from '../data/lines'

// Coloured line icon (official line colour + vehicle glyph), e.g. <LineBadge line="mrt-kajang" />.
// Artwork comes from src/data/lines.ts; the same badges are exported to public/lines/*.svg.
type Props = {
  line: string | Line
  size?: number // px
  className?: string
  decorative?: boolean // true when the line name is already shown next to it
}

function LineBadge({ line, size = 32, className = '', decorative = false }: Props) {
  const l = typeof line === 'string' ? LINES_BY_ID[line] : line
  // markup is built from our own static data, not user input
  const html = useMemo(() => (l ? lineBadgeSvg(l, { title: !decorative }) : ''), [l, decorative])
  if (!l) return null
  return (
    <span
      className={`inline-block flex-shrink-0 [&>svg]:w-full [&>svg]:h-full ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={decorative || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default LineBadge
