import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import AuthLayout, { AuthField, SubmitButton } from '../components/AuthLayout'
import { useLanguage } from '../hooks/useLanguage'

function Register() {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordsMismatch'))
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
  }

  return (
    <AuthLayout
      promoTitle={t('authRegisterPromoTitle')}
      promoText={t('authRegisterPromoText')}
      title={t('signUpTitle')}
      footer={
        <>
          {t('haveAccount')}{' '}
          <Link to="/login" className="text-[#1F2F5C] font-semibold hover:underline">
            {t('login')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <p role="alert" className="text-red-700 bg-red-50 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-green-800 bg-green-50 text-sm rounded-lg px-3 py-2 mb-4">
            {t('accountCreated')}
          </p>
        )}
        <AuthField label={t('fullName')} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <AuthField label={t('emailAddress')} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthField
          label={t('password')}
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <AuthField
          label={t('confirmPassword')}
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <SubmitButton busy={busy}>{t('continueBtn')}</SubmitButton>
      </form>
    </AuthLayout>
  )
}

export default Register
