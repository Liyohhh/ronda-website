import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import LanguageMenu from './LanguageMenu'
import SocialLogin from './SocialLogin'
import { useLanguage } from '../hooks/useLanguage'
import { AUTH_VIDEO } from '../data/authVideo'

// Shared frame for Login / Register: slim top bar, brand panel on the left (desktop), form on the right.

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
      <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
        <Link to="/" className="flex items-center" aria-label="RONDA home">
          <BrandLogo size="sm" />
        </Link>
        <LanguageMenu variant="outline" />
      </header>

      <div className="flex flex-1">
        {/* Brand panel: KL sunset timelapse at full strength; the sky stays clear at the top, text at the bottom over a navy fade */}
        <aside className="relative hidden md:flex md:w-1/2 overflow-hidden bg-[#1F2F5C] text-white">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#18243F]/95 via-[#18243F]/75 via-35% to-transparent to-65%" />
          <div className="relative flex flex-col justify-end w-full px-12 lg:px-16 pb-16">
            <BrandLogo tone="light" size="lg" className="mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 [text-shadow:0_2px_8px_rgb(0_0_0/0.35)]">{promoTitle}</h1>
            <p className="text-white text-lg max-w-md [text-shadow:0_1px_6px_rgb(0_0_0/0.55)]">{promoText}</p>
            <a href={AUTH_VIDEO.page} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 end-4 rounded bg-black/45 px-2 py-0.5 text-[11px] text-white/85 hover:underline">
              {t('videoLabel')}: {AUTH_VIDEO.author} · Pexels
            </a>
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center px-6 py-10 bg-gray-50">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            {children}

            {social && (
              <>
                <div className="flex items-center gap-3 my-6" aria-hidden="true">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-500 text-xs uppercase tracking-wider">{t('orLabel')}</span>
                  <div className="flex-1 h-px bg-gray-200" />
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
        className="w-full h-11 border border-gray-300 rounded-lg px-3 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1F2F5C] focus:ring-2 focus:ring-[#1F2F5C]/15 transition"
      />
    </label>
  )
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full h-11 mt-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
    >
      {busy && <span className="w-4 h-4 border-2 border-[#18243F]/30 border-t-[#18243F] rounded-full animate-spin" />}
      {busy ? t('pleaseWait') : children}
    </button>
  )
}

export default AuthLayout
