import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { locateErrorReason, useLocate } from './useLocate'

const setGeo = (geo: unknown) => Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true })
afterEach(() => setGeo(undefined))

describe('useLocate', () => {
  it('maps browser error codes to reasons', () => {
    expect(locateErrorReason(1)).toBe('denied')
    expect(locateErrorReason(2)).toBe('unavailable')
    expect(locateErrorReason(3)).toBe('timeout')
  })

  it('does nothing until asked, then reports the position', () => {
    const onFound = vi.fn()
    const getCurrentPosition = vi.fn((ok: PositionCallback) => ok({ coords: { latitude: 3.15, longitude: 101.7, accuracy: 12.4 } } as GeolocationPosition))
    setGeo({ getCurrentPosition })
    const { result } = renderHook(() => useLocate(onFound))
    expect(result.current.state).toEqual({ status: 'idle' })
    expect(getCurrentPosition).not.toHaveBeenCalled()
    act(() => result.current.locate())
    expect(result.current.state).toEqual({ status: 'found', lat: 3.15, lon: 101.7, accuracy_m: 12 })
    expect(onFound).toHaveBeenCalledWith(3.15, 101.7)
  })

  it('permission denied', () => {
    setGeo({ getCurrentPosition: (_ok: PositionCallback, err: PositionErrorCallback) => err({ code: 1 } as GeolocationPositionError) })
    const { result } = renderHook(() => useLocate())
    act(() => result.current.locate())
    expect(result.current.state).toEqual({ status: 'error', reason: 'denied' })
  })

  it('no geolocation in the browser', () => {
    setGeo(undefined)
    const { result } = renderHook(() => useLocate())
    act(() => result.current.locate())
    expect(result.current.state).toEqual({ status: 'error', reason: 'unsupported' })
  })

  it('shows locating while waiting', () => {
    setGeo({ getCurrentPosition: () => {} })
    const { result } = renderHook(() => useLocate())
    act(() => result.current.locate())
    expect(result.current.state).toEqual({ status: 'locating' })
  })
})
