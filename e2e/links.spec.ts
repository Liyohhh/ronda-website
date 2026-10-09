import type { Page } from '@playwright/test'
import { expect, test } from './mocks'

// Every page in every language: each internal link opens a real page (not "Page not found") and lands on its
// #section when it has one; every visible button does something when clicked (the page changes, the address
// changes, or focus moves). Desktop only: the phone layout uses the same links and buttons.
const ROUTES = [
  '/', '/?tab=lines', '/about', '/help', '/help/payments', '/help/general', '/help/policies', '/services', '/trails',
  '/trails/heritage', '/ronda-300', '/live', '/credits', '/login', '/register', '/no-such-page',
]
const LANGS = ['en', 'ms', 'zh', 'ar'] as const
const NOT_FOUND = ['Page not found', 'Halaman tidak dijumpai', '找不到页面', 'الصفحة غير موجودة']
// hashes Home turns into an action rather than a scroll target
const HOME_ACTIONS: Record<string, string> = { '#plan-end': 'plan' }

async function gotoIn(page: Page, path: string, lang: string) {
  await page.addInitScript((l) => localStorage.setItem('ronda-lang', l), lang)
  await page.goto(path)
  await page.locator('h1, h2').first().waitFor()
}

test.describe('links and buttons', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'desktop', 'desktop only'))

  for (const lang of LANGS) {
    test(`every internal link works (${lang})`, async ({ page, backend }) => {
      test.setTimeout(240_000)
      void backend
      const hrefs = new Set<string>()
      for (const r of ROUTES) {
        await gotoIn(page, r, lang)
        for (const h of await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))) {
          if (h.startsWith('/')) hrefs.add(h)
          else expect(h, `external link on ${r}`).toMatch(/^(https:\/\/|mailto:)/)
        }
      }
      const broken: string[] = []
      for (const h of [...hrefs].sort()) {
        await gotoIn(page, h, lang)
        const title = (await page.locator('h1').first().textContent().catch(() => '')) ?? ''
        if (NOT_FOUND.includes(title.trim()) && !h.startsWith('/no-such-page')) broken.push(`${h}: not found`)
        const hash = new URL(h, 'http://x').hash
        if (hash) {
          const id = (HOME_ACTIONS[hash] ?? hash).replace('#', '')
          if (!(await page.locator(`[id="${id}"]`).count())) broken.push(`${h}: no #${id} on the page`)
        }
      }
      expect(broken, `checked ${hrefs.size} links`).toEqual([])
    })
  }

  test('every visible button does something (en)', async ({ page, backend }) => {
    test.setTimeout(420_000)
    void backend
    const dead: string[] = []
    for (const r of ROUTES) {
      await gotoIn(page, r, 'en')
      const home = new URL(page.url()).pathname
      const n = await page.locator('button').count()
      // last to first: a tab, pill or arrow that is already in its state gets clicked after its siblings moved away
      for (let k = n - 1; k >= 0; k--) {
        if (new URL(page.url()).pathname !== home) await gotoIn(page, r, 'en')
        // click button k inside the page; "dead" = no DOM change, no address change, no focus move, no event
        const res = await page.evaluate(async (k: number) => {
          const b = document.querySelectorAll<HTMLButtonElement>('button')[k]
          if (!b || b.disabled || b.closest('[inert], [aria-hidden="true"]') || !(b.offsetWidth || b.offsetHeight) || getComputedStyle(b).visibility === 'hidden') return 'skip'
          if (b.type === 'submit' && b.form) return 'skip' // form submits are covered by the journey tests
          if (b.getAttribute('aria-pressed') === 'true') return 'skip' // already the selected tab: nothing to change
          const href = location.href
          let changed = 0
          const mo = new MutationObserver((m) => { changed += m.length })
          mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
          const focusBefore = document.activeElement
          let event = false
          const onEvent = () => { event = true }
          window.addEventListener('ronda:open-language', onEvent)
          document.addEventListener('scroll', onEvent, true)
          b.click()
          await new Promise((res) => setTimeout(res, 500))
          mo.disconnect()
          window.removeEventListener('ronda:open-language', onEvent)
          document.removeEventListener('scroll', onEvent, true)
          if (location.href !== href || changed || document.activeElement !== focusBefore || event) return 'ok'
          return 'dead:' + ((b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 40) || 'button #' + k)
        }, k).catch(() => 'ok') // the click loaded another document (e.g. Google sign-in): it did something
        if (res.startsWith('dead:')) dead.push(`${r}: ${res.slice(5)}`)
      }
    }
    expect(dead).toEqual([])
  })
})
