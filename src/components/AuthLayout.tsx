import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import LanguageMenu from './LanguageMenu'
import SocialLogin from './SocialLogin'
import { useLanguage } from '../hooks/useLanguage'

// Shared frame for Login / Register: slim top bar, brand panel on the left (desktop), form on the right.
type Props = {
  promoTitle: string
  promoText: string
  title: string
  children: ReactNode // the form
  footer: ReactNode // "Don't have an account? Register"
}

function AuthLayout({ promoTitle, promoText, title, children, footer }: Props) {
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
        {/* Brand panel */}
        <aside className="relative hidden md:flex md:w-1/2 overflow-hidden bg-[#002472] text-white">
          <picture>
            <source srcSet="/Image/banner-kl.webp" type="image/webp" />
            <img src="/Image/banner-kl.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-[45%_center] opacity-35" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#001233] via-[#002472]/85 to-[#002472]/70" />
          <div className="relative flex flex-col justify-center px-12 lg:px-16">
            <BrandLogo tone="light" size="lg" className="mb-8" />
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">{promoTitle}</h1>
            <p className="text-white/75 text-lg max-w-md">{promoText}</p>
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center px-6 py-10 bg-gray-50">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            {children}

            <div className="flex items-center gap-3 my-6" aria-hidden="true">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-500 text-xs uppercase tracking-wider">{t('orLabel')}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <SocialLogin />

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
        className="w-full h-11 border border-gray-300 rounded-lg px-3 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#002472] focus:ring-2 focus:ring-[#002472]/15 transition"
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
      className="w-full h-11 mt-2 bg-[#002472] text-white rounded-lg font-semibold hover:bg-[#001a55] disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
    >
      {busy && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
      {busy ? t('pleaseWait') : children}
    </button>
  )
}

export default AuthLayout
