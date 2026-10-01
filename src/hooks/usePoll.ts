import { useEffect, useRef } from 'react'

// Run `fn` now and then every `ms`; later runs are skipped while the tab is in the background and one runs
// again as soon as it is back. `key` restarts the cycle when it changes. Off when `enabled` is false.
export function usePoll(fn: () => void, ms: number, key: string, enabled = true) {
  const latest = useRef(fn)
  useEffect(() => {
    latest.current = fn
  })
  useEffect(() => {
    if (!enabled) return
    let timer: number | undefined
    const tick = (force = false) => {
      window.clearTimeout(timer)
      if (force || document.visibilityState === 'visible') latest.current()
      timer = window.setTimeout(tick, ms)
    }
    const onVisible = () => document.visibilityState === 'visible' && tick()
    tick(true)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [ms, key, enabled])
}
