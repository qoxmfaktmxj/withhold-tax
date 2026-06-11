import { describe, it, expect, vi } from 'vitest'
import {
  checkUrl,
  getExitCode,
  parseArgs,
  validateReferenceUrlPolicy,
} from '../scripts/check-source-links.mjs'

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

  it('falls back to GET when nts.go.kr content pages reject HEAD with 400', async () => {
    const calls = []
    const fakeFetch = vi.fn(async (_url, init) => {
      calls.push(init)
      if (calls.length === 1) return makeResponse(400)
      return makeResponse(200)
    })

    const result = await checkUrl('https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2289&cntntsId=7701', {
      fetchImpl: fakeFetch,
    })

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
    expect(headUA).toBe('Mozilla/5.0 (compatible; withhold-tax-link-checker/1.0)')
    expect(getUA).toBe(headUA)
    expect(calls[1].redirect).toBe('follow')
  })

  it('falls back to GET for non-law URLs and fails only when GET also fails', async () => {
    const fakeFetch = vi.fn(async () => makeResponse(404))
    const result = await checkUrl('https://example.com/doc', { fetchImpl: fakeFetch })

    expect(result.result).toBe('fail')
    expect(fakeFetch).toHaveBeenCalledTimes(2)
  })

  it('accepts non-law URLs when HEAD fails but GET succeeds', async () => {
    const fakeFetch = vi.fn(async (_url, init) => {
      if (init.method === 'HEAD') return makeResponse(404)
      return makeResponse(200)
    })

    const result = await checkUrl('https://www.lawtimes.co.kr/news/206754', { fetchImpl: fakeFetch })

    expect(result.result).toBe('ok')
    expect(result.status).toBe(200)
  })

  it('retries transient fetch failures before marking the link failed', async () => {
    const fakeFetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(makeResponse(200))

    const result = await checkUrl('https://www.korea.kr', {
      fetchImpl: fakeFetch,
      retryDelayMs: 0,
    })

    expect(result.result).toBe('ok')
    expect(result.status).toBe(200)
    expect(fakeFetch).toHaveBeenCalledTimes(2)
  })

  it('keeps report-only exit code by default and uses strict mode for fail checks', () => {
    const failures = [{ result: 'fail' }, { result: 'ok' }]
    expect(getExitCode([], {})).toBe(0)
    expect(getExitCode(failures, { strict: false })).toBe(0)
    expect(getExitCode(failures, { strict: true })).toBe(1)
    expect(parseArgs([]).strict).toBe(false)
    expect(parseArgs(['--strict']).strict).toBe(true)
  })

  it('flags facts that reference unknown sourceIds', () => {
    const issues = validateReferenceUrlPolicy({
      facts: [
        {
          id: 'f_test01',
          sourceType: 'LAW',
          lawUrl: 'https://www.law.go.kr/법령/소득세법',
          sourceIds: ['src_missing'],
        },
      ],
      sources: [
        {
          id: 'src_law_go_kr',
          type: 'LAW',
          url: 'https://www.law.go.kr',
        },
      ],
    })

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_source_id',
        id: 'f_test01',
        detail: 'src_missing',
      })
    )
  })

  it('allows empty source URLs only for lecture or book sources', () => {
    const issues = validateReferenceUrlPolicy({
      facts: [],
      sources: [
        { id: 'src_lecture', type: 'LECTURE', url: '' },
        { id: 'src_book', type: 'BOOK', url: '' },
        { id: 'src_law_empty', type: 'LAW', url: '' },
      ],
    })

    expect(issues.map((issue) => issue.id)).toEqual(['src_law_empty'])
    expect(issues[0].code).toBe('source_url_required')
  })

  it('validates official source URL domains by source type', () => {
    const issues = validateReferenceUrlPolicy({
      facts: [],
      sources: [
        { id: 'src_law_bad', type: 'LAW', url: 'https://example.com/law' },
        { id: 'src_nts_ok', type: 'NTS_GUIDE', url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do' },
        { id: 'src_moef_ok', type: 'NTS_GUIDE', url: 'https://www.moef.go.kr' },
        { id: 'src_hometax_ok', type: 'NTS_FORM', url: 'https://www.hometax.go.kr' },
        { id: 'src_taxlaw_ok', type: 'TAX_RULING', url: 'https://taxlaw.nts.go.kr' },
      ],
    })

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'source_url_unexpected_host',
        id: 'src_law_bad',
      })
    )
    expect(issues.map((issue) => issue.id)).not.toContain('src_nts_ok')
    expect(issues.map((issue) => issue.id)).not.toContain('src_moef_ok')
    expect(issues.map((issue) => issue.id)).not.toContain('src_hometax_ok')
    expect(issues.map((issue) => issue.id)).not.toContain('src_taxlaw_ok')
  })

  it('requires non-book and non-lecture facts to keep a URL-shaped lawUrl', () => {
    const issues = validateReferenceUrlPolicy({
      facts: [
        { id: 'f_law_empty', sourceType: 'LAW', lawUrl: '', sourceIds: [] },
        { id: 'f_book_empty', sourceType: 'BOOK', lawUrl: '', sourceIds: [] },
        { id: 'f_nts_bad', sourceType: 'NTS', lawUrl: 'not-a-url', sourceIds: [] },
      ],
      sources: [],
    })

    expect(issues).toContainEqual(expect.objectContaining({ code: 'fact_law_url_required', id: 'f_law_empty' }))
    expect(issues).toContainEqual(expect.objectContaining({ code: 'fact_law_url_invalid', id: 'f_nts_bad' }))
    expect(issues.map((issue) => issue.id)).not.toContain('f_book_empty')
  })
})
