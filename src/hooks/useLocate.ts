import { useCallback, useEffect, useState } from 'react'

// One-off "where am I": asks the browser for the position when locate() is called (never on page load, so the
// permission prompt only appears after the rider asks for it). Every failure has a reason the UI can explain.
export type LocateError = 'unsupported' | 'denied' | 'unavailable' | 'timeout'
export type LocateState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'found'; lat: number; lon: number; accuracy_m: number }
  | { status: 'error'; reason: LocateError }

const TIMEOUT_MS = 10_000

export function locateErrorReason(code: number): LocateError {
  // GeolocationPositionError: 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT
  return code === 1 ? 'denied' : code === 3 ? 'timeout' : 'unavailable'
}

export function useLocate(onFound?: (lat: number, lon: number) => void) {
  const [state, setState] = useState<LocateState>({ status: 'idle' })
  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'error', reason: 'unsupported' })
      return
    }
    setState({ status: 'locating' })
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setState({ status: 'found', lat: p.coords.latitude, lon: p.coords.longitude, accuracy_m: Math.round(p.coords.accuracy) })
        onFound?.(p.coords.latitude, p.coords.longitude)
      },
      (e) => setState({ status: 'error', reason: locateErrorReason(e.code) }),
      { enableHighAccuracy: true, timeout: TIMEOUT_MS, maximumAge: 60_000 },
    )
  }, [onFound])

  // Blocked: a site cannot show the browser's question again, but if the rider turns location back on in the
  // browser's settings while the page is open, try again by itself (owner, 4 Nov 2026)
  const denied = state.status === 'error' && state.reason === 'denied'
  useEffect(() => {
    if (!denied || typeof navigator === 'undefined' || !navigator.permissions?.query) return
    let status: PermissionStatus | null = null
    const onChange = () => { if (status?.state === 'granted') locate() }
    navigator.permissions.query({ name: 'geolocation' }).then((s) => { status = s; s.addEventListener('change', onChange) }).catch(() => {})
    return () => status?.removeEventListener('change', onChange)
  }, [denied, locate])

  return { state, locate }
}
