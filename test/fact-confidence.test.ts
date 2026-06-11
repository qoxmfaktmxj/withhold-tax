import { describe, expect, it } from 'vitest'
import { getReferenceConfidenceSummary } from '@/lib/facts/confidence'

const baseFact = {
  id: 'f_test1',
  primarySourceVerified: false,
  verifyStatus: '확정',
}

describe('reference confidence summary', () => {
  it('separates primary-source confirmation from legacy verifyStatus', () => {
    const summary = getReferenceConfidenceSummary([
      { ...baseFact, id: 'f_000001', primarySourceVerified: true, verifyStatus: '확정' },
      { ...baseFact, id: 'f_000002', primarySourceVerified: false, verifyStatus: '확정' },
      { ...baseFact, id: 'f_000003', primarySourceVerified: false, verifyStatus: '강의기반' },
      { ...baseFact, id: 'f_000004', primarySourceVerified: false, verifyStatus: '확인필요' },
    ])

    expect(summary.total).toBe(4)
    expect(summary.primarySourceVerified).toBe(1)
    expect(summary.primarySourceUnverified).toBe(3)
    expect(summary.needsReview).toBe(1)
    expect(summary.lectureBased).toBe(1)
  })
})
