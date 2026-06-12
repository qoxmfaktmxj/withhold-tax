import { describe, it, expect } from 'vitest'
import watchlistRaw from '@/content/law-watchlist.json'
import factsRaw from '@/content/facts.json'
import { loadWatchlist, WatchItemSchema, WatchlistFileSchema } from '@/lib/watchlist'

describe('WatchItem schema', () => {
  it('accepts a valid item', () => {
    const item = WatchItemSchema.parse({
      watchId: 'watch_test_item',
      title: '테스트 감시 항목',
      expectedEffectiveDate: '2027-01-01',
      status: 'watching',
      owner: 'kms',
      nextCheckDate: '2026-12-01',
      impact: ['content'],
      notes: '테스트 메모',
      relatedFactIds: ['f_a00001'],
    })
    expect(item.watchId).toBe('watch_test_item')
    expect(item.notes).toBe('테스트 메모')
  })

  it('applies default for empty notes', () => {
    const item = WatchItemSchema.parse({
      watchId: 'watch_no_notes',
      title: '메모 없음',
      expectedEffectiveDate: '2027-06-01',
      status: 'watching',
      owner: 'kms',
      nextCheckDate: '2027-05-01',
      impact: ['reporting'],
      relatedFactIds: [],
    })
    expect(item.notes).toBe('')
  })

  it('rejects invalid watchId format (no watch_ prefix)', () => {
    expect(() =>
      WatchItemSchema.parse({
        watchId: 'invalid_id',
        title: '잘못된 ID',
        expectedEffectiveDate: '2027-01-01',
        status: 'watching',
        owner: 'kms',
        nextCheckDate: '2026-12-01',
        impact: ['content'],
        relatedFactIds: [],
      })
    ).toThrow()
  })

  it('accepts lifecycle statuses beyond simple watching', () => {
    for (const status of ['watching', 'confirmed', 'implemented', 'released', 'deferred', 'not_applicable']) {
      expect(() =>
        WatchItemSchema.parse({
          watchId: `watch_${status}`,
          title: `${status} 상태`,
          expectedEffectiveDate: '2027-01-01',
          status,
          owner: 'kms',
          nextCheckDate: '2026-12-01',
          impact: ['content'],
          relatedFactIds: [],
        })
      ).not.toThrow()
    }
  })

  it('rejects unsupported status values', () => {
    expect(() =>
      WatchItemSchema.parse({
        watchId: 'watch_bad_status',
        title: '상태 오류',
        expectedEffectiveDate: '2027-01-01',
        status: 'done',
        owner: 'kms',
        nextCheckDate: '2026-12-01',
        impact: ['content'],
        relatedFactIds: [],
      })
    ).toThrow()
  })

  it('rejects bad date format', () => {
    expect(() =>
      WatchItemSchema.parse({
        watchId: 'watch_bad_date',
        title: '날짜 형식 오류',
        expectedEffectiveDate: '2027/01/01',
        status: 'watching',
        owner: 'kms',
        nextCheckDate: '2026-12-01',
        impact: ['content'],
        relatedFactIds: [],
      })
    ).toThrow()
  })

  it('rejects empty impact array', () => {
    expect(() =>
      WatchItemSchema.parse({
        watchId: 'watch_empty_impact',
        title: '영향 없음',
        expectedEffectiveDate: '2027-01-01',
        status: 'watching',
        owner: 'kms',
        nextCheckDate: '2026-12-01',
        impact: [],
        relatedFactIds: [],
      })
    ).toThrow()
  })
})

describe('content/law-watchlist.json 시드 파싱', () => {
  it('3개 시드 항목을 파싱한다', () => {
    const items = loadWatchlist(watchlistRaw)
    expect(items).toHaveLength(3)
  })

  it('WatchlistFileSchema로 파싱 성공', () => {
    expect(() => WatchlistFileSchema.parse(watchlistRaw)).not.toThrow()
  })

  it('watchId가 모두 유니크하다', () => {
    const items = loadWatchlist(watchlistRaw)
    const ids = items.map((i) => i.watchId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('시드 항목의 status는 lifecycle enum 안에 있고 확인된 항목을 구분한다', () => {
    const items = loadWatchlist(watchlistRaw)
    const allowed = new Set(['watching', 'confirmed', 'implemented', 'released', 'deferred', 'not_applicable'])

    for (const item of items) {
      expect(allowed.has(item.status)).toBe(true)
    }
    expect(items.map((item) => item.status)).toContain('confirmed')
  })

  it('watch_2027_dividend_grossup 항목이 존재한다', () => {
    const items = loadWatchlist(watchlistRaw)
    const item = items.find((i) => i.watchId === 'watch_2027_dividend_grossup')
    expect(item).toBeDefined()
    expect(item?.expectedEffectiveDate).toBe('2027-01-01')
    expect(item?.impact).toContain('calculation')
  })

  it('확인 완료된 법인세법 제한세율 제출의무 항목은 watchlist에 남기지 않는다', () => {
    const items = loadWatchlist(watchlistRaw)
    expect(items.find((i) => i.watchId === 'watch_2026_corp_treaty_filing')).toBeUndefined()
  })
})

describe('relatedFactIds → content/facts.json 무결성', () => {
  it('모든 relatedFactIds가 facts.json에 실제로 존재한다', () => {
    const items = loadWatchlist(watchlistRaw)
    const knownIds = new Set((factsRaw as Array<{ id: string }>).map((f) => f.id))
    const missing: string[] = []
    for (const item of items) {
      for (const fid of item.relatedFactIds) {
        if (!knownIds.has(fid)) {
          missing.push(`${item.watchId} → ${fid}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})
