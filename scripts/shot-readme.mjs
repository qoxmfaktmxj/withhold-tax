// One-off: capture 5 fresh README screenshots from the running dev server.
// Usage: node scripts/shot-readme.mjs  (dev server must be on :3000)
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = path.join(process.cwd(), 'docs/screenshots')
fs.mkdirSync(OUT, { recursive: true })

const VIEW = { width: 1440, height: 960 }

async function waitForServer(page, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 5000 })
      if (res && res.ok()) return true
    } catch {}
    await page.waitForTimeout(1500)
  }
  throw new Error('dev server not reachable at ' + BASE)
}

const shots = [
  {
    file: 'home.png',
    url: '/',
    fullPage: false,
    async prep(page) {
      // bring the "레퍼런스 상태" dashboard (링크 오류 0) into view
      await page.evaluate(() => {
        const el = document.querySelector('[aria-label="레퍼런스 상태"]')
        if (el) el.scrollIntoView({ block: 'center' })
      })
      await page.waitForTimeout(400)
    },
  },
  {
    file: 'search.png',
    url: '/',
    fullPage: false,
    async prep(page) {
      await page.keyboard.press('Control+k')
      await page.waitForTimeout(500)
      await page.keyboard.type('가산세', { delay: 30 })
      await page.waitForTimeout(700)
    },
  },
  {
    file: 'chapter-fact.png',
    url: '/ch/ch4',
    fullPage: false,
    async prep(page) {
      await page.evaluate(() => {
        const f = document.querySelector('.wt-fact, [data-fact], .wt-source-pill, figure')
        if (f) f.scrollIntoView({ block: 'center' })
      })
      await page.waitForTimeout(400)
    },
  },
  { file: 'updates-2026.png', url: '/updates-2026', fullPage: false },
  { file: 'tools.png', url: '/tools', fullPage: false },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 2 })
await waitForServer(page)

for (const s of shots) {
  await page.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(800)
  if (s.prep) await s.prep(page)
  const dest = path.join(OUT, s.file)
  await page.screenshot({ path: dest, fullPage: s.fullPage })
  console.log('shot', s.file)
}

await browser.close()
console.log('done ->', OUT)
