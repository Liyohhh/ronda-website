import { Link } from 'react-router-dom'
import Icon from './Icon'
import PromoArt from './PromoArt'
import { Accent, Eyebrow, Reveal } from './Motion'
import { PROMOTIONS, type Promotion } from '../data/promotions'
import { useLanguage } from '../hooks/useLanguage'

// Home page: promotions (ads), one row: a wide navy card with the number of stops and stations, then a light blue
// card and the one highlighted blue card; each has its words and button on the left and a flat drawing (PromoArt). Every card carries one
// quiet "Ad" tag in the same corner. On phones they stack. Data in src/data/promotions.ts.

// the whole card is the link (stretched over it: the card is the nearest positioned box)
const STRETCH = 'after:absolute after:inset-0 after:z-[2] after:rounded-[24px] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-4 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#222D52]'

const TONE: Record<Promotion['tone'], { card: string; eyebrow: string; title: string; btn: string; ad: string }> = {
  navy: { card: 'bg-gradient-to-br from-[#222D52] to-[#33417A]', eyebrow: 'text-[#8AB4F8]', title: 'text-white', btn: 'bg-white text-[#222D52] group-hover:bg-[#EAF1FB]', ad: 'bg-white/90 text-[#222D52]' },
  sky: { card: 'bg-[#DCEAFB]', eyebrow: 'text-[#2559B8]', title: 'text-[#222D52]', btn: 'bg-[#222D52] text-white group-hover:bg-[#18203D]', ad: 'bg-white/90 text-[#222D52]' },
  blue: { card: 'bg-[#2F6BD8]', eyebrow: 'text-[#DCE9FF]', title: 'text-white', btn: 'bg-white text-[#2559B8] group-hover:bg-[#EAF1FB]', ad: 'bg-white/90 text-[#222D52]' },
}

function PromotionSection() {
  const { t } = useLanguage()

  return (
    <section aria-labelledby="promo-title" className="mt-24 md:mt-32 bg-white py-20 md:py-28">
      <div className="wrap">
        <Reveal className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h2 id="promo-title"><Eyebrow>{t('promoTitle')}</Eyebrow></h2>
            <p className="mt-5 max-w-3xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]"><Accent text={t('promoSubtitle')} /></p>
          </div>
          <Link
            to="/help/general#business"
            className="inline-flex self-start sm:self-auto flex-shrink-0 items-center gap-1.5 h-11 px-5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-[#222D52] hover:bg-[#222D52] hover:text-white hover:border-[#222D52] transition-colors whitespace-nowrap"
          >
            {t('promoAdvertiseLink')}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </Link>
        </Reveal>

        <ul className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
          {PROMOTIONS.map((p, i) => {
            const tone = TONE[p.tone]
            const wide = i === 0
            return (
              <Reveal as="li" key={p.id} delay={i * 0.08} data-promo={p.id} className={`lift group relative flex min-h-[230px] overflow-hidden rounded-[24px] p-6 sm:p-7 ${tone.card} ${wide ? 'items-center' : 'flex-col justify-end'}`}>
                <span className={`absolute top-3.5 start-4 z-[1] rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm ${tone.ad}`}>{t('promoAdLabel')}</span>
                <PromoArt kind={p.art} className={`pointer-events-none absolute transition-transform duration-700 ease-out group-hover:scale-[1.04] ${wide ? 'bottom-2 end-2 w-[48%] max-w-[270px]' : 'end-1 top-3 w-[62%] max-w-[210px]'}`} />
                <div className={`relative ${wide ? 'w-[56%] pt-4' : 'pt-28'}`}>
                  <p className={`text-[13px] font-bold ${tone.eyebrow}`}>{t(p.eyebrow)}</p>
                  <h3 className={`mt-1 font-black leading-tight ${wide ? 'text-[26px] md:text-[28px]' : 'text-[21px]'} ${tone.title}`}>
                    <Link to={p.to} className={STRETCH}>{t(p.title)}</Link>
                  </h3>
                  {p.stat && (
                    <p className="mt-2 text-white/85 text-[14px]"><span className="font-black text-[30px] leading-none text-[#8AB4F8] tabular-nums">6,500+</span> {t('promoStatLine')}</p>
                  )}
                  <span aria-hidden="true" className={`mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-[14px] font-extrabold transition-colors ${tone.btn}`}>
                    {t(p.cta)}
                    <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                  </span>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default PromotionSection
