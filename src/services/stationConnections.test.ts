import { describe, expect, it } from 'vitest'
import { connectionsAt, stopKey } from './stationConnections'
import { LINES_BY_ID } from '../data/lines'

// a small slice of the real data: Titiwangsa (Ampang + Sri Petaling cross-platform, Monorail and MRT Putrajaya in the
// paid area) and PWTC (walk out to KTM)
const index = {
  linesAt: new Map<string, string[]>([
    ['rapid-rail-kl:AG3', ['lrt-ampang']], ['rapid-rail-kl:SP3', ['lrt-sri-petaling']],
    ['rapid-rail-kl:MR11', ['monorail']], ['rapid-rail-kl:PY17', ['mrt-putrajaya']],
    ['rapid-rail-kl:AG4', ['lrt-ampang']], ['rapid-rail-kl:SP4', ['lrt-sri-petaling']],
    ['ktmb:18800', ['ktm-seremban', 'ktm-port-klang']],
  ]),
  interchanges: [
    { stop_ids: ['rapid-rail-kl:AG3', 'rapid-rail-kl:SP3'], paid_area: true, cross_platform: true },
    { stop_ids: ['rapid-rail-kl:AG3', 'rapid-rail-kl:SP3', 'rapid-rail-kl:MR11', 'rapid-rail-kl:PY17'], paid_area: true, cross_platform: false },
    { stop_ids: ['rapid-rail-kl:AG4', 'rapid-rail-kl:SP4'], paid_area: true, cross_platform: true },
    { stop_ids: ['rapid-rail-kl:AG4', 'rapid-rail-kl:SP4', 'ktmb:18800'], paid_area: false, cross_platform: false },
  ],
}
const ids = (ls: { id: string }[]) => ls.map((l) => l.id)

describe('station connections', () => {
  it('Titiwangsa on the Ampang Line: Ampang and Sri Petaling here, Monorail and MRT Putrajaya without tapping out', () => {
    const c = connectionsAt(index, LINES_BY_ID['lrt-ampang'], stopKey('rapid-rail-kl', 'AG3'))
    expect(ids(c.here)).toEqual(['lrt-ampang', 'lrt-sri-petaling'])
    expect(ids(c.change).sort()).toEqual(['monorail', 'mrt-putrajaya'])
    expect(c.walk).toEqual([])
  })

  it('PWTC: walk out to the KTM lines', () => {
    const c = connectionsAt(index, LINES_BY_ID['lrt-sri-petaling'], stopKey('rapid-rail-kl', 'SP4'))
    expect(c.change).toEqual([])
    expect(ids(c.walk).sort()).toEqual(['ktm-port-klang', 'ktm-seremban'])
  })

  it('a station with no change shows nothing to change to', () => {
    const c = connectionsAt(index, LINES_BY_ID['lrt-ampang'], stopKey('rapid-rail-kl', 'AG12'))
    expect(c.change).toEqual([])
    expect(c.walk).toEqual([])
  })
})
