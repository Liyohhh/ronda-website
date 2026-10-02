import { useCallback, useState } from 'react'

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
  return { state, locate }
}
