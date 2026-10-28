import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import LanguageMenu from './LanguageMenu'
import SocialLogin from './SocialLogin'
import { useLanguage } from '../hooks/useLanguage'
import { AUTH_VIDEO } from '../data/authVideo'
import Icon from './Icon'
import type { PasswordRule } from '../data/passwordRules'

// Shared frame for Login / Register / password reset: slim top bar, brand panel on the left (desktop), form on the right.

type Props = {
  promoTitle: string
  promoText: string
  title: string
  children: ReactNode // the form
  footer: ReactNode // "Don't have an account? Register"
  social?: boolean // Google / Apple / Facebook buttons (not on the password reset pages)
}

function AuthLayout({ promoTitle, promoText, title, children, footer, social = true }: Props) {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gold/30">
        <Link to="/" className="flex items-center" aria-label="RONDA home">
          <BrandLogo size="sm" />
        </Link>
        <LanguageMenu variant="outline" />
      </header>

      <div className="flex flex-1">
        {/* Brand panel: KL sunset timelapse, clear (no tint over it); only a short soft shadow at the bottom behind the text */}
        <aside className="relative hidden md:flex md:w-1/2 overflow-hidden bg-[#222D52] text-white">
          <picture>
            <source srcSet="/Image/banner-kl.webp" type="image/webp" />
            <img src="/Image/banner-kl.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-[45%_center]" />
          </picture>
          <video
            src={AUTH_VIDEO.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-[12%_50%] motion-reduce:hidden"
          />
          <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/60 via-black/35 to-transparent" />
          <div className="relative flex flex-col justify-end w-full px-12 lg:px-16 pb-16">
            <BrandLogo tone="light" size="lg" className="mb-6" />
            <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight mb-4 [text-shadow:0_2px_10px_rgb(0_0_0/0.6)]">{promoTitle}</h1>
            <p className="text-white text-lg max-w-md [text-shadow:0_1px_6px_rgb(0_0_0/0.55)]">{promoText}</p>
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 bg-white">
          <div className="w-full max-w-sm">
            <span className="block h-px w-12 bg-gold mb-4" aria-hidden="true" />
            <h2 className="font-display text-[30px] leading-tight font-semibold text-navy mb-6">{title}</h2>
            {children}

            {social && (
              <>
                <div className="flex items-center gap-3 my-6" aria-hidden="true">
                  <div className="flex-1 h-px bg-gold/40" />
                  <span className="text-gold-deep text-xs uppercase tracking-[0.2em]">{t('orLabel')}</span>
                  <div className="flex-1 h-px bg-gold/40" />
                </div>
                <SocialLogin />
              </>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">{footer}</p>
          </div>
        </main>
      </div>
    </div>
  )
}

// Labelled input used by both forms
export function AuthField({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input
        {...input}
        className="w-full h-11 border border-gray-300 rounded-xl px-3 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-gold focus:ring-2 focus:ring-gold/35 transition"
      />
    </label>
  )
}

// Password input with a show / hide button (the label stays the input's name; the button has its own)
export function PasswordField({ label, ...input }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useLanguage()
  const [shown, setShown] = useState(false)
  return (
    <div className="mb-3">
      <label htmlFor={input.id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          {...input}
          type={shown ? 'text' : 'password'}
          autoCapitalize="off"
          spellCheck={false}
          className="w-full h-11 border border-gray-300 rounded-xl ps-3 pe-11 bg-white text-gray-900 outline-none focus:border-gold focus:ring-2 focus:ring-gold/35 transition"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-pressed={shown}
          aria-label={t(shown ? 'pwHide' : 'pwShow')}
          aria-controls={input.id}
          className="absolute inset-y-0 end-0 w-11 flex items-center justify-center rounded-e-xl text-gray-500 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          <Icon name={shown ? 'visibilityOffOutline' : 'visibilityOutline'} />
        </button>
      </div>
    </div>
  )
}

// Live list of what the new password still needs (ticked as each is met)
export function PasswordChecklist({ id, rules }: { id: string; rules: PasswordRule[] }) {
  const { t } = useLanguage()
  const met = rules.filter((r) => r.ok).length
  const bar = met <= 2 ? 'bg-red-500' : met < rules.length ? 'bg-gold' : 'bg-green-600'
  return (
    <div id={id} className="-mt-1 mb-3">
      <div className="h-1 rounded-full bg-gray-200 overflow-hidden" aria-hidden="true">
        <div className={`h-full ${bar} transition-all`} style={{ width: `${(met / rules.length) * 100}%` }} />
      </div>
      <ul className="mt-2 grid gap-1 text-xs">
        {rules.map((r) => (
          <li key={r.key} className={`flex items-center gap-1.5 ${r.ok ? 'text-green-700' : 'text-gray-500'}`}>
            <Icon name={r.ok ? 'check' : 'close'} size={14} />
            <span>{t(r.key)}</span>
            <span className="sr-only">{t(r.ok ? 'pwRuleMet' : 'pwRuleNotMet')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full h-11 mt-2 bg-navy text-white rounded-full font-semibold tracking-wide hover:bg-navy-deep disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {busy && <span className="w-4 h-4 border-2 border-white/30 border-t-gold rounded-full animate-spin" />}
      {busy ? t('pleaseWait') : children}
    </button>
  )
}

// Messages above / instead of a form: role="alert" for problems, role="status" for good news and notes
export function AuthNote({ kind, children }: { kind: 'error' | 'ok' | 'info'; children: ReactNode }) {
  const look = { error: 'text-red-700 bg-red-50', ok: 'text-green-800 bg-green-50', info: 'text-gold-deep bg-gold-soft' }[kind]
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`${look} text-sm rounded-xl px-3 py-2 mb-4`}>
      {children}
    </p>
  )
}

// Link look inside the auth card
export const AUTH_LINK = 'text-navy font-semibold underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy'

export default AuthLayout
