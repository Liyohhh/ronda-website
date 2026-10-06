import { expect, test } from './mocks'
// @ts-expect-error plain JS helper shared with the build
import { buildCsp } from '../scripts/csp.mjs'

// The policy the build writes to _headers (scripts/postbuild.mjs), served with every page here: nothing the site
// loads may be blocked by it. Same env as the e2e build (playwright.config.ts).
const CSP: string = buildCsp({ VITE_SUPABASE_URL: 'https://e2e.supabase.test', VITE_MAP_PMTILES_URL: '', VITE_AI_CHAT: 'on' })

for (const path of ['/', '/?tab=lines', '/live', '/trails', '/trails/heritage', '/ronda-300', '/help/general', '/about']) {
  test(`${path}: nothing blocked by the Content-Security-Policy`, async ({ page, backend }) => {
    void backend
    await page.route('http://localhost:4173/**', async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback()
      const res = await route.fetch()
      return route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': CSP } })
    })
    await page.addInitScript(() => {
      const w = window as unknown as { __csp: string[] }
      w.__csp = []
      document.addEventListener('securitypolicyviolation', (e) => w.__csp.push(`${e.effectiveDirective} ${e.blockedURI}`))
    })
    await page.goto(path)
    await page.locator('h1, h2').first().waitFor()
    if (path === '/') await page.locator('[data-chat-launcher]').click()
    await page.waitForTimeout(1500)
    expect(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)).toEqual([])
  })
}
