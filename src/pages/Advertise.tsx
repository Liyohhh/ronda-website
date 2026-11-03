import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import PageHero from '../components/PageHero'
import BrandLogo from '../components/BrandLogo'
import LineBadge from '../components/LineBadge'
import Icon from '../components/Icon'
import { useLanguage } from '../hooks/useLanguage'
import { LINES_BY_ID } from '../data/lines'
import type { TranslationKey } from '../i18n/translations'
import {
  AD_BUSINESS_TYPES, AD_INTERESTS, AD_LIMITS, AD_STEP1, sendAdEnquiry, validateAdEnquiry,
  type AdBusinessType, type AdEnquiry, type AdErrors, type AdField, type AdInterest,
} from '../services/adEnquiries'

// /advertise: a two-step enquiry form (about you, then your idea) beside a Ronda2Go picture, saved to ad_enquiries;
// an admin replies by email. Owner, 3 Nov 2026: form across the page, picture on the right, kind of business is a
// plain field (for our side), no picker cards. No audience figures yet: TODO add rider numbers once the owner
// confirms them from analytics.

const BUSINESS_LABEL: Record<AdBusinessType, TranslationKey> = {
  shop: 'adWhoShop',
  hotel: 'adWhoHotel',
  brand: 'adWhoBrand',
  event: 'adWhoEvent',
}

const INTEREST_LABEL: Record<AdInterest, TranslationKey> = {
  home_promo: 'adInterestHome',
  ronda300: 'adInterest300',
  trails: 'adInterestTrails',
  other: 'adInterestOther',
}

const ERROR_TEXT: Record<NonNullable<AdErrors[AdField]>, TranslationKey> = {
  required: 'adErrRequired',
  invalid: 'adErrInvalid',
  tooLong: 'adErrTooLong',
}

const EMPTY: AdEnquiry = { businessType: '', name: '', company: '', email: '', phone: '', interest: '', message: '', consent: false }
const INPUT = 'w-full border rounded-xl px-3 bg-white text-gray-900 outline-none focus:border-[#2F6BD8] focus:ring-2 focus:ring-[#2F6BD8]/30 transition'

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{optional && <span className="font-normal text-gray-500"> ({t('adOptional')})</span>}
      </label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}

function StepDot({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <span className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
      <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${active ? 'bg-[#2F6BD8] text-white' : 'bg-[#D3DCE7] text-[#222D52]'}`}>{n}</span>
      <span className={`text-sm ${active ? 'font-semibold text-[#222D52]' : 'text-gray-500'}`}>{label}</span>
    </span>
  )
}

// beside the form (owner's pick C, 3 Nov 2026): a navy panel drawn like a transit map. The LRT Kelana Jaya Line runs
// through KL Sentral and Pasar Seni (next stops), the MRT Kajang Line crosses at Pasar Seni (a real interchange), both
// in the operator's colours and with their badges from src/data/lines.ts. No ad on the drawing (owner: it looked out
// of place). A drawing, not a map: not to scale. Words stay real text so they translate.
const KJ = LINES_BY_ID['lrt-kelana-jaya'].color
const KG = LINES_BY_ID['mrt-kajang'].color

function Showcase() {
  const { t } = useLanguage()
  return (
    <div aria-hidden="true" className="relative flex min-h-[420px] flex-col overflow-hidden bg-[#1C2647] p-6 text-white sm:p-8 lg:p-10">
      {/* soft blue glow and a faint dot grid behind the drawing */}
      <div className="absolute -end-24 -top-24 h-80 w-80 rounded-full bg-[#2F6BD8]/30 blur-3xl" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:18px_18px]" />

      <span className="relative flex items-center gap-3">
        <BrandLogo tone="light" size="md" wordmark={false} />
        <span className="font-display text-[28px] font-semibold leading-none" dir="ltr">Ronda2Go</span>
      </span>
      <p className="relative mt-3 max-w-xs text-white/75">{t('adShowTagline')}</p>

      <div className="relative mt-auto flex flex-col items-center pt-6 pb-8" dir="ltr">
        {/* the drawing runs to the panel edges so the lines leave the picture */}
        <div className="relative -mx-6 w-[calc(100%+3rem)] sm:-mx-8 sm:w-[calc(100%+4rem)] lg:-mx-10 lg:w-[calc(100%+5rem)]">
        {/* the lines fade in at the top, so they never run over the words above; the green line fades out before the card */}
        <svg viewBox="0 0 400 296" className="block w-full [mask-image:linear-gradient(to_bottom,transparent_0%,#000_22%)]">
          <defs>
            <linearGradient id="ad-kg-tail" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="296">
              <stop offset="0.72" stopColor={KG} />
              <stop offset="0.98" stopColor={KG} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* other lines, faint, so the drawing reads as a network */}
          <path d="M270 -20 V50 L420 200" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-20 100 H50 L90 60 H230" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
          {/* MRT Kajang Line crossing at Pasar Seni */}
          <path d="M90 -20 L150 40 V170 L100 220 V320" fill="none" stroke="url(#ad-kg-tail)" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
          {/* LRT Kelana Jaya Line: KL Sentral to Pasar Seni and on */}
          <path d="M-20 250 H40 L120 170 H260 L340 90 H420" fill="none" stroke={KJ} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
          {/* stops */}
          {[[40, 250], [260, 170], [340, 90], [150, 90]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="#fff" stroke="#1C2647" strokeWidth="3" />
          ))}
          {/* interchange at Pasar Seni */}
          <rect x="138" y="158" width="24" height="24" rx="12" fill="#fff" stroke="#1C2647" strokeWidth="3" />
          {/* station names */}
          <rect x="22" y="262" width="84" height="24" rx="12" fill="#fff" fillOpacity="0.12" />
          <text x="64" y="279" fill="#fff" fontSize="12.5" fontWeight="600" textAnchor="middle">KL Sentral</text>
          <rect x="44" y="132" width="86" height="24" rx="12" fill="#fff" fillOpacity="0.12" />
          <text x="87" y="149" fill="#fff" fontSize="12.5" fontWeight="600" textAnchor="middle">Pasar Seni</text>
        </svg>
        {/* each line's own badge (the site's MyRapid-style line icons), placed in viewBox units as percentages */}
        {[{ id: 'lrt-kelana-jaya', x: 360, y: 58 }, { id: 'mrt-kajang', x: 178, y: 78 }].map((b) => (
          <span key={b.id} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[10px] ring-4 ring-[#1C2647]" style={{ left: `${(b.x / 400) * 100}%`, top: `${(b.y / 296) * 100}%` }}>
            <LineBadge line={b.id} size={34} decorative className="block" />
          </span>
        ))}
        </div>
      </div>
    </div>
  )
}

function Advertise() {
  const { t, lang } = useLanguage()
  const [form, setForm] = useState<AdEnquiry>(EMPTY)
  const [errors, setErrors] = useState<AdErrors>({})
  const [step, setStep] = useState<1 | 2>(1)
  const [trap, setTrap] = useState('') // hidden field: people never see it, bots fill it in
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'failed'>('idle')

  const set = <K extends keyof AdEnquiry>(k: K, v: AdEnquiry[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }))
  }
  const err = (k: AdField) => (errors[k] ? t(ERROR_TEXT[errors[k]]) : undefined)
  const aria = (k: AdField) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `ad-${k}-err` : undefined })
  const border = (k: AdField) => (errors[k] ? 'border-red-600' : 'border-gray-300')

  // shows the errors for these fields; returns false (and focuses the first one) if any
  function check(fields: AdField[]): boolean {
    const all = validateAdEnquiry(form)
    const found: AdErrors = {}
    for (const f of fields) if (all[f]) found[f] = all[f]
    setErrors(found)
    const first = fields.find((f) => found[f])
    if (first) document.getElementById(`ad-${first}`)?.focus()
    return !first
  }

  function next() {
    if (check(AD_STEP1)) {
      setStep(2)
      requestAnimationFrame(() => document.getElementById('ad-interest')?.focus())
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step === 1) return next()
    // step 1 is checked again in case it was changed by going back
    if (!check(AD_STEP1)) return setStep(1)
    if (!check(['interest', 'message', 'consent'])) return
    if (trap) {
      setState('sent') // looks sent to the bot, nothing saved
      return
    }
    setState('busy')
    const ok = await sendAdEnquiry(form, lang)
    setState(ok ? 'sent' : 'failed')
    // the note sits above the fields: bring it into view
    requestAnimationFrame(() => document.getElementById('ad-form-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <SiteLayout>
      <PageHero eyebrow="Ronda2Go" title={t('adPageTitle')} intro={t('adPageIntro')} center />

      <div className="wrap">
        {/* one card: the form on the light side, the Ronda2Go drawing on the navy side */}
        <section aria-labelledby="ad-form-title" className="mt-12 mb-4 grid overflow-hidden rounded-[28px] bg-[#F2F6FB] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="relative z-[1] p-5 sm:p-8 lg:p-10">
            <h2 id="ad-form-title" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-[#222D52]">{t('adFormTitle')}</h2>
            <p className="mt-2 text-gray-600">{t('adFormIntro')}</p>
            <p className="mt-1 text-sm text-gray-500">{t('adTrust')}</p>

            {state === 'sent' ? (
              <div role="status" className="mt-6 rounded-2xl bg-white border border-green-200 p-5 flex gap-3">
                <Icon name="check" size={24} className="flex-shrink-0 text-green-700" />
                <div>
                  <p className="font-semibold text-gray-900">{t('adSentTitle')}</p>
                  <p className="mt-1 text-sm text-gray-600">{t('adSentText')}</p>
                  <button type="button" onClick={() => { setForm(EMPTY); setStep(1); setState('idle') }} className="mt-3 text-sm font-semibold text-[#2559B8] underline">
                    {t('adSendAnother')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-6">
                <div className="mb-5 flex items-center gap-3">
                  <StepDot n={1} label={t('adStep1')} active={step === 1} />
                  <span aria-hidden="true" className="h-px flex-1 bg-[#D3DCE7]" />
                  <StepDot n={2} label={t('adStep2')} active={step === 2} />
                </div>
                {state === 'failed' && (
                  <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{t('adFailed')}</p>
                )}
                {hasErrors && (
                  <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{t('adCheckFields')}</p>
                )}

                {step === 1 ? (
                  <>
                    <div className="grid gap-x-3 sm:grid-cols-2">
                      <Field id="ad-name" label={t('adName')} error={err('name')}>
                        <input id="ad-name" type="text" autoComplete="name" maxLength={AD_LIMITS.name} value={form.name} onChange={(e) => set('name', e.target.value)} className={`${INPUT} h-11 ${border('name')}`} {...aria('name')} />
                      </Field>
                      <Field id="ad-company" label={t('adCompany')} error={err('company')}>
                        <input id="ad-company" type="text" autoComplete="organization" maxLength={AD_LIMITS.company} value={form.company} onChange={(e) => set('company', e.target.value)} className={`${INPUT} h-11 ${border('company')}`} {...aria('company')} />
                      </Field>
                      <Field id="ad-email" label={t('emailAddress')} error={err('email')}>
                        <input id="ad-email" type="email" dir="ltr" autoComplete="email" maxLength={AD_LIMITS.email} value={form.email} onChange={(e) => set('email', e.target.value)} className={`${INPUT} h-11 ${border('email')}`} {...aria('email')} />
                      </Field>
                      <Field id="ad-phone" label={t('adPhone')} optional error={err('phone')}>
                        <input id="ad-phone" type="tel" dir="ltr" autoComplete="tel" maxLength={AD_LIMITS.phone} value={form.phone} onChange={(e) => set('phone', e.target.value)} className={`${INPUT} h-11 ${border('phone')}`} {...aria('phone')} />
                      </Field>
                    </div>
                    <Field id="ad-businessType" label={t('adBusinessType')} error={err('businessType')}>
                      <select id="ad-businessType" value={form.businessType} onChange={(e) => set('businessType', e.target.value as AdEnquiry['businessType'])} className={`${INPUT} h-11 ${border('businessType')} ${form.businessType ? '' : 'text-gray-500'}`} {...aria('businessType')}>
                        <option value="" disabled>{t('adInterestPick')}</option>
                        {AD_BUSINESS_TYPES.map((b) => (
                          <option key={b} value={b} className="text-gray-900">{t(BUSINESS_LABEL[b])}</option>
                        ))}
                      </select>
                    </Field>
                    <button type="submit" className="inline-flex items-center justify-center gap-1.5 h-12 w-full sm:w-auto px-7 rounded-full bg-[#2F6BD8] text-white font-semibold hover:bg-[#2559B8] transition-colors">
                      {t('adNext')}
                      <Icon name="chevronRight" size={18} className="rtl:rotate-180" />
                    </button>
                  </>
                ) : (
                  <>
                    <Field id="ad-interest" label={t('adInterest')} error={err('interest')}>
                      <select id="ad-interest" value={form.interest} onChange={(e) => set('interest', e.target.value as AdEnquiry['interest'])} className={`${INPUT} h-11 ${border('interest')} ${form.interest ? '' : 'text-gray-500'}`} {...aria('interest')}>
                        <option value="" disabled>{t('adInterestPick')}</option>
                        {AD_INTERESTS.map((i) => (
                          <option key={i} value={i} className="text-gray-900">{t(INTEREST_LABEL[i])}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id="ad-message" label={t('adMessage')} error={err('message')}>
                      <textarea id="ad-message" rows={5} maxLength={AD_LIMITS.message} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={t('adMessagePh')} className={`${INPUT} py-2.5 ${border('message')}`} {...aria('message')} />
                    </Field>
                    {/* bots fill every field; this one is off screen and skipped by keyboard and screen readers */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                      <label htmlFor="ad-website">Website</label>
                      <input id="ad-website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                    </div>
                    <div className="mb-5">
                      <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input id="ad-consent" type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="mt-0.5 h-4 w-4 accent-navy" {...aria('consent')} />
                        <span>
                          {t('adConsent')}{' '}
                          <Link to="/help/policies#polPrivacy" target="_blank" className="font-semibold text-[#2559B8] underline">{t('adConsentLink')}</Link>
                        </span>
                      </label>
                      {errors.consent && <p id="ad-consent-err" className="mt-1 text-xs text-red-700">{t('adErrConsent')}</p>}
                    </div>
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                      <button type="button" onClick={() => { setErrors({}); setStep(1) }} className="inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-full border border-[#D3DCE7] bg-white text-[#222D52] font-semibold hover:bg-[#EAF1FB] transition-colors">
                        <Icon name="chevronLeft" size={18} className="rtl:rotate-180" />
                        {t('adBack')}
                      </button>
                      <button type="submit" disabled={state === 'busy'} className="inline-flex items-center justify-center gap-1.5 h-12 px-7 rounded-full bg-[#2F6BD8] text-white font-semibold hover:bg-[#2559B8] disabled:opacity-60 transition-colors">
                        {state === 'busy' ? t('adSending') : t('adSend')}
                        {state !== 'busy' && <Icon name="chevronRight" size={18} className="rtl:rotate-180" />}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
          <Showcase />
        </section>
      </div>
    </SiteLayout>
  )
}

export default Advertise
