// One-off: capture the ⌘K command-palette full-text search for the README.
// Usage: node scripts/shot-search.mjs [baseURL] [outPath]
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:3210'
const OUT = process.argv[3] || 'docs/screenshots/00-search.png'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 780 }, deviceScaleFactor: 2 })

page.on('console', (m) => console.log('[console]', m.type(), m.text()))
page.on('pageerror', (e) => console.log('[pageerror]', e.message))

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500) // hydrate

// Home inline full-text search (same index/engine as ⌘K). Rendered in normal flow —
// no fixed overlay/animation, so it rasters cleanly in headless (the ⌘K palette is
// visually correct in real browsers but the overlay layer doesn't composite in headless).
await page.fill('#fact-search', '납부지연')
await page.waitForSelector('.wt-search-item', { timeout: 5000 })
await page.waitForTimeout(400)

const search = page.locator('.wt-search')
await search.screenshot({ path: OUT })
console.log('wrote', OUT)
await browser.close()
