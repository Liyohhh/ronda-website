import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import PhotoCredit from './PhotoCredit'
import { Eyebrow, Reveal } from './Motion'
import { PROMO_FEATURE, PROMOTIONS } from '../data/promotions'
import { useLanguage } from '../hooks/useLanguage'

// Home page: promotions (ads) as Blaze-style package cards: photo on one side, a light grey panel with the words on
// the other, both with big round corners. On wide screens the cards stick under the header and stack on top of each
// other as the page scrolls. Every banner carries one quiet "Ad" tag in the same corner. Data in src/data/promotions.ts.

// the whole card is the link (stretched over it: the card is the nearest positioned box)
const STRETCH = 'after:absolute after:inset-0 after:z-[1] after:rounded-[32px] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-4 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#1F2F5C]'

function AdTag({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm">
      {text}
    </span>
  )
}

function PromotionSection() {
  const { t } = useLanguage()
  const f = PROMO_FEATURE
  const cards = [f, ...PROMOTIONS]

  return (
    <section aria-labelledby="promo-title" className="mt-24 md:mt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h2 id="promo-title" className="flex"><Eyebrow icon={<Icon name="sell" size={18} />}>{t('promoTitle')}</Eyebrow></h2>
            <p className="mt-6 max-w-3xl [text-wrap:balance] text-[36px] md:text-[58px] leading-[1.1] font-medium tracking-[-0.025em] text-[#1F2F5C]">{t('promoSubtitle')}</p>
          </div>
          <Link
            to={f.to}
            className="inline-flex self-start sm:self-auto flex-shrink-0 items-center gap-1.5 px-7 py-3.5 rounded-full border border-gray-200 bg-white text-[15px] font-bold text-[#1F2F5C] shadow-sm hover:bg-[#1F2F5C] hover:text-white hover:border-[#1F2F5C] transition-all whitespace-nowrap"
          >
            {t('promoAdvertiseLink')}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </Link>
        </Reveal>

        <ul className="flex flex-col gap-6 lg:gap-10">
          {cards.map((p, i) => {
            const feature = p.id === f.id
            return (
              <li
                key={p.id}
                data-promo={p.id}
                className="group relative lg:sticky lg:top-[var(--stack-top)] grid lg:grid-cols-2 gap-[10px] rounded-[32px] bg-white"
                style={{ '--stack-top': `${96 + i * 18}px` } as CSSProperties}
              >
                <div className={`relative overflow-hidden rounded-[32px] bg-[#18243F] min-h-[240px] lg:min-h-[420px] ${i % 2 ? 'lg:order-2' : ''}`}>
                  <img src={p.photo.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                  <span className="absolute top-4 start-4"><AdTag text={t('promoAdLabel')} /></span>
                  <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-4 py-2 text-[10px] text-white/90 [&_a]:relative [&_a]:z-10">
                    {t('photoLabel')}: <PhotoCredit photo={p.photo} />
                  </p>
                </div>

                <div className={`flex flex-col justify-between gap-8 rounded-[32px] bg-gray-50 p-6 md:p-10 ${i % 2 ? 'lg:order-1' : ''}`}>
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl md:text-[28px] leading-snug font-medium tracking-[-0.01em] text-[#1F2F5C]">
                        <Link to={p.to} className={STRETCH}>{t(p.title)}</Link>
                      </h3>
                      <span aria-hidden="true" className="mt-2 text-sm text-gray-500 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="mt-4 text-gray-600 leading-relaxed max-w-md">{t(p.text)}</p>
                    {feature && (
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {f.tickets.map((k) => (
                          <li key={k} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1F2F5C]">{t(k)}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-gray-200 pt-6">
                    {feature ? (
                      <>
                        <span aria-hidden="true" className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-full bg-[#1F2F5C] text-[15px] font-bold text-white shadow-md group-hover:bg-[#152038] transition-colors">
                          {t(f.cta)}
                          <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                        </span>
                        <span className="text-sm text-gray-600">{t(f.note)}</span>
                      </>
                    ) : (
                      <span aria-hidden="true" className="ms-auto w-12 h-12 rounded-full bg-[#1F2F5C] text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:-rotate-45 rtl:group-hover:rotate-45">
                        <Icon name="chevronRight" size={20} className="rtl:rotate-180" />
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default PromotionSection
