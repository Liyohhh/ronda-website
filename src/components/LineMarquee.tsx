import { useLanguage } from '../hooks/useLanguage'
import { LINES, type Line } from '../data/lines'
import LineBadge from './LineBadge'
import { Accent, Eyebrow, Reveal } from './Motion'

// Home band between Promotions and "Why RONDA?" (like the "Loved by thousands" band of the Ainaa site): a gold label,
// the promise as a serif heading with its last word in italic gold, the network in numbers, then every rail line as a
// pill with its official badge, drifting in two rows (one each way). The first copy of each row is the readable list;
// the repeat that makes the loop seamless is hidden from screen readers. The rows stop for people who prefer reduced
// motion (index.css) and pause while hovered.

const ROWS: Line[][] = [LINES.filter((_, i) => i % 2 === 0), LINES.filter((_, i) => i % 2 === 1)]

function Pill({ line }: { line: Line }) {
  return (
    <li className="flex-shrink-0 inline-flex items-center gap-2.5 ps-2 pe-5 py-2 rounded-full border border-white/10 bg-white/[0.05]">
      <LineBadge line={line} size={32} decorative />
      <span className="text-base md:text-lg font-medium text-white/90 whitespace-nowrap">{line.name}</span>
    </li>
  )
}

function LineMarquee() {
  const { t } = useLanguage()
  // the numbers, as in "Why RONDA?" (from the database, 15 Oct 2026, rounded down)
  const stats: [string, string][] = [['14', t('why_lines')], ['6,500+', t('why_stops')], ['18,000+', t('why_places')], ['17', t('why_trails')]]
  return (
    <section aria-label={t('lines')} className="bg-navy-2 py-20 md:py-28 overflow-hidden text-white">
      <Reveal className="wrap flex flex-col items-center text-center">
        <Eyebrow tone="dark" center>RONDA</Eyebrow>
        <p className="mt-5 [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em]">
          <Accent text={t('s1_tag')} dark />
        </p>
        <p className="mt-4 max-w-2xl [text-wrap:balance] text-base md:text-lg text-white/75">{t('why_caption')}</p>
      </Reveal>

      {/* the numbers in soft gold, split by thin lines */}
      <ul className="wrap mt-12 grid grid-cols-2 md:grid-cols-4">
        {stats.map(([n, label], i) => (
          <Reveal as="li" key={label} delay={i * 0.08} className={`px-4 py-4 text-center ${i % 2 ? 'border-s border-white/10' : ''} md:[&:not(:first-child)]:border-s md:border-white/10`}>
            <span className="block font-display text-[44px] md:text-[56px] leading-none font-semibold text-gold-light">{n}</span>
            <span className="mt-3 block text-sm text-white/70">{label}</span>
          </Reveal>
        ))}
      </ul>

      <div className="mt-14 flex flex-col gap-3 [direction:ltr]" dir="ltr">
        {ROWS.map((row, r) => (
          <div key={r} className="marquee group flex w-max">
            <ul className={`marquee-track flex gap-3 pe-3 ${r ? 'marquee-right' : 'marquee-left'}`}>
              {row.map((l) => <Pill key={l.id} line={l} />)}
            </ul>
            <ul className={`marquee-track flex gap-3 pe-3 ${r ? 'marquee-right' : 'marquee-left'}`} aria-hidden="true">
              {row.map((l) => <Pill key={l.id} line={l} />)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LineMarquee
