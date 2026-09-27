import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import AuthLayout, { AuthField, SubmitButton } from '../components/AuthLayout'
import { useLanguage } from '../hooks/useLanguage'

function Login() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/')
  }

  return (
    <AuthLayout
      promoTitle={t('authLoginPromoTitle')}
      promoText={t('authLoginPromoText')}
      title={t('signInTitle')}
      footer={
        <>
          {t('noAccount')}{' '}
          <Link to="/register" className="text-[#002472] font-semibold hover:underline">
            {t('signUp')}
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
        <AuthField
          label={t('emailAddress')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthField
          label={t('password')}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <SubmitButton busy={busy}>{t('continueBtn')}</SubmitButton>
      </form>
    </AuthLayout>
  )
}

export default Login
