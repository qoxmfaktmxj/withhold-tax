// Check source links — HEAD/GET all lawUrls in facts.json + urls in sources.json.
// Usage: node scripts/check-source-links.mjs
// Reports status table, exits 0 (blocking disabled — report only).

import fs from 'node:fs'
import path from 'node:path'
import { URL } from 'node:url'

const ROOT = process.cwd()
const TIMEOUT_MS = 8000
const CONCURRENCY = 5

const facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/facts.json'), 'utf8'))
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/sources.json'), 'utf8'))

// Collect unique non-empty URLs
const urlSet = new Set()
for (const f of facts) {
  if (f.lawUrl && f.lawUrl.startsWith('http')) urlSet.add(f.lawUrl)
}
for (const s of sources) {
  if (s.url && s.url.startsWith('http')) urlSet.add(s.url)
}

const urls = [...urlSet]
console.log(`점검 대상 URL: ${urls.length}개 (동시 ${CONCURRENCY}, 타임아웃 ${TIMEOUT_MS / 1000}s)\n`)

/** law.go.kr는 동적로딩 — 200 응답이면 OK로만 판단 */
function isLawGovKr(url) {
  try {
    return new URL(url).hostname.includes('law.go.kr')
  } catch {
    return false
  }
}

async function checkUrl(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'withhold-tax-link-checker/1.0' },
    })
    clearTimeout(timer)

    const status = res.status
    if (isLawGovKr(url) && status === 200) return { url, status, result: 'ok' }
    if (status >= 200 && status < 300) return { url, status, result: 'ok' }
    if (status >= 300 && status < 400) return { url, status, result: 'redirect' }
    return { url, status, result: 'fail' }
  } catch (err) {
    clearTimeout(timer)
    const isTimeout = err.name === 'AbortError'
    return { url, status: isTimeout ? 'TIMEOUT' : 'ERR', result: 'fail', detail: isTimeout ? '타임아웃' : String(err.message).slice(0, 60) }
  }
}

/** Run urls in batches of CONCURRENCY */
async function runChecks(urls) {
  const results = []
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(batch.map(checkUrl))
    results.push(...batchResults)
    process.stdout.write(`.`.repeat(batchResults.length))
  }
  console.log('\n')
  return results
}

const results = await runChecks(urls)

// Print table
const COL_URL = 70
const COL_STATUS = 8
const COL_RESULT = 10

const header = `${'URL'.padEnd(COL_URL)} ${'STATUS'.padEnd(COL_STATUS)} ${'결과'.padEnd(COL_RESULT)} 비고`
const divider = '-'.repeat(header.length)
console.log(header)
console.log(divider)

const failures = []
for (const r of results) {
  const urlCol = r.url.length > COL_URL ? r.url.slice(0, COL_URL - 3) + '...' : r.url.padEnd(COL_URL)
  const statusCol = String(r.status).padEnd(COL_STATUS)
  const resultEmoji = r.result === 'ok' ? '✓ ok' : r.result === 'redirect' ? '→ redirect' : '✗ fail'
  const detail = r.detail || ''
  console.log(`${urlCol} ${statusCol} ${resultEmoji.padEnd(COL_RESULT)} ${detail}`)
  if (r.result === 'fail') failures.push(r)
}

console.log(divider)
console.log(`\n합계: 전체 ${results.length} / ok ${results.filter(r => r.result === 'ok').length} / redirect ${results.filter(r => r.result === 'redirect').length} / fail ${failures.length}`)

if (failures.length > 0) {
  console.log(`\n[FAIL 목록] (${failures.length}건 — 확인 필요, 빌드 차단은 없음)`)
  for (const f of failures) {
    console.log(`  ${f.status}  ${f.url}${f.detail ? '  ' + f.detail : ''}`)
  }
}

// exit 0 — report only, do not block CI
process.exit(0)
