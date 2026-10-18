import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'

// Scroll motion for the Blaze layout: sections fade up as they come into view, and big headings darken word by word
// while the page scrolls. Both show the finished state straight away for people who prefer reduced motion, and where
// IntersectionObserver is missing (old browsers, tests).

const canObserve = typeof window !== 'undefined' && 'IntersectionObserver' in window
// the hidden starting state only applies once this script runs (index.css: .js-reveal .reveal)
if (canObserve) document.documentElement.classList.add('js-reveal')

// one observer for every Reveal on the page
let observer: IntersectionObserver | null = null
function observe(el: Element) {
  if (!canObserve) return () => {}
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-visible')
        observer?.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -4% 0px', threshold: 0.05 },
  )
  observer.observe(el)
  return () => observer?.unobserve(el)
}

export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}: {
  as?: ElementType
  delay?: number
  className?: string
  children: ReactNode
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => (ref.current ? observe(ref.current) : undefined), [])
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}s` } as CSSProperties} {...rest}>
      {children}
    </Tag>
  )
}

// words of a heading, in any of the four languages (Chinese has no spaces: Intl.Segmenter finds its words);
// punctuation stays with the word before it, spaces stay separate
function words(text: string): string[] {
  type Seg = { segment: string; isWordLike?: boolean }
  const Segmenter = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment(s: string): Iterable<Seg> } }).Segmenter
  if (!Segmenter) return text.split(/(\s+)/)
  const out: string[] = []
  for (const s of new Segmenter(undefined, { granularity: 'word' }).segment(text)) {
    const last = out.length - 1
    if (!s.isWordLike && s.segment.trim() && last >= 0 && out[last].trim()) out[last] += s.segment
    else out.push(s.segment)
  }
  return out
}

// Heading text whose words go from grey to navy as it scrolls up the screen, one after another and each one fading
// smoothly. Scrolling only updates one CSS variable (--p, 0 to 1) on the heading; each word works out its own colour
// from it in CSS (index.css .word-fill), so React does not re-render while scrolling. The grey still reads as large
// text (3:1 or more on white), so the heading is legible before it fills.
export function WordFill({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // before the first paint, so the heading never flashes filled and then empties
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (!canObserve || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1')
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      // starts filling when the heading's top passes 90% of the screen, done by 40%
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.5)))
      el.style.setProperty('--p', p.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  const parts = words(text)
  const n = parts.filter((p) => p.trim()).length
  let seen = 0
  return (
    <span ref={ref} className={`word-fill ${className}`} style={{ '--n': n, '--p': 1 } as CSSProperties}>
      {parts.map((p, i) => {
        if (!p.trim()) return p
        return (
          <span key={i} style={{ '--i': seen++ } as CSSProperties}>
            {p}
          </span>
        )
      })}
    </span>
  )
}

// The label above a section title: small gold capitals with a thin gold line before it (and after it when centred)
// tone: light (deep gold text), dark (champagne on navy) or onTeal (white text, champagne lines, on the teal band)
export function Eyebrow({ children, tone = 'light', center = false }: { children: ReactNode; tone?: 'light' | 'dark' | 'onTeal'; center?: boolean }) {
  const line = <span aria-hidden="true" className={`h-px w-7 ${tone === 'light' ? 'bg-gold-deep/60' : 'bg-gold-light/80'}`} />
  return (
    <span className={`inline-flex items-center gap-3 text-[12.5px] font-bold uppercase tracking-[0.26em] ${tone === 'dark' ? 'text-gold-light' : tone === 'onTeal' ? 'text-white' : 'text-gold-deep'}`}>
      {line}
      {children}
      {center && line}
    </span>
  )
}

// A heading's text with its last word as the italic gold accent (works for spaced languages; Chinese gets its last
// word from Intl.Segmenter, like WordFill)
export function Accent({ text, dark = false }: { text: string; dark?: boolean }) {
  const parts = words(text)
  let last = parts.length - 1
  while (last > 0 && !parts[last].trim()) last--
  if (last <= 0) return <>{text}</>
  return (
    <>
      {parts.slice(0, last).join('')}
      <span className={`accent-word pe-[0.06em]${dark ? ' on-dark' : ''}`}>{parts[last]}</span>
      {parts.slice(last + 1).join('')}
    </>
  )
}
