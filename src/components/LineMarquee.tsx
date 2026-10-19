import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { LINES, type Line } from '../data/lines'
import Icon from './Icon'
import LineBadge from './LineBadge'
import { Accent, Eyebrow, Reveal } from './Motion'

// Home band (velvet navy, with a champagne glow) between "Everything you need" and "Why RONDA?" (like the "Loved by thousands" band of the Ainaa site): a gold label,
// the promise as a serif heading with its last word in italic gold, the network in numbers, then every rail line as a
// pill with its official badge, drifting in two rows (one each way), and last the live map: a glass bar with a
// pulsing "Live" label, what it shows and a link to it. The first copy of each row is the readable list;
// the repeat that makes the loop seamless is hidden from screen readers. The rows stop for people who prefer reduced
// motion (index.css) and pause while hovered.

const ROWS: Line[][] = [LINES.filter((_, i) => i % 2 === 0), LINES.filter((_, i) => i % 2 === 1)]

function Pill({ line }: { line: Line }) {
  return (
    <li className="flex-shrink-0 inline-flex items-center gap-2.5 ps-2 pe-5 py-2 rounded-full border border-white/15 bg-white/[0.06]">
      <LineBadge line={line} size={32} decorative />
      <span className="text-base md:text-lg font-medium text-white whitespace-nowrap">{line.name}</span>
    </li>
  )
}

function LineMarquee() {
  const { t } = useLanguage()
  // the numbers, as in "Why RONDA?" (from the database, 15 Oct 2026, rounded down)
  const stats: [string, string][] = [['14', t('why_lines')], ['6,500+', t('why_stops')], ['18,000+', t('why_places')], ['17', t('why_trails')]]
  return (
    <section aria-label={t('lines')} className="relative bg-[#222D52] py-20 md:py-28 overflow-hidden text-white">
      {/* a soft champagne glow behind the heading */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[520px] w-[900px] max-w-full rounded-full bg-[radial-gradient(closest-side,rgb(210_182_138/0.22),transparent)]" />
      <Reveal className="wrap relative flex flex-col items-center text-center">
        <Eyebrow tone="dark" center>RONDA</Eyebrow>
        <p className="mt-5 [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em]">
          <Accent text={t('s1_tag')} dark />
        </p>
        <p className="mt-4 max-w-2xl [text-wrap:balance] text-base md:text-lg text-white">{t('why_caption')}</p>
      </Reveal>

      {/* the numbers in soft gold, split by thin lines */}
      <ul className="wrap mt-12 grid grid-cols-2 md:grid-cols-4">
        {stats.map(([n, label], i) => (
          <Reveal as="li" key={label} delay={i * 0.08} className={`px-4 py-4 text-center ${i % 2 ? 'border-s border-gold-light/40' : ''} md:[&:not(:first-child)]:border-s md:border-gold-light/40`}>
            <span className="block font-display text-[44px] md:text-[56px] leading-none font-semibold text-gold-light">{n}</span>
            <span className="mt-3 block text-sm text-white">{label}</span>
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

      {/* the live map: the lines above, moving */}
      <Reveal className="wrap mt-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-[28px] border border-white/15 bg-white/[0.06] px-6 py-5 text-center backdrop-blur-sm md:flex-row md:rounded-full md:py-3 md:pe-3 md:ps-6 md:text-start">
          <span className="inline-flex flex-shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold-light">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-light opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-light" />
            </span>
            {t('navLive')}
          </span>
          <p className="flex-1 text-sm md:text-[15px] text-white/85">{t('liveMapDetail')}</p>
          <Link to="/live" className="inline-flex flex-shrink-0 items-center gap-1.5 h-11 px-5 rounded-full bg-gold text-sm font-bold text-[#222D52] hover:bg-gold-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light">
            {t('featLiveCta')}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

export default LineMarquee
