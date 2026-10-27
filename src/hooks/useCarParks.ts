import { useEffect, useState } from 'react'
import { loadCarParks, type CarPark } from '../services/parking'

// every car park at and near rail stations (one request per visit); null while loading
export function useCarParks() {
  const [all, setAll] = useState<CarPark[] | null | 'error'>(null)
  useEffect(() => {
    let live = true
    loadCarParks().then((r) => live && setAll(r)).catch(() => live && setAll('error'))
    return () => {
      live = false
    }
  }, [])
  return all
}
