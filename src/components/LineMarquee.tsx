import { useLanguage } from '../hooks/useLanguage'
import { LINES, type Line } from '../data/lines'
import BrandLogo from './BrandLogo'
import LineBadge from './LineBadge'
import { Reveal } from './Motion'

// Home band between Promotions and "Why RONDA?" (Blaze consultant strip): a small RONDA card with the promise in
// quotes, then every rail line as a pill with its official badge, drifting in two rows (one each way). The first
// copy of each row is the readable list; the repeat that makes the loop seamless is hidden from screen readers.
// The rows stop for people who prefer reduced motion (index.css) and pause while hovered.

const ROWS: Line[][] = [LINES.filter((_, i) => i % 2 === 0), LINES.filter((_, i) => i % 2 === 1)]

function Pill({ line }: { line: Line }) {
  return (
    <li className="flex-shrink-0 inline-flex items-center gap-3 ps-2.5 pe-6 py-2.5 rounded-full border border-gray-200 bg-white">
      <LineBadge line={line} size={44} decorative />
      <span className="text-lg md:text-[28px] font-medium tracking-[-0.01em] text-[#14213D] whitespace-nowrap">{line.name}</span>
    </li>
  )
}

function LineMarquee() {
  const { t } = useLanguage()
  return (
    <section aria-label={t('lines')} className="mt-24 md:mt-32 bg-gray-50 py-16 md:py-[110px] overflow-hidden">
      <Reveal className="px-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-white ps-2 pe-5 py-2 shadow-[0_8px_24px_-12px_rgb(20_33_61/0.25)] ring-1 ring-gray-100">
          <span className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <BrandLogo size="sm" wordmark={false} />
          </span>
          <span className="text-start leading-tight">
            <span className="block text-sm font-semibold text-[#14213D]">RONDA</span>
            <span className="block text-xs text-gray-600">{t('bannerSubtitle')}</span>
          </span>
        </div>
        <blockquote className="mt-7 max-w-xl text-[15px] leading-relaxed text-gray-600">“{t('why_caption')}”</blockquote>
      </Reveal>

      <div className="mt-12 flex flex-col gap-4 [direction:ltr]" dir="ltr">
        {ROWS.map((row, r) => (
          <div key={r} className="marquee group flex w-max">
            <ul className={`marquee-track flex gap-4 pe-4 ${r ? 'marquee-right' : 'marquee-left'}`}>
              {row.map((l) => <Pill key={l.id} line={l} />)}
            </ul>
            <ul className={`marquee-track flex gap-4 pe-4 ${r ? 'marquee-right' : 'marquee-left'}`} aria-hidden="true">
              {row.map((l) => <Pill key={l.id} line={l} />)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LineMarquee
