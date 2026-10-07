import { useEffect, useState, type ReactNode } from 'react'
import type { Provider } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { useLanguage } from '../hooks/useLanguage'

// Quick login buttons. Google, Apple and Facebook go through Supabase Auth (each must be enabled
// in the Supabase dashboard). WeChat and QQ are not Supabase Auth providers, so they only show a
// notice until a sign-in route for them is agreed.
// Brand icons: simple-icons (CC0), Google's four-colour "G".

type Social = {
  id: string
  label: string
  provider?: Provider
  icon: ReactNode
}

const SOCIALS: Social[] = [
  {
    id: 'google',
    label: 'Google',
    provider: 'google',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.27-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple',
    provider: 'apple',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#000000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    ),
  },
  {
    id: 'wechat',
    label: 'WeChat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#07C160" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    provider: 'facebook',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
      </svg>
    ),
  },
  {
    id: 'qq',
    label: 'QQ',
    icon: (
      // QQ penguin in its brand colours: slate body, white belly, yellow beak + feet, red scarf, winking eye
      <svg width="22" height="22" viewBox="96 60 320 360" aria-hidden="true">
        {/* flippers */}
        <ellipse cx="128" cy="292" rx="26" ry="58" transform="rotate(18 128 292)" fill="#36474F" />
        <ellipse cx="384" cy="292" rx="26" ry="58" transform="rotate(-18 384 292)" fill="#36474F" />
        {/* head + body */}
        <path fill="#36474F" d="M256 72c68 0 118 50 120 122 2 20 6 44 10 70 10 66-40 136-130 136s-140-70-130-136c4-26 8-50 10-70 2-72 52-122 120-122z" />
        {/* belly */}
        <ellipse cx="256" cy="322" rx="90" ry="82" fill="#ECEFF1" />
        {/* feet */}
        <ellipse cx="190" cy="396" rx="54" ry="24" fill="#FFC107" />
        <ellipse cx="322" cy="396" rx="54" ry="24" fill="#FFC107" />
        {/* scarf band + hanging end */}
        <path fill="#FF3D00" d="M122 214c86 44 182 44 268-6l-6 36c-86 50-178 50-262 8z" />
        <path fill="#FF3D00" d="M156 244l52 6-2 78c-18 8-36 8-52 0z" />
        {/* beak */}
        <ellipse cx="256" cy="204" rx="74" ry="20" fill="#FFC107" />
        {/* eyes: open left, winking right */}
        <ellipse cx="228" cy="146" rx="25" ry="34" fill="#FFFFFF" />
        <ellipse cx="232" cy="150" rx="11" ry="16" fill="#36474F" />
        <ellipse cx="286" cy="146" rx="25" ry="34" fill="#FFFFFF" />
        <path d="M271 154q15-16 30 0" fill="none" stroke="#36474F" strokeWidth="9" strokeLinecap="round" />
      </svg>
    ),
  },
]

// Which OAuth providers are switched on in Supabase Auth (public settings endpoint).
// null = unknown (request failed): then just try, and let Supabase decide.
async function enabledProviders(): Promise<Set<string> | null> {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    if (!res.ok) return null
    const { external } = (await res.json()) as { external: Record<string, boolean> }
    return new Set(Object.keys(external).filter((k) => external[k]))
  } catch {
    return null
  }
}

function SocialLogin() {
  const { t } = useLanguage()
  const say = (key: 'socialSoon' | 'socialUnavailable' | 'socialFailed' | 'continueWith', name: string) =>
    t(key).replace('{name}', name)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [enabled, setEnabled] = useState<Set<string> | null>(null)

  useEffect(() => {
    let alive = true
    enabledProviders().then((set) => alive && setEnabled(set))
    return () => {
      alive = false
    }
  }, [])

  const signIn = async (s: Social) => {
    setNotice('')
    if (!s.provider) {
      setNotice(say('socialSoon', s.label))
      return
    }
    // A disabled provider would send the user to a raw Supabase error page, so stop here instead
    if (enabled && !enabled.has(s.provider)) {
      setNotice(say('socialUnavailable', s.label))
      return
    }
    setBusy(s.id)
    // Leaves the page on success; comes back here on the redirect
    const { error } = await supabase.auth.signInWithOAuth({
      provider: s.provider,
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      console.error(`${s.label} sign-in error:`, error)
      setNotice(say(/not enabled|unsupported provider/i.test(error.message) ? 'socialUnavailable' : 'socialFailed', s.label))
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="flex gap-2 justify-center flex-wrap">
        {SOCIALS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => signIn(s)}
            disabled={busy !== null}
            aria-label={say('continueWith', s.label)}
            title={s.label}
            className="w-12 h-11 border border-gray-300 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-60"
          >
            {busy === s.id ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-[#1C2B4A] rounded-full animate-spin" />
            ) : (
              s.icon
            )}
          </button>
        ))}
      </div>
      {notice && (
        <p role="status" className="mt-3 text-center text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}
    </div>
  )
}

export default SocialLogin
