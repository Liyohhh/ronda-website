import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

// A guest session (anonymous sign-in, used only by the chat assistant) is not a log-in
export const realSession = (s: Session | null) => (s && !s.user?.is_anonymous ? s : null)

// The signed-in session, and whether it is still being read (null session + loading = don't know yet)
export function useAuth() {
  const [state, setState] = useState<{ session: Session | null; loading: boolean }>({ session: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setState({ session: realSession(data.session), loading: false }))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setState({ session: realSession(s), loading: false }))
    return () => data.subscription.unsubscribe()
  }, [])

  return state
}

export function useSession() {
  return useAuth().session
}

// Roles live in the user's app_metadata, which only the server (service role) can set; users cannot edit it
export type Role = 'admin' | 'merchant'
export function hasRole(session: Session | null, role: Role) {
  const r = session?.user?.app_metadata?.role
  return r === 'admin' || r === role
}
