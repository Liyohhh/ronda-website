import { useState, type FormEvent, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import { AuthField } from '../components/AuthLayout'
import { supabase } from '../services/supabase'
import { useLanguage } from '../hooks/useLanguage'
import { useSession } from '../hooks/useSession'

// /account (signed in): name, password, sign out everywhere, delete the account (PDPA: the person can remove
// their data themselves). Deleting goes through the delete-account Edge Function (needs the server key).
const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? ''

function Card({ title, children, danger = false }: { title: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className={`rounded-2xl border bg-white p-5 sm:p-6 ${danger ? 'border-red-200' : 'border-gray-200'}`} aria-label={title}>
      <h2 className={`text-lg font-semibold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Note({ kind, children }: { kind: 'ok' | 'error'; children: ReactNode }) {
  return kind === 'ok'
    ? <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{children}</p>
    : <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>
}

const btn = 'inline-flex h-11 items-center justify-center rounded-lg px-5 font-semibold transition disabled:opacity-60'

function Account() {
  const session = useSession()
  // the session is read asynchronously: show the forms once the user is known (RequireAuth already checked it)
  return session?.user ? <AccountForms user={session.user} /> : <SiteLayout><div className="min-h-[50vh]" /></SiteLayout>
}

function AccountForms({ user }: { user: User }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [name, setName] = useState<string>(() => (user.user_metadata?.full_name as string | undefined) ?? '')
  const [nameMsg, setNameMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [delMsg, setDelMsg] = useState('')
  const [busy, setBusy] = useState<'' | 'name' | 'pw' | 'out' | 'del'>('')

  const saveName = async (e: FormEvent) => {
    e.preventDefault()
    setBusy('name')
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    setBusy('')
    setNameMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: t('accountSaved') })
  }

  const savePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (pw.length < 8) return setPwMsg({ kind: 'error', text: t('passwordTooShort') })
    if (pw !== pw2) return setPwMsg({ kind: 'error', text: t('passwordsMismatch') })
    setBusy('pw')
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy('')
    if (error) return setPwMsg({ kind: 'error', text: error.message })
    setPw('')
    setPw2('')
    setPwMsg({ kind: 'ok', text: t('accountPasswordSaved') })
  }

  const signOutEverywhere = async () => {
    setBusy('out')
    navigate('/', { replace: true })
    await supabase.auth.signOut({ scope: 'global' })
  }

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault()
    setDelMsg('')
    setBusy('del')
    const { data, error } = await supabase.functions.invoke('delete-account', { body: { confirm: 'DELETE' } })
    if (error || !data?.deleted) {
      setBusy('')
      setDelMsg(CONTACT_EMAIL ? t('accountDeleteFailed').replace('{email}', CONTACT_EMAIL) : t('accountDeleteFailedNoEmail'))
      return
    }
    // the login no longer exists: drop it here, then load the home page fresh (nothing of the account stays in memory)
    await supabase.auth.signOut({ scope: 'local' })
    window.location.replace('/')
  }

  // signed-in email/password accounts can change their password; Google / Apple / Facebook ones sign in there
  const hasPassword = (user.identities ?? []).some((i) => i.provider === 'email') || user.app_metadata?.provider === 'email'

  return (
    <SiteLayout>
      <section className="bg-[#1C2B4A] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold">{t('accountTitle')}</h1>
          <p className="mt-2 text-white/80">{t('accountIntro')}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <Card title={t('accountProfile')}>
          <p className="mb-3 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{t('accountEmail')}:</span> {user.email}
          </p>
          <form onSubmit={saveName}>
            <AuthField label={t('fullName')} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            <button type="submit" disabled={busy !== ''} className={`${btn} bg-[#1C2B4A] text-white hover:bg-[#14203A]`}>{t('accountSaveName')}</button>
            {nameMsg && <Note kind={nameMsg.kind}>{nameMsg.text}</Note>}
          </form>
        </Card>

        <Card title={t('accountSecurity')}>
          {hasPassword && (
            <form onSubmit={savePassword} className="mb-6">
              <h3 className="mb-2 font-medium text-gray-900">{t('accountPassword')}</h3>
              <AuthField label={t('newPassword')} type="password" autoComplete="new-password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} required />
              <AuthField label={t('confirmPassword')} type="password" autoComplete="new-password" minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
              <button type="submit" disabled={busy !== ''} className={`${btn} bg-[#1C2B4A] text-white hover:bg-[#14203A]`}>{t('resetSave')}</button>
              {pwMsg && <Note kind={pwMsg.kind}>{pwMsg.text}</Note>}
            </form>
          )}
          <button type="button" onClick={signOutEverywhere} disabled={busy !== ''} className={`${btn} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}>
            {t('signOutEverywhere')}
          </button>
        </Card>

        <Card title={t('accountDelete')} danger>
          <p className="mb-3 text-sm text-gray-700">{t('accountDeleteText')}</p>
          <form onSubmit={deleteAccount}>
            <AuthField label={t('accountDeleteConfirm')} type="text" autoComplete="off" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            <button type="submit" disabled={busy !== '' || confirmText.trim() !== 'DELETE'} className={`${btn} bg-red-700 text-white hover:bg-red-800`}>
              {t('accountDeleteBtn')}
            </button>
            {delMsg && <Note kind="error">{delMsg}</Note>}
          </form>
        </Card>
      </div>
    </SiteLayout>
  )
}

export default Account
