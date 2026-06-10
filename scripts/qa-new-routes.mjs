// Smoke QA for the internal-reference feature batch (calculators/calendar/screen-guides/sources).
// node scripts/qa-new-routes.mjs [baseURL]
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:3220'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
const errs = []
page.on('console', (m) => m.type() === 'error' && errs.push(`[console] ${m.text()}`))
page.on('pageerror', (e) => errs.push(`[pageerror] ${e.message}`))

const routes = [
  '/', '/calculators', '/calculators/penalty', '/calculators/business-income',
  '/calendar', '/screen-guides', '/screen-guides/nonresident-payment',
  '/screen-guides/business-income-payment', '/sources', '/updates-2026',
  '/ch/ch9', '/ch/ch10',
]
const report = {}
for (const r of routes) {
  const resp = await page.goto(BASE + r, { waitUntil: 'networkidle' })
  report[r] = resp.status()
}

// penalty calculator interaction
await page.goto(BASE + '/calculators/penalty', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.fill('#pc-unpaid', '1000000')
await page.fill('#pc-due', '2026-01-10')
await page.fill('#pc-pay', '2026-04-20')
await page.waitForTimeout(300)
const penaltyText = await page.locator('article').innerText()
const has52k = penaltyText.includes('52,000원') // 100일 지연 = 3% + 2.2% = 52,000
report['penalty-calc-100days-52000'] = has52k

// business income calculator
await page.goto(BASE + '/calculators/business-income', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.fill('#bc-gross', '1000000')
await page.waitForTimeout(300)
const bizText = await page.locator('article').innerText()
report['biz-calc-33000'] = bizText.includes('33,000원') && bizText.includes('30,000원')

// nonresident screen guide renders fact citation
await page.goto(BASE + '/screen-guides/nonresident-payment', { waitUntil: 'networkidle' })
const guideText = await page.locator('article').innerText()
report['guide-has-156-6'] = guideText.includes('156조의6')

// updates-2026 watchlist visible
await page.goto(BASE + '/updates-2026', { waitUntil: 'networkidle' })
const updText = await page.locator('.wt-article').innerText()
report['watchlist-visible'] = updText.includes('감시 목록')
report['updates-has-installment'] = updText.includes('분납')

await browser.close()
console.log(JSON.stringify({ report, errors: errs.slice(0, 10) }, null, 2))
