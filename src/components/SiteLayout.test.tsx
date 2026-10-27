import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The assistant's launcher appears only with VITE_AI_CHAT=on (read when the module loads)
async function layoutWith(flag: string) {
  vi.resetModules()
  vi.stubEnv('VITE_AI_CHAT', flag)
  const { default: SiteLayout } = await import('./SiteLayout')
  const { renderWithLang } = await import('../test/render') // same module copies as SiteLayout
  return { SiteLayout, renderWithLang }
}

describe('SiteLayout: chat switch', () => {
  afterEach(() => vi.unstubAllEnvs())

  // a fresh copy of the whole page frame loads for each case, which takes a while when every test runs at once
  it('flag off: no launcher, the widget is not loaded', { timeout: 20_000 }, async () => {
    const { SiteLayout, renderWithLang } = await layoutWith('off')
    renderWithLang(<SiteLayout><p>page</p></SiteLayout>)
    expect(screen.queryByRole('button', { name: 'Open the RONDA assistant' })).toBeNull()
  })

  it('flag on: the launcher is there', { timeout: 20_000 }, async () => {
    const { SiteLayout, renderWithLang } = await layoutWith('on')
    renderWithLang(<SiteLayout><p>page</p></SiteLayout>)
    expect(await screen.findByRole('button', { name: 'Open the RONDA assistant' }, { timeout: 15_000 })).toBeInTheDocument()
  })
})
