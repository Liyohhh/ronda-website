import { Link } from 'react-router-dom'
import Icon from './Icon'
import { Accent, Eyebrow, Reveal } from './Motion'
import { PROMOTIONS } from '../data/promotions'
import { useLanguage } from '../hooks/useLanguage'

// Home page: promotions (ads) as three arched cards in a row: a photo fills each card's round top, a round icon
// sits on the photo's edge, then the label, the title and a button. The middle card (RONDA 300) is filled blue, a
// little taller, and shows the number of stops and stations. Every card carries one quiet "Ad" tag at the top.
// The heading is centred with "Advertise with us" under it. On phones the cards stack. Data in src/data/promotions.ts.

// (the arch is a fixed radius, not rounded-full: a huge radius would shrink the bottom corners to nothing)
// the whole card is the link (stretched over it: the card is the nearest positioned box)
const STRETCH = 'after:absolute after:inset-0 after:z-[2] after:rounded-t-[170px] after:rounded-b-[28px] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-4 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#222D52]'

function PromotionSection() {
  const { t } = useLanguage()

  return (
    <section aria-labelledby="promo-title" className="mt-24 md:mt-32 bg-white py-20 md:py-28">
      <div className="wrap">
        <Reveal className="flex flex-col items-center text-center">
          <h2 id="promo-title"><Eyebrow center>{t('promoTitle')}</Eyebrow></h2>
          <p className="mt-5 max-w-3xl [text-wrap:balance] font-display text-[34px] md:text-[50px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]"><Accent text={t('promoSubtitle')} /></p>
          <Link
            to="/help/general#business"
            className="mt-6 inline-flex items-center gap-1.5 h-11 px-5 rounded-full border border-[#D3DCE7] bg-white text-sm font-semibold text-[#222D52] hover:bg-[#222D52] hover:text-white hover:border-[#222D52] transition-colors whitespace-nowrap"
          >
            {t('promoAdvertiseLink')}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </Link>
        </Reveal>

        <ul className="mx-auto mt-12 grid max-w-sm gap-6 md:max-w-none md:grid-cols-3 md:items-end">
          {PROMOTIONS.map((p, i) => {
            const lit = !!p.lit
            return (
              <Reveal as="li" key={p.id} delay={i * 0.08} data-promo={p.id}
                className={`lift group relative flex flex-col overflow-hidden rounded-t-[170px] rounded-b-[28px] text-center ${lit ? 'bg-[#2F6BD8] pb-8 text-white shadow-[0_30px_50px_-30px_rgb(47_107_216/0.8)]' : 'bg-[#F2F6FB] pb-7 text-[#222D52]'}`}>
                <span className="absolute start-1/2 top-4 z-[1] -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-[#222D52] shadow-sm">{t('promoAdLabel')}</span>
                <div className={`overflow-hidden ${lit ? 'h-[240px] md:h-[280px]' : 'h-[200px] md:h-[230px]'}`}>
                  <img src={p.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                </div>
                <span aria-hidden="true" className={`relative mx-auto -mt-6 grid h-12 w-12 place-items-center rounded-full bg-white text-[#2F6BD8] ring-4 ${lit ? 'ring-[#2F6BD8]' : 'ring-[#F2F6FB]'}`}><Icon name={p.icon} size={22} /></span>
                <div className="px-6">
                  <p className={`mt-3 text-[13px] font-bold ${lit ? 'text-white' : 'text-[#2559B8]'}`}>{t(p.eyebrow)}</p>
                  <h3 className={`mt-1 font-black leading-tight ${lit ? 'text-[22px] md:text-[24px]' : 'text-[20px]'}`}>
                    <Link to={p.to} className={STRETCH}>{t(p.title)}</Link>
                  </h3>
                  {p.stat && (
                    <p className="mt-1.5 text-[14px] [text-wrap:balance]"><span className="font-display text-[24px] font-semibold leading-none tabular-nums">6,500+</span> {t('promoStatLine')}</p>
                  )}
                  <span aria-hidden="true" className={`mt-4 inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-[14px] font-extrabold transition-colors ${lit ? 'bg-white text-[#2559B8] group-hover:bg-[#EAF1FB]' : 'bg-[#222D52] text-white group-hover:bg-[#18203D]'}`}>
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
