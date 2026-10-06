// Contrast of the home hero text against the photo behind it (W2): hides the text, screenshots the area behind
// the headline and the subtitle, and compares white text with the lightest background pixels.
//   node scripts/hero-contrast.mjs [base url]      (default http://localhost:5173; needs the site running)
// WCAG: large text (headline) >= 3:1, normal text (subtitle) >= 4.5:1, required for the worst pixel. The text shadow is hidden too, so the
// numbers are conservative.
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const lum = (r, g, b) => {
  const c = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
}
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'msedge' })
const results = []
for (const width of [375, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  await page.goto(BASE + '/')
  await page.waitForFunction(() => { const i = document.querySelector('picture img'); return !!i && i.complete && i.naturalWidth > 0 })
  await page.waitForTimeout(300)
  for (const [sel, name, alpha, need] of [['main h1, h1', 'headline', 1, 3], ['h1 + p', 'subtitle', 0.95, 4.5]]) {
    const el = page.locator(sel).first()
    await el.evaluate((n) => { n.style.color = 'transparent'; n.style.textShadow = 'none' })
    const png = await el.screenshot()
    await el.evaluate((n) => { n.style.color = ''; n.style.textShadow = '' })
    const px = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
      const x = c.getContext('2d'); x.drawImage(img, 0, 0)
      return Array.from(x.getImageData(0, 0, c.width, c.height).data)
    }, png.toString('base64'))
    const ratios = []
    for (let i = 0; i < px.length; i += 4) {
      const [r, g, b] = [px[i], px[i + 1], px[i + 2]]
      // text colour: white at `alpha` over this pixel
      const t = [r, g, b].map((v) => 255 * alpha + v * (1 - alpha))
      ratios.push(contrast(lum(...t), lum(r, g, b)))
    }
    ratios.sort((a, b) => a - b)
    const worst = ratios[0], p5 = ratios[Math.floor(ratios.length * 0.05)]
    results.push({ width, text: name, worst: +worst.toFixed(2), p5: +p5.toFixed(2), need, pass: worst >= need })
  }
  await page.close()
}
await browser.close()
console.table(results)
process.exit(results.every((r) => r.pass) ? 0 : 1)
