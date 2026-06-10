import { describe, it, expect, vi } from 'vitest'
import { checkUrl, getExitCode, parseArgs } from '../scripts/check-source-links.mjs'

function makeResponse(status) {
  return new Response(null, { status })
}

describe('check-source-links', () => {
  it('falls back to GET when law.go.kr HEAD returns 404', async () => {
    const calls = []
    const fakeFetch = vi.fn(async (_url, init) => {
      calls.push(init)
      if (calls.length === 1) return makeResponse(404)
      return makeResponse(200)
    })

    const result = await checkUrl('https://www.law.go.kr/XYZ', { fetchImpl: fakeFetch })

    expect(result.result).toBe('ok')
    expect(result.status).toBe(200)
    expect(calls).toHaveLength(2)
    expect(calls[0].method).toBe('HEAD')
    expect(calls[1].method).toBe('GET')
  })

  it('keeps User-Agent header and uses redirect: follow for fallback GET', async () => {
    const calls = []
    const fakeFetch = vi.fn(async (_url, init) => {
      calls.push(init)
      if (calls.length === 1) return makeResponse(404)
      return makeResponse(200)
    })

    await checkUrl('https://www.law.go.kr/XYZ', { fetchImpl: fakeFetch })

    const headUA = new Headers(calls[0].headers).get('User-Agent')
    const getUA = new Headers(calls[1].headers).get('User-Agent')
    expect(headUA).toBe('withhold-tax-link-checker/1.0')
    expect(getUA).toBe(headUA)
    expect(calls[1].redirect).toBe('follow')
  })

  it('does not retry non-law URLs when HEAD is 404', async () => {
    const fakeFetch = vi.fn(async () => makeResponse(404))
    const result = await checkUrl('https://example.com/doc', { fetchImpl: fakeFetch })

    expect(result.result).toBe('fail')
    expect(fakeFetch).toHaveBeenCalledTimes(1)
  })

  it('keeps report-only exit code by default and uses strict mode for fail checks', () => {
    const failures = [{ result: 'fail' }, { result: 'ok' }]
    expect(getExitCode([], {})).toBe(0)
    expect(getExitCode(failures, { strict: false })).toBe(0)
    expect(getExitCode(failures, { strict: true })).toBe(1)
    expect(parseArgs([]).strict).toBe(false)
    expect(parseArgs(['--strict']).strict).toBe(true)
  })
})
