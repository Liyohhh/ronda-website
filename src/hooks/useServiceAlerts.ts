import { useEffect, useState } from 'react'
import { loadLiveAlerts, type ServiceAlert } from '../services/serviceAlerts'

// Alerts in force, by line slug ('lrt-ampang' -> its alerts). Empty while loading or when the load fails: alerts add
// to a trip, they never block it.
export function useServiceAlerts(enabled = true) {
  const [byLine, setByLine] = useState<Record<string, ServiceAlert[]>>({})
  useEffect(() => {
    if (!enabled) return
    let live = true
    loadLiveAlerts()
      .then((alerts) => {
        if (!live) return
        const map: Record<string, ServiceAlert[]> = {}
        for (const a of alerts) for (const id of a.line_ids) (map[id] ??= []).push(a)
        setByLine(map)
      })
      .catch(() => {})
    return () => { live = false }
  }, [enabled])
  return byLine
}
