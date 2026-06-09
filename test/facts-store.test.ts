import { describe, it, expect } from 'vitest'
import { loadFacts, byChapter, dashboardFacts, reviewDue, chapterSummary } from '@/lib/facts/store'
import type { Fact } from '@/lib/facts/schema'

const f = (o: Partial<Fact>): Fact => ({
  id: 'f_000001', slug: 's', title: '', chapter: 'ch3', claim: 'c', sourceType: 'NTS', sourceTitle: 't',
  lawRef: '', lawUrl: '', asOf: '2026-06-08', effectiveDate: '', verifyStatus: '확정',
  risk: 'low', changeType: '없음', previousValue: '',
  history: [{ date: '2026-06-08', author: 'kms', note: 'n' }], nextReviewBy: '',
  primarySourceVerified: false, confidenceScore: 0, subordinateLawRef: '', scopeLimitations: '',
  localTaxRef: '', supersededRefs: '', appliesFrom: '', sunsetDate: '', reviewerId: '', ...o,
})

describe('facts store', () => {
  it('loadFacts validates and throws on bad data', () => {
    expect(() => loadFacts([{ id: 'bad' } as unknown])).toThrow()
  })
  it('byChapter groups', () => {
    const list = [f({ id: 'f_000001', chapter: 'ch3' }), f({ id: 'f_000002', chapter: 'ch4' })]
    expect(byChapter(list, 'ch3')).toHaveLength(1)
  })
  it('dashboardFacts: 없음 제외, 변경 항목만 포함, 시행일 최신순', () => {
    const list = [
      f({ id: 'f_000001', changeType: '개정', effectiveDate: '2024-01-01' }),
      f({ id: 'f_000002', changeType: '없음', effectiveDate: '2026-01-01' }),
      f({ id: 'f_000003', changeType: '신설', effectiveDate: '2026-07-01' }),
    ]
    const result = dashboardFacts(list)
    expect(result).toHaveLength(2)
    expect(result.map((x) => x.id)).toEqual(['f_000003', 'f_000001'])
  })
  it('reviewDue sorts by nextReviewBy ascending, skips empty', () => {
    const list = [f({ id: 'f_000001', nextReviewBy: '2027-03-31' }), f({ id: 'f_000002', nextReviewBy: '' }), f({ id: 'f_000003', nextReviewBy: '2026-12-01' })]
    expect(reviewDue(list).map(x => x.id)).toEqual(['f_000003', 'f_000001'])
  })
  it('chapterSummary counts by status', () => {
    const list = [f({ id: 'f_000001', verifyStatus: '확정' }), f({ id: 'f_000002', verifyStatus: '확인필요' })]
    expect(chapterSummary(list)).toEqual({ 확정: 1, 확인필요: 1, 강의기반: 0, total: 2 })
  })
})
