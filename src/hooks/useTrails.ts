import { useEffect, useState } from 'react'
import { loadTrails } from '../services/trails'
import type { TrailData } from '../data/trails'

// Trails from the database: data = null while loading; error = the load failed (pages show a message)
export function useTrails() {
  const [state, setState] = useState<{ data: TrailData | null; error: boolean }>({ data: null, error: false })
  useEffect(() => {
    let live = true
    loadTrails()
      .then((data) => live && setState({ data, error: false }))
      .catch(() => live && setState({ data: null, error: true }))
    return () => { live = false }
  }, [])
  return state
}
