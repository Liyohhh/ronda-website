// Phone: when a search box gets focus, the on-screen keyboard covers the lower half of the screen and the choices
// opening under the box are hidden (owner, 4 Nov 2026). Scroll the box up to just under the sticky header, once the
// keyboard has opened, so the choices show between the box and the keyboard. Wider screens are left alone.
const HEADER = 120 // px: the sticky header with the menu row, plus a little air

export function liftOnPhone(el: HTMLElement | null) {
  if (!el || typeof window === 'undefined' || !window.matchMedia?.('(max-width: 767px)').matches) return
  window.setTimeout(() => {
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER
    if (Math.abs(top - window.scrollY) > 8) window.scrollTo({ top, behavior: 'smooth' })
  }, 250)
}
