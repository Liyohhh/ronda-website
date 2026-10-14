import { describe, expect, it } from 'vitest'
import { NAV_MENUS } from './serviceOptions'

describe('Hub menu', () => {
  it('opens the hub pages for the airports, KL Sentral and TBS', () => {
    const items = NAV_MENUS.find((m) => m.key === 'navTravel')!.columns.flatMap((c) => c.items)
    const to = (name: string) => items.find((i) => i.name === name)?.to
    expect(to('KLIA Terminal 1')).toBe('/hub/klia1')
    expect(to('KLIA Terminal 2')).toBe('/hub/klia2')
    expect(to('KL Sentral')).toBe('/hub/kl-sentral')
    expect(to('Terminal Bersepadu Selatan (TBS)')).toBe('/hub/tbs')
  })
})
