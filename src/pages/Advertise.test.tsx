import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithLang } from '../test/render'

// the insert is a stub (no Supabase here); the page frame is skipped
const insert = vi.fn()
vi.mock('../services/supabase', () => ({ supabase: { from: () => ({ insert: (row: unknown) => insert(row) }) } }))
vi.mock('../components/SiteLayout', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }))

const { default: Advertise } = await import('./Advertise')

async function fillStep1(u: ReturnType<typeof userEvent.setup>, business = 'shop') {
  await u.type(screen.getByLabelText('Your name'), 'Aina Rahman')
  await u.type(screen.getByLabelText('Company or business'), 'Kopi Pasar Seni')
  await u.type(screen.getByLabelText('Email address'), 'aina@example.test')
  await u.selectOptions(screen.getByLabelText('Type of business'), business)
  await u.click(screen.getByRole('button', { name: 'Next' }))
}

describe('Advertise', () => {
  beforeEach(() => { insert.mockReset().mockResolvedValue({ error: null }) })

  it('stays on step 1 and marks the empty fields', async () => {
    renderWithLang(<Advertise />)
    const u = userEvent.setup()
    await u.type(screen.getByLabelText('Email address'), 'not-an-email')
    await u.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Please check the fields marked below.')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Type of business')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
  })

  it('needs the consent box before sending', async () => {
    renderWithLang(<Advertise />)
    const u = userEvent.setup()
    await fillStep1(u)
    await u.selectOptions(screen.getByLabelText('What are you interested in?'), 'other')
    await u.type(screen.getByLabelText('Message'), 'A café 3 minutes from Pasar Seni')
    await u.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(screen.getByText('Please tick this box so we can reply to you.')).toBeInTheDocument()
    expect(insert).not.toHaveBeenCalled()
  })

  it('sends the enquiry and says thank you', async () => {
    renderWithLang(<Advertise />, { lang: 'en' })
    const u = userEvent.setup()
    await fillStep1(u, 'hotel')
    await u.selectOptions(screen.getByLabelText('What are you interested in?'), 'ronda300')
    await u.type(screen.getByLabelText('Message'), 'A café 3 minutes from Pasar Seni')
    await u.click(screen.getByRole('checkbox'))
    await u.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(await screen.findByText('Thank you, your enquiry was sent')).toBeInTheDocument()
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      business_type: 'hotel', name: 'Aina Rahman', company: 'Kopi Pasar Seni', email: 'aina@example.test',
      phone: null, interest: 'ronda300', consent: true,
    }))
  })

  it('says so when sending fails and keeps what was typed', async () => {
    insert.mockResolvedValue({ error: { message: 'offline' } })
    renderWithLang(<Advertise />)
    const u = userEvent.setup()
    await fillStep1(u)
    await u.selectOptions(screen.getByLabelText('What are you interested in?'), 'trails')
    await u.type(screen.getByLabelText('Message'), 'Hello')
    await u.click(screen.getByRole('checkbox'))
    await u.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(await screen.findByText('Your enquiry could not be sent. Check your connection and try again.')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toHaveValue('Hello')
  })

  it('reads right to left in Arabic', () => {
    renderWithLang(<Advertise />, { lang: 'ar' })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('أعلن مع Ronda2Go')
    expect(screen.getByRole('button', { name: /التالي/ })).toBeInTheDocument()
  })
})
