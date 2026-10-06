import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithLang } from '../test/render'

const svc = vi.hoisted(() => ({
  hasSession: vi.fn(),
  sendChat: vi.fn(),
  signInGuest: vi.fn(),
  key: { value: '' },
}))
vi.mock('../services/chat', () => ({
  MAX_CHARS: 1000,
  captchaSiteKey: () => svc.key.value,
  loadChat: () => [],
  saveChat: () => {},
  hasSession: svc.hasSession,
  sendChat: svc.sendChat,
  signInGuest: svc.signInGuest,
}))
vi.mock('./Captcha', () => ({ default: ({ onToken }: { onToken: (t: string) => void }) => <button onClick={() => onToken('tok')}>captcha</button> }))

const { default: ChatWidget } = await import('./ChatWidget')

const open = () => fireEvent.click(screen.getByRole('button', { name: 'Open the RONDA assistant' }))

describe('ChatWidget', () => {
  beforeEach(() => {
    svc.hasSession.mockReset().mockResolvedValue(true)
    svc.sendChat.mockReset()
    svc.signInGuest.mockReset()
    svc.key.value = ''
  })

  it('opens as a dialog with the input focused; Escape closes and returns focus to the launcher', () => {
    renderWithLang(<ChatWidget />)
    open()
    const dialog = screen.getByRole('dialog', { name: /RONDA assistant/ })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Type your question' })).toHaveFocus()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Open the RONDA assistant' })).toHaveFocus()
  })

  it('a starter question gets an answer with cards (estimate labelled, plan link)', async () => {
    svc.sendChat.mockResolvedValue({
      ok: true, guest: false, reply: 'Two hotels near LRT KLCC.',
      cards: [
        { kind: 'hotel', name: 'Hotel A', distance_m: 240, walk_min: 3, station: 'LRT KLCC', link: '/?toLat=3.15&toLon=101.71&toName=Hotel%20A' },
        { kind: 'hotel', name: 'Hotel B', distance_m: null, walk_min: null, station: null, price_estimate: 'RM 320', price_source: 'Apify harvestlabs/ai-travel-agent', link: 'https://www.booking.com/b' },
      ],
    })
    renderWithLang(<ChatWidget />)
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Hotels near LRT KLCC' }))
    expect(await screen.findByText('Two hotels near LRT KLCC.')).toBeInTheDocument()
    expect(screen.getByText('LRT KLCC · 240 m · 3 min walk')).toBeInTheDocument()
    expect(screen.getByText(/Estimate: RM 320/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Plan a trip here' })).toHaveAttribute('href', '/?toLat=3.15&toLon=101.71&toName=Hotel%20A')
    expect(screen.getByRole('link', { name: 'View on the provider’s site' })).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('rate limit: says so (guests are told logging in raises it)', async () => {
    svc.sendChat.mockResolvedValue({ ok: false, error: 'rate_limited', reason: 'hour', guest: true })
    renderWithLang(<ChatWidget />)
    open()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('limit of questions for this hour. Log in for a higher limit.')
  })

  it('error: retry sends the same question again', async () => {
    svc.sendChat.mockResolvedValueOnce({ ok: false, error: 'failed' }).mockResolvedValueOnce({ ok: true, guest: false, reply: 'Now it works.', cards: [] })
    renderWithLang(<ChatWidget />)
    open()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Now it works.')).toBeInTheDocument()
    expect(svc.sendChat).toHaveBeenCalledTimes(2)
  })

  it('guest: CAPTCHA, anonymous sign-in, then the answer and the guest hint', async () => {
    svc.hasSession.mockResolvedValue(false)
    svc.key.value = 'site-key'
    svc.signInGuest.mockResolvedValue(true)
    svc.sendChat.mockResolvedValue({ ok: true, guest: true, reply: 'Hello guest.', cards: [] })
    renderWithLang(<ChatWidget />)
    open()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    const check = await screen.findByRole('button', { name: 'captcha' })
    await act(async () => { fireEvent.click(check) })
    expect(svc.signInGuest).toHaveBeenCalledWith('tok')
    expect(await screen.findByText('Hello guest.')).toBeInTheDocument()
    expect(screen.getByText(/chatting as a guest/)).toBeInTheDocument()
  })

  it('guest without a CAPTCHA set up (or a failed check): explains and offers log-in', async () => {
    svc.hasSession.mockResolvedValue(false)
    renderWithLang(<ChatWidget />)
    open()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('guest chat isn’t available'))
    expect(svc.sendChat).not.toHaveBeenCalled()
  })

  it('Arabic labels', () => {
    renderWithLang(<ChatWidget />, { lang: 'ar' })
    fireEvent.click(screen.getByRole('button', { name: 'افتح مساعد RONDA' }))
    expect(screen.getByRole('dialog', { name: /مساعد RONDA/ })).toBeInTheDocument()
  })
})
