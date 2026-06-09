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

// Open the global ⌘K/Ctrl+K command palette and capture the panel.
await page.click('.wt-cmdk-trigger')
await page.waitForSelector('.wt-cmdk-input', { state: 'visible', timeout: 8000 })
await page.fill('.wt-cmdk-input', '납부지연')
await page.waitForSelector('.wt-cmdk-item', { timeout: 5000 })
await page.waitForTimeout(450)

const panel = page.locator('.wt-cmdk-panel')
await panel.screenshot({ path: OUT })
console.log('wrote', OUT)
await browser.close()
