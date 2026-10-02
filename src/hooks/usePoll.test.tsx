import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePoll } from './usePoll'

let visibility: DocumentVisibilityState = 'visible'
const setVisibility = (v: DocumentVisibilityState) => {
  visibility = v
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('usePoll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    visibility = 'visible'
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility)
  })
  afterEach(() => vi.useRealTimers())

  it('runs now and then every interval', () => {
    const fn = vi.fn()
    renderHook(() => usePoll(fn, 1000, 'a'))
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(3000)
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('first run happens even in a background tab, later runs wait for it to be visible', () => {
    visibility = 'hidden'
    const fn = vi.fn()
    renderHook(() => usePoll(fn, 1000, 'a'))
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(5000)
    expect(fn).toHaveBeenCalledTimes(1)
    setVisibility('visible')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('restarts when the key changes and stops when disabled or unmounted', () => {
    const fn = vi.fn()
    const { rerender, unmount } = renderHook(({ k, on }) => usePoll(fn, 1000, k, on), { initialProps: { k: 'a', on: true } })
    rerender({ k: 'b', on: true })
    expect(fn).toHaveBeenCalledTimes(2)
    rerender({ k: 'b', on: false })
    vi.advanceTimersByTime(5000)
    expect(fn).toHaveBeenCalledTimes(2)
    rerender({ k: 'b', on: true })
    unmount()
    vi.advanceTimersByTime(5000)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('always calls the latest callback', () => {
    const a = vi.fn(), b = vi.fn()
    const { rerender } = renderHook(({ f }) => usePoll(f, 1000, 'k'), { initialProps: { f: a } })
    rerender({ f: b })
    vi.advanceTimersByTime(1000)
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
  })
})
