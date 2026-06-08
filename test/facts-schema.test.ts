import { describe, it, expect } from 'vitest'
import { FactSchema } from '@/lib/facts/schema'

const valid = {
  id: 'f_a1b2c3', slug: 'ch03.small-amount.personal-service',
  chapter: 'ch3', claim: '...', sourceType: 'NTS', sourceTitle: '국세청 원천징수 개요',
  lawRef: '소득세법 제86조', lawUrl: '', asOf: '2026-06-08', effectiveDate: '2024-07-01',
  verifyStatus: '확정', risk: 'high', changeType: '개정', previousValue: '',
  history: [{ date: '2026-06-08', author: 'kms', note: '재검증' }], nextReviewBy: '2027-03-31',
}

describe('FactSchema', () => {
  it('accepts a valid fact', () => {
    expect(FactSchema.parse(valid)).toMatchObject({ id: 'f_a1b2c3' })
  })
  it('rejects bad id format', () => {
    expect(() => FactSchema.parse({ ...valid, id: 'x1' })).toThrow()
  })
  it('rejects unknown verifyStatus', () => {
    expect(() => FactSchema.parse({ ...valid, verifyStatus: '대충맞음' })).toThrow()
  })
  it('rejects bad date format', () => {
    expect(() => FactSchema.parse({ ...valid, asOf: '2026/06/08' })).toThrow()
  })
  it('applies defaults for pilot gap fields', () => {
    const r = FactSchema.parse(valid)
    expect(r.primarySourceVerified).toBe(false)
    expect(r.confidenceScore).toBe(0)
    expect(r.subordinateLawRef).toBe('')
  })
})
