import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { useLocation, useNavigate } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import Icon from '../components/Icon'
import { AuthField, PasswordChecklist, PasswordField } from '../components/AuthLayout'
import { PASSWORD_MAX, passwordOk, passwordRules } from '../data/passwordRules'
import { supabase } from '../services/supabase'
import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES } from '../i18n/translations'
import { SUPPORT_EMAIL } from '../data/contact'
import { countryName, countryOptions } from '../data/countries'
import type { IconName } from '../data/icons'
import { useSession } from '../hooks/useSession'
import { authErrorKey, nameData, readName, type PersonName } from '../services/auth'
import { AVATAR_MAX_INPUT, removeAvatar, uploadAvatar } from '../services/avatar'
import { TRIP_SORTS, readParking, readPayment, readResident, readSort, saveParking, savePayment, saveResident, saveSort, type TripSort } from '../data/tripPrefs'

// /account (signed in): a side card (picture, name, email, user since) and menu with an icon per part, beside the
// parts as cards of tiles, one setting per tile with its value and action: Profile (picture, name, country), Trip
// settings, Preferences (language), Sign-in and security (email, password, sign out everywhere). Deleting the account
// sits under the cards (PDPA: the person can remove their data themselves; through the delete-account Edge Function).
// The menu jumps to each card; #security etc. in the address opens there.
const CONTACT_EMAIL = SUPPORT_EMAIL
const DATE_LOCALE = { en: 'en-GB', ms: 'ms-MY', zh: 'zh-CN', ar: 'ar' } as const
const SECTIONS: [string, IconName, 'accountProfile' | 'acctTrips' | 'acctPrefs' | 'accountSecurity' | 'accountDelete'][] = [
  ['profile', 'personOutline', 'accountProfile'], ['trips', 'tune', 'acctTrips'], ['preferences', 'language', 'acctPrefs'],
  ['security', 'lockOutline', 'accountSecurity'], ['delete', 'deleteOutline', 'accountDelete'],
]

function Note({ kind, children }: { kind: 'ok' | 'error'; children: ReactNode }) {
  return kind === 'ok'
    ? <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{children}</p>
    : <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>
}

function Card({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 rounded-2xl bg-white p-5 sm:p-6">
      <h2 id={`${id}-h`} className="text-[19px] font-extrabold text-[#222D52]">{title}</h2>
      {hint && <p className="mt-1 text-sm text-[#5B6576]">{hint}</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  )
}

// one setting: icon and name, its value below, an action on the side; can open a form under it (full width)
function Tile({ icon, label, value, action, children, wide = false }: { icon: IconName; label: string; value?: ReactNode; action?: ReactNode; children?: ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl bg-[#F2F6FB] px-4 py-3.5 ${wide || children ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] text-[#5B6576]"><Icon name={icon} size={16} />{label}</p>
          {value != null && <div className="mt-1 break-words text-[15px] font-semibold text-[#222D52]">{value}</div>}
        </div>
        {action}
      </div>
      {children && <div className="mt-4 border-t border-[#E1E7EF] pt-4">{children}</div>}
    </div>
  )
}

const linkBtn = 'shrink-0 text-sm font-semibold text-[#222D52] underline decoration-[#2F6BD8] underline-offset-4 hover:text-[#2559B8] disabled:opacity-60'
const btn = 'inline-flex h-11 items-center justify-center rounded-full px-6 font-semibold transition disabled:opacity-60'
const select = 'h-10 max-w-full rounded-lg border border-[#D3DCE7] bg-white px-3 text-[14px] font-semibold text-[#222D52] outline-none focus:border-[#2F6BD8] focus:ring-2 focus:ring-[#2F6BD8]/30'

function Account() {
  const session = useSession()
  // the session is read asynchronously: show the forms once the user is known (RequireAuth already checked it)
  return session?.user ? <AccountForms user={session.user} /> : <SiteLayout><div className="min-h-[50vh]" /></SiteLayout>
}

function AccountForms({ user }: { user: User }) {
  const { t, lang, setLang } = useLanguage()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const open = hash.slice(1) || 'profile'
  const [editing, setEditing] = useState<'' | 'name' | 'password' | 'delete'>(() => (hash === '#delete' ? 'delete' : ''))
  const [name, setName] = useState<PersonName>(() => readName(user.user_metadata))
  const [country, setCountry] = useState<string>(() => (user.user_metadata?.country as string | undefined) ?? '')
  const [nameMsg, setNameMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [delMsg, setDelMsg] = useState('')
  const [busy, setBusy] = useState<'' | 'name' | 'pw' | 'out' | 'del' | 'pic'>('')
  const [avatar, setAvatar] = useState<string | null>(() => (user.user_metadata?.avatar_url as string | undefined) ?? null)
  const [picMsg, setPicMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // trip settings take effect at once (the same ones the trip planner uses)
  const [sort, setSort] = useState<TripSort>(readSort)
  const [resident, setResident] = useState(readResident)
  const [payment, setPayment] = useState(readPayment)
  const [parking, setParking] = useState(readParking)
  const countries = useMemo(() => countryOptions(lang), [lang])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setBusy('name')
    const { error } = await supabase.auth.updateUser({ data: { ...nameData(name), ...(country ? { country } : {}) } })
    setBusy('')
    setNameMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: t('accountSaved') })
    if (!error) setEditing('')
  }

  const pickPicture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // the same file can be picked again
    if (!file) return
    if (file.size > AVATAR_MAX_INPUT) return setPicMsg({ kind: 'error', text: t('acctPhotoBig') })
    setBusy('pic')
    setPicMsg(null)
    try {
      setAvatar(await uploadAvatar(user.id, file))
      setPicMsg({ kind: 'ok', text: t('acctPhotoSaved') })
    } catch {
      setPicMsg({ kind: 'error', text: t('acctPhotoError') })
    }
    setBusy('')
  }

  const dropPicture = async () => {
    setBusy('pic')
    setPicMsg(null)
    try {
      await removeAvatar(user.id)
      setAvatar(null)
      setPicMsg({ kind: 'ok', text: t('acctPhotoRemoved') })
    } catch {
      setPicMsg({ kind: 'error', text: t('acctPhotoError') })
    }
    setBusy('')
  }

  const savePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!passwordOk(pw, user.email)) return setPwMsg({ kind: 'error', text: t('pwNotStrong') })
    if (pw !== pw2) return setPwMsg({ kind: 'error', text: t('passwordsMismatch') })
    setBusy('pw')
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy('')
    if (error) return setPwMsg({ kind: 'error', text: t(authErrorKey(error) ?? 'authErrGeneric') })
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
  const provider = (user.app_metadata?.provider as string | undefined) ?? 'email'
  const savedName = readName(user.user_metadata)
  const shownName = nameData(savedName).full_name
  const savedCountry = (user.user_metadata?.country as string | undefined) ?? ''
  const initials = (shownName || user.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const since = user.created_at ? new Date(user.created_at).toLocaleDateString(DATE_LOCALE[lang], { month: 'long', year: 'numeric' }) : ''
  const sortLabel: Record<TripSort, string> = { walking: t('sortLeastWalking'), fastest: t('sortFastest'), transfers: t('sortFewestTransfers'), priceLow: t('sortPriceLow') }
  const picture = (size: string, text: string, alt = '') => avatar
    ? <img src={avatar} alt={alt} className={`${size} shrink-0 rounded-full object-cover`} />
    : <span aria-hidden="true" className={`${size} ${text} grid shrink-0 place-items-center rounded-full bg-[#222D52] font-display text-[#8AB4F8]`}>{initials}</span>

  return (
    <SiteLayout>
      <div className="bg-[#F2F6FB]">
        <div className="wrap grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white p-5">
              <div className="flex items-center gap-3">
                {picture('h-14 w-14', 'text-xl')}
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#222D52]">{shownName || user.email}</p>
                  {shownName && <p className="truncate text-xs text-[#5B6576]">{user.email}</p>}
                </div>
              </div>
              {since && <p className="mt-3 rounded-lg bg-[#EAF1FB] px-3 py-1.5 text-xs font-semibold text-[#2559B8]">{t('acctSince').replace('{date}', since)}</p>}
            </div>
            {/* the menu: a column on wide screens, a row above the cards on phones; each item jumps to its card */}
            <nav aria-label={t('acctMenu')} className="mt-3 rounded-2xl bg-white p-2">
              <p className="hidden px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5B6576] lg:block">{t('accountTitle')}</p>
              <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col">
                {SECTIONS.map(([id, icon, label]) => (
                  <li key={id} className="shrink-0">
                    <a
                      href={`#${id}`}
                      onClick={() => { if (id === 'delete') setEditing('delete') }}
                      aria-current={open === id ? 'location' : undefined}
                      className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BD8] ${open === id ? 'bg-[#EAF1FB] font-semibold text-[#222D52]' : id === 'delete' ? 'text-red-800 hover:bg-red-50' : 'text-[#434C5C] hover:bg-[#F2F6FB]'}`}
                    >
                      <Icon name={icon} size={19} className={open === id ? 'text-[#2559B8]' : 'text-[#8A93A2]'} />
                      {t(label)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 space-y-4">
            <h1 className="sr-only">{t('accountTitle')}</h1>

            <Card id="profile" title={t('accountProfile')} hint={t('acctProfileHint')}>
              <Tile icon="photoCameraOutline" label={t('acctPhoto')} wide value={
                <div className="mt-1 flex flex-wrap items-center gap-4">
                  {picture('h-16 w-16', 'text-2xl', t('acctPhoto'))}
                  <span className="text-xs font-normal text-[#5B6576]">{t('acctPhotoHint')}</span>
                </div>
              } action={
                <div className="flex flex-col items-end gap-2">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={pickPicture} />
                  <button type="button" disabled={busy !== ''} onClick={() => fileRef.current?.click()} className={linkBtn}>{busy === 'pic' ? t('loading') : avatar ? t('acctPhotoChange') : t('acctPhotoAdd')}</button>
                  {avatar && <button type="button" disabled={busy !== ''} onClick={dropPicture} className="text-sm font-semibold text-red-800 hover:underline disabled:opacity-60">{t('acctPhotoRemove')}</button>}
                </div>
              }>{picMsg && <Note kind={picMsg.kind}>{picMsg.text}</Note>}</Tile>

              {editing === 'name' ? (
                <Tile icon="personOutline" label={t('fullName')}>
                  <form onSubmit={saveProfile}>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <AuthField label={t('firstName')} type="text" autoComplete="given-name" value={name.first} onChange={(e) => setName({ ...name, first: e.target.value })} maxLength={60} required />
                      <AuthField label={t('lastName')} type="text" autoComplete="family-name" value={name.last} onChange={(e) => setName({ ...name, last: e.target.value })} maxLength={60} />
                      <div className="mb-3">
                        <label htmlFor="acct-country" className="mb-1 block text-sm font-medium text-gray-700">{t('regCountry')}</label>
                        <select id="acct-country" value={country} onChange={(e) => setCountry(e.target.value)} className={`${select} h-11 w-full rounded-xl`}>
                          <option value="">{t('regCountryPick')}</option>
                          {countries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" disabled={busy !== ''} className={`${btn} bg-[#222D52] text-white hover:bg-[#18203D]`}>{t('accountSaveName')}</button>
                      <button type="button" onClick={() => setEditing('')} className={`${btn} text-[#222D52] hover:bg-[#E3E9F1]`}>{t('acctCancel')}</button>
                    </div>
                  </form>
                </Tile>
              ) : (
                <>
                  <Tile icon="personOutline" label={t('firstName')} value={savedName.first.trim() || '–'} action={<button type="button" onClick={() => { setEditing('name'); setNameMsg(null) }} className={linkBtn}>{t('acctEdit')}</button>} />
                  <Tile icon="badge" label={t('lastName')} value={savedName.last.trim() || '–'} action={<button type="button" onClick={() => { setEditing('name'); setNameMsg(null) }} className={linkBtn}>{t('acctEdit')}</button>} />
                  <Tile icon="public" label={t('regCountry')} value={savedCountry ? countryName(savedCountry, lang) : '–'} action={<button type="button" onClick={() => { setEditing('name'); setNameMsg(null) }} className={linkBtn}>{t('acctEdit')}</button>} />
                </>
              )}
              {nameMsg && <div className="md:col-span-2"><Note kind={nameMsg.kind}>{nameMsg.text}</Note></div>}
            </Card>

            <Card id="trips" title={t('acctTrips')} hint={t('acctTripsHint')}>
              <Tile icon="route" label={t('acctOrder')} action={
                <select aria-label={t('acctOrder')} value={sort} onChange={(e) => { const v = e.target.value as TripSort; setSort(v); saveSort(v) }} className={select}>
                  {TRIP_SORTS.map((k) => <option key={k} value={k}>{sortLabel[k]}</option>)}
                </select>
              } />
              <Tile icon="payments" label={t('faresFor')} action={
                <select aria-label={t('faresFor')} value={resident} onChange={(e) => { const v = e.target.value as typeof resident; setResident(v); saveResident(v) }} className={select}>
                  <option value="citizen">{t('fareMalaysian')}</option><option value="non_citizen">{t('fareTourist')}</option>
                </select>
              } />
              <Tile icon="creditCardOutline" label={t('payWith')} action={
                <select aria-label={t('payWith')} value={payment} onChange={(e) => { const v = e.target.value as typeof payment; setPayment(v); savePayment(v) }} className={select}>
                  <option value="cashless">{t('payCashless')}</option><option value="cash">{t('payCash')}</option>
                </select>
              } />
              <Tile icon="directionsCar" label={t('acctParking')} value={<span className="text-xs font-normal text-[#5B6576]">{t('acctParkingText')}</span>} action={
                <label className="relative inline-flex cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#2F6BD8]">
                  <input type="checkbox" role="switch" aria-label={t('acctParking')} checked={parking} onChange={(e) => { setParking(e.target.checked); saveParking(e.target.checked) }} className="sr-only" />
                  <span aria-hidden="true" className={`relative h-6 w-11 rounded-full transition-colors ${parking ? 'bg-[#222D52]' : 'bg-[#D3DCE7]'}`}>
                    <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full transition-all ${parking ? 'start-[23px] bg-[#8AB4F8]' : 'start-[3px] bg-white'}`} />
                  </span>
                </label>
              } />
            </Card>

            <Card id="preferences" title={t('acctPrefs')} hint={t('acctPrefsHint')}>
              <Tile icon="language" label={t('language')} action={
                <select aria-label={t('language')} value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className={select}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code} lang={l.code}>{l.label}</option>)}
                </select>
              } />
            </Card>

            <Card id="security" title={t('accountSecurity')} hint={t('acctSecurityHint')}>
              <Tile icon="mailOutline" label={t('accountEmail')} value={user.email} action={<span className="shrink-0 text-xs text-[#5B6576]">{provider === 'email' ? t('acctEmailFixedShort') : t('acctSignedInWith').replace('{p}', provider[0].toUpperCase() + provider.slice(1))}</span>} />
              {hasPassword && (editing === 'password' ? (
                <Tile icon="lockOutline" label={t('accountPassword')}>
                  <form onSubmit={savePassword}>
                    <PasswordField id="acct-password" label={t('newPassword')} autoComplete="new-password" minLength={8} maxLength={PASSWORD_MAX} aria-describedby={pw ? 'acct-password-rules' : undefined} value={pw} onChange={(e) => setPw(e.target.value)} required />
                    {/* the rules show once the user starts typing a new password */}
                    {pw && <PasswordChecklist id="acct-password-rules" rules={passwordRules(pw, user.email)} />}
                    <PasswordField id="acct-password2" label={t('confirmPassword')} autoComplete="new-password" maxLength={PASSWORD_MAX} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" disabled={busy !== ''} className={`${btn} bg-[#222D52] text-white hover:bg-[#18203D]`}>{t('resetSave')}</button>
                      <button type="button" onClick={() => setEditing('')} className={`${btn} text-[#222D52] hover:bg-[#E3E9F1]`}>{t('acctCancel')}</button>
                    </div>
                    {pwMsg && <Note kind={pwMsg.kind}>{pwMsg.text}</Note>}
                  </form>
                </Tile>
              ) : (
                <Tile icon="lockOutline" label={t('accountPassword')} value="••••••••••" action={<button type="button" onClick={() => { setEditing('password'); setPwMsg(null) }} className={linkBtn}>{t('acctChange')}</button>} />
              ))}
              <Tile icon="devices" label={t('signOutEverywhere')} value={<span className="text-xs font-normal text-[#5B6576]">{t('acctSignOutText')}</span>} action={<button type="button" onClick={signOutEverywhere} disabled={busy !== ''} className={linkBtn}>{t('acctSignOutShort')}</button>} />
            </Card>

            {/* deleting the account, under the cards like a footnote; opens a confirm box */}
            <section id="delete" aria-labelledby="delete-h" className="scroll-mt-24 px-1 pb-2 text-sm text-[#5B6576]">
              {editing === 'delete' ? (
                <div className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6">
                  <h2 id="delete-h" className="text-[19px] font-extrabold text-red-800">{t('accountDelete')}</h2>
                  <p className="mb-4 mt-1 text-gray-700">{t('accountDeleteText')}</p>
                  <form onSubmit={deleteAccount} className="max-w-md">
                    <AuthField label={t('accountDeleteConfirm')} type="text" autoComplete="off" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" disabled={busy !== '' || confirmText.trim() !== 'DELETE'} className={`${btn} bg-red-700 text-white hover:bg-red-800`}>{t('accountDeleteBtn')}</button>
                      <button type="button" onClick={() => setEditing('')} className={`${btn} text-[#222D52] hover:bg-[#E3E9F1]`}>{t('acctCancel')}</button>
                    </div>
                    {delMsg && <Note kind="error">{delMsg}</Note>}
                  </form>
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-2"><h2 id="delete-h"><button type="button" onClick={() => setEditing('delete')} className="font-semibold text-red-800 underline underline-offset-4">{t('accountDelete')}</button></h2><span>{t('acctDeleteHint')}</span></div>
              )}
            </section>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

export default Account
