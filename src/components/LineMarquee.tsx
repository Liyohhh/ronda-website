import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { LINES, type Line } from '../data/lines'
import Icon from './Icon'
import LineBadge from './LineBadge'
import { Accent, Eyebrow, Reveal } from './Motion'

// Home band between "Everything you need" and "Why RONDA?": the promise as a serif heading (last word in italic blue)
// with one line under it, the network in numbers on an open row split by thin lines (the first number in blue), then
// one pale panel: every rail line as a pill with its official badge, drifting in two rows (one each way), and at the
// panel's foot the live map bar (pulsing "Live", what it shows, a link). Kept compact. The first copy of each row is
// the readable list; the repeat that makes the loop seamless is hidden from screen readers. The rows stop for people
// who prefer reduced motion (index.css) and pause while hovered.

const ROWS: Line[][] = [LINES.filter((_, i) => i % 2 === 0), LINES.filter((_, i) => i % 2 === 1)]

function Pill({ line }: { line: Line }) {
  return (
    <li className="flex-shrink-0 inline-flex items-center gap-2 ps-1.5 pe-4 py-1.5 rounded-full border border-[#E3E9F1] bg-white shadow-[0_2px_8px_-4px_rgb(34_45_82/0.15)]">
      <LineBadge line={line} size={28} decorative />
      <span className="text-[15px] font-semibold text-[#222D52] whitespace-nowrap">{line.name}</span>
    </li>
  )
}

function LineMarquee() {
  const { t } = useLanguage()
  // the numbers, as in "Why RONDA?" (from the database, 15 Oct 2026, rounded down)
  const stats: [string, string][] = [['14', t('why_lines')], ['6,500+', t('why_stops')], ['18,000+', t('why_places')], ['17', t('why_trails')]]
  return (
    <section aria-label={t('lines')} className="bg-white py-14 md:py-20 text-[#222D52]">
      <div className="wrap">
        <Reveal className="flex flex-col items-center text-center">
          <Eyebrow center>Ronda2Go</Eyebrow>
          <p className="mt-4 [text-wrap:balance] font-display text-[30px] md:text-[44px] leading-[1.1] font-semibold tracking-[-0.01em]">
            <Accent text={t('s1_tag')} />
          </p>
          <p className="mt-3 max-w-2xl [text-wrap:balance] text-[15px] md:text-base text-[#434C5C]">{t('why_caption')}</p>
        </Reveal>

        {/* the numbers on an open row, split by thin lines; the first in blue */}
        <ul className="mt-8 grid grid-cols-2 md:grid-cols-4">
          {stats.map(([n, label], i) => (
            <Reveal as="li" key={label} delay={i * 0.08} className={`px-3 py-3 text-center ${i % 2 ? 'border-s border-[#D3DCE7]' : ''} md:[&:not(:first-child)]:border-s md:border-[#D3DCE7]`}>
              <span className={`block font-display text-[30px] md:text-[42px] leading-none font-semibold ${i === 0 ? 'text-[#2F6BD8]' : 'text-[#222D52]'}`}>{n}</span>
              <span className="mt-2 block text-sm text-[#434C5C]">{label}</span>
            </Reveal>
          ))}
        </ul>

        {/* one pale panel: the lines drifting, then the live map bar */}
        <Reveal className="mt-8 overflow-hidden rounded-[28px] bg-[#F2F6FB]">
          <div className="marquee-fade flex flex-col gap-2.5 pt-6 [direction:ltr]" dir="ltr">
            {ROWS.map((row, r) => (
              <div key={r} className="marquee group flex w-max">
                <ul className={`marquee-track flex gap-2.5 pe-2.5 ${r ? 'marquee-right' : 'marquee-left'}`}>
                  {row.map((l) => <Pill key={l.id} line={l} />)}
                </ul>
                <ul className={`marquee-track flex gap-2.5 pe-2.5 ${r ? 'marquee-right' : 'marquee-left'}`} aria-hidden="true">
                  {row.map((l) => <Pill key={l.id} line={l} />)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-[#E3E9F1] bg-white/60 px-5 py-4 text-center md:flex-row md:px-7 md:text-start">
            <span className="inline-flex flex-shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#2559B8]">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F6BD8] opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2F6BD8]" />
              </span>
              {t('navLive')}
            </span>
            <p className="flex-1 text-sm md:text-[15px] text-[#434C5C]">{t('liveMapDetail')}</p>
            <Link to="/live" className="inline-flex flex-shrink-0 items-center gap-1.5 h-11 px-5 rounded-full bg-[#222D52] text-sm font-bold text-white hover:bg-[#18203D] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6BD8]">
              {t('featLiveCta')}
              <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default LineMarquee
