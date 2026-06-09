// Broad QA sweep: console/page errors per route + palette/deep-link/contrast checks.
// node scripts/qa-check.mjs [baseURL]
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:3217'
const browser = await chromium.launch()
const routes = ['/', '/ch/ch1', '/ch/ch4', '/ch/ch9', '/ch/nonresident', '/updates-2026', '/review-due', '/ch/glossary']
const report = []

for (const r of routes) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 1 })
  const errs = []
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  page.on('pageerror', (e) => errs.push('PAGEERR ' + e.message))
  page.on('requestfailed', (req) => errs.push('REQFAIL ' + req.url().split('/').pop()))
  const resp = await page.goto(BASE + r, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  report.push({ route: r, status: resp.status(), errors: errs.slice(0, 6) })
  await page.close()
}

// Detailed checks on a chapter page
const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 1 })
await page.goto(BASE + '/ch/ch4', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

// home inline search removed?
const homeNoInline = await (async () => {
  const p2 = await browser.newPage()
  await p2.goto(BASE + '/', { waitUntil: 'networkidle' })
  await p2.waitForTimeout(500)
  const hasInline = await p2.locator('#fact-search').count()
  const hasTrigger = await p2.locator('.wt-cmdk-trigger').count()
  await p2.close()
  return { inlineSearch: hasInline, sidebarTrigger: hasTrigger }
})()

// palette opaque + portal to body?
await page.keyboard.press('Control+k')
await page.waitForTimeout(300)
const palette = await page.evaluate(() => {
  const o = document.querySelector('.wt-cmdk-overlay')
  const p = document.querySelector('.wt-cmdk-panel')
  return o && p ? {
    open: true,
    parentIsBody: o.parentElement === document.body,
    panelBg: getComputedStyle(p).backgroundColor,
    overlayBg: getComputedStyle(o).backgroundColor,
  } : { open: false }
})

// deep-link nav + scroll
await page.fill('.wt-cmdk-input', '연분연승')
await page.waitForSelector('.wt-cmdk-item', { timeout: 4000 })
await page.locator('.wt-cmdk-item').first().click()
await page.waitForTimeout(1200)
const nav = await page.evaluate(() => {
  const id = decodeURIComponent(location.hash.slice(1))
  const el = id && document.getElementById(id)
  return { path: location.pathname, hash: id, scrolledTop: el ? Math.round(el.getBoundingClientRect().top) : null }
})

// dark formula contrast on ch9
await page.goto(BASE + '/ch/ch9', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const formula = await page.evaluate(() => {
  const f = document.querySelector('.wt-formula')
  if (!f) return null
  const p = f.querySelector('p') || f
  return { bg: getComputedStyle(f).backgroundColor, color: getComputedStyle(p).color }
})

await browser.close()
console.log(JSON.stringify({ report, homeNoInline, palette, nav, formula }, null, 2))
