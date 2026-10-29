import type { Payment, Resident } from '../components/JourneyPanel'

// The trip settings, kept on this device (localStorage), set on the account page (Trip settings) and from the trip
// planner itself: which routes come first, whose fares, how the fare is paid, and whether to show parking at the
// station where the trip starts. Storage can be blocked: then the defaults are used and a change lasts for the visit.

export type TripSort = 'walking' | 'fastest' | 'transfers' | 'priceLow'
export const TRIP_SORTS: TripSort[] = ['walking', 'fastest', 'transfers', 'priceLow']

function read(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function save(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage blocked: the choice lasts for this visit only */ }
}

// routes with the least walking first unless the user picked another order (product default)
export const readSort = (): TripSort => {
  const v = read('ronda.sort')
  return (TRIP_SORTS as string[]).includes(v ?? '') ? (v as TripSort) : 'walking'
}
export const saveSort = (s: TripSort) => save('ronda.sort', s)

export const readResident = (): Resident => (read('ronda.resident') === 'non_citizen' ? 'non_citizen' : 'citizen')
export const saveResident = (r: Resident) => save('ronda.resident', r)

export const readPayment = (): Payment => (read('ronda.payment') === 'cash' ? 'cash' : 'cashless')
export const savePayment = (p: Payment) => save('ronda.payment', p)

// parking at the boarding station is shown unless switched off
export const readParking = (): boolean => read('ronda.parking') !== 'off'
export const saveParking = (on: boolean) => save('ronda.parking', on ? 'on' : 'off')
