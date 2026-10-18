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

// Small round icon plus a bordered pill: the label above a section title
export function Eyebrow({ icon, children, tone = 'light' }: { icon: ReactNode; children: ReactNode; tone?: 'light' | 'dark' }) {
  const ring = tone === 'dark' ? 'border-white/15 bg-white/5 text-white' : 'border-gray-200 bg-white text-[#14213D]'
  const dot = tone === 'dark' ? 'border-gold/40 bg-gold text-[#14213D]' : 'border-[#14213D] bg-[#14213D] text-gold'
  return (
    <div className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center ${dot}`}>{icon}</span>
      <span className={`px-4 py-2 sm:py-2.5 rounded-full border text-sm font-medium ${ring}`}>{children}</span>
    </div>
  )
}
