// Check source links for facts/source JSON items.
// Usage: node scripts/check-source-links.mjs
// Reports status table; report-only default. Use --strict to exit 1 on failures.

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL, URL } from 'node:url'

const TIMEOUT_MS = 8000
const CONCURRENCY = 5
const USER_AGENT = 'withhold-tax-link-checker/1.0'

function makeResult({ url, status, result, detail }) {
  return { url, status, result, detail }
}

/** law.go.kr deeplink: treat false 404 from HEAD as requiring GET fallback check. */
export function isLawGovKr(url) {
  try {
    return new URL(url).hostname.includes('law.go.kr')
  } catch {
    return false
  }
}

export function parseArgs(argv = process.argv.slice(2)) {
  return { strict: argv.includes('--strict') }
}

function safeJsonParse(text) {
  return JSON.parse(text)
}

export function collectSourceUrls({
  root = process.cwd(),
  readFile = fs.readFileSync,
  parse = safeJsonParse,
} = {}) {
  const facts = parse(readFile(path.join(root, 'content/facts.json'), 'utf8'))
  const sources = parse(readFile(path.join(root, 'content/sources.json'), 'utf8'))
  const urlSet = new Set()

  for (const f of facts) {
    if (f.lawUrl && f.lawUrl.startsWith('http')) urlSet.add(f.lawUrl)
  }
  for (const s of sources) {
    if (s.url && s.url.startsWith('http')) urlSet.add(s.url)
  }

  return [...urlSet]
}

async function fetchStatus(url, options) {
  const { timeoutMs, method, redirect, userAgent, fetchImpl } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(url, {
      method,
      signal: controller.signal,
      redirect,
      headers: { 'User-Agent': userAgent },
    })
    clearTimeout(timer)
    return { status: res.status, redirected: res.redirected, ok: true, detail: null }
  } catch (err) {
    clearTimeout(timer)
    if (err?.name === 'AbortError') {
      return { status: 'TIMEOUT', redirected: false, ok: false, detail: String(err.message).slice(0, 60) }
    }
    return { status: 'ERR', redirected: false, ok: false, detail: String(err.message || err).slice(0, 60) }
  }
}

function classifyStatus(url, status) {
  if (status >= 200 && status < 300) return makeResult({ url, status, result: 'ok' })
  if (status >= 300 && status < 400) return makeResult({ url, status, result: 'redirect' })
  return makeResult({ url, status, result: 'fail' })
}

export async function checkUrl(
  url,
  {
    timeoutMs = TIMEOUT_MS,
    fetchImpl = globalThis.fetch,
    userAgent = USER_AGENT,
    headRedirectMode = 'manual',
    getRedirectMode = 'follow',
  } = {}
) {
  const head = await fetchStatus(url, {
    timeoutMs,
    method: 'HEAD',
    redirect: headRedirectMode,
    userAgent,
    fetchImpl,
  })

  if (!head.ok) {
    if (!isLawGovKr(url)) return makeResult({ url, status: head.status, result: 'fail', detail: head.detail })
  } else if (head.status >= 200 && head.status < 300) {
    return makeResult({ url, status: head.status, result: 'ok' })
  } else if (head.status >= 300 && head.status < 400) {
    return makeResult({ url, status: head.status, result: 'redirect' })
  }

  const shouldFallback = isLawGovKr(url) && (head.status === 404 || head.status >= 500)
  if (!shouldFallback) return makeResult({ url, status: head.status, result: 'fail', detail: head.detail })

  const fallback = await fetchStatus(url, {
    timeoutMs,
    method: 'GET',
    redirect: getRedirectMode,
    userAgent,
    fetchImpl,
  })
  if (!fallback.ok) return makeResult({ url, status: fallback.status, result: 'fail', detail: fallback.detail })

  return classifyStatus(url, fallback.status)
}

/** Run urls in batches of CONCURRENCY */
export async function runChecks(urls, {
  concurrency = CONCURRENCY,
  checkUrlOptions = {},
} = {}) {
  const results = []
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map((url) => checkUrl(url, checkUrlOptions)))
    results.push(...batchResults)
    process.stdout.write(`.`.repeat(batchResults.length))
  }
  process.stdout.write('\n')
  return results
}

export function countFailures(results) {
  return results.filter((r) => r.result === 'fail').length
}

export function getExitCode(results, { strict = false } = {}) {
  return strict && countFailures(results) > 0 ? 1 : 0
}

export function printReport(results) {
  const COL_URL = 70
  const COL_STATUS = 8
  const COL_RESULT = 10

  const header = `${'URL'.padEnd(COL_URL)} ${'STATUS'.padEnd(COL_STATUS)} ${'RESULT'.padEnd(COL_RESULT)} DETAILS`
  const divider = '-'.repeat(header.length)
  console.log(header)
  console.log(divider)

  const failures = []
  for (const r of results) {
    const urlCol = r.url.length > COL_URL ? r.url.slice(0, COL_URL - 3) + '...' : r.url.padEnd(COL_URL)
    const statusCol = String(r.status).padEnd(COL_STATUS)
    const detail = r.detail || ''
    console.log(`${urlCol} ${statusCol} ${String(r.result).padEnd(COL_RESULT)} ${detail}`)
    if (r.result === 'fail') failures.push(r)
  }

  console.log(divider)
  console.log(`\nTotal: ${results.length} / ok ${results.filter((r) => r.result === 'ok').length} / redirect ${results.filter((r) => r.result === 'redirect').length} / fail ${failures.length}`)
  if (failures.length > 0) {
    console.log(`\n[FAIL LIST] (${failures.length}건)`)
    for (const f of failures) {
      console.log(`  ${f.status}  ${f.url}${f.detail ? '  ' + f.detail : ''}`)
    }
  }
}

async function runFromCli(argv = process.argv.slice(2)) {
  const { strict } = parseArgs(argv)
  const urls = collectSourceUrls({ root: process.cwd() })
  console.log(`Check targets: ${urls.length} URLs (concurrency ${CONCURRENCY}, timeout ${TIMEOUT_MS / 1000}s)\n`)

  const results = await runChecks(urls)
  printReport(results)
  process.exit(getExitCode(results, { strict }))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runFromCli()
}
