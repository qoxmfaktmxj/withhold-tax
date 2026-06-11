import { describe, it, expect } from 'vitest'
import { FactSchema, FactsFileSchema } from '@/lib/facts/schema'

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
    expect(r.scopeLimitations).toBe('')
    expect(r.localTaxRef).toBe('')
    expect(r.supersededRefs).toBe('')
    expect(r.sunsetDate).toBe('')
    expect(r.reviewerId).toBe('')
    expect(r.appliesFrom).toBe('')
    expect(r.incomeType).toBe('all')
    expect(r.implementationStatus).toBe('not_started')
  })

  it('accepts only canonical incomeType enum values', () => {
    for (const incomeType of [
      'all',
      'earned',
      'daily_worker',
      'business',
      'other',
      'retirement',
      'pension',
      'interest',
      'dividend',
      'interest_dividend',
      'nonresident',
      'foreign_corporation',
      'local_income_tax',
    ]) {
      expect(() => FactSchema.parse({ ...valid, incomeType })).not.toThrow()
    }

    expect(() => FactSchema.parse({ ...valid, incomeType: 'interest-dividend' })).toThrow()
    expect(() => FactSchema.parse({ ...valid, incomeType: '' })).toThrow()
  })

  // confidenceScore 정수 범위 검증
  it('rejects confidenceScore > 100', () => {
    expect(() => FactSchema.parse({ ...valid, confidenceScore: 101 })).toThrow()
  })
  it('rejects confidenceScore < 0', () => {
    expect(() => FactSchema.parse({ ...valid, confidenceScore: -1 })).toThrow()
  })
  it('rejects non-integer confidenceScore', () => {
    expect(() => FactSchema.parse({ ...valid, confidenceScore: 50.5 })).toThrow()
  })

  // history min(1) 검증
  it('rejects empty history array', () => {
    expect(() => FactSchema.parse({ ...valid, history: [] })).toThrow()
  })

  // chapter 형식 검증
  it('rejects bad chapter "CH3"', () => {
    expect(() => FactSchema.parse({ ...valid, chapter: 'CH3' })).toThrow()
  })
  it('rejects bad chapter "3"', () => {
    expect(() => FactSchema.parse({ ...valid, chapter: '3' })).toThrow()
  })
  it('accepts valid chapter "ch10"', () => {
    expect(() => FactSchema.parse({ ...valid, chapter: 'ch10' })).not.toThrow()
  })
  it('accepts named chapter "nonresident"', () => {
    expect(() => FactSchema.parse({ ...valid, chapter: 'nonresident' })).not.toThrow()
  })
  it('accepts named chapter "interest-dividend"', () => {
    expect(() => FactSchema.parse({ ...valid, chapter: 'interest-dividend' })).not.toThrow()
  })

  // 실제 날짜 유효성 검증 (refine)
  it('rejects impossible date "2026-13-45"', () => {
    expect(() => FactSchema.parse({ ...valid, effectiveDate: '2026-13-45' })).toThrow()
  })

  // FactsFileSchema 검증
  it('FactsFileSchema accepts array of one valid fact', () => {
    expect(() => FactsFileSchema.parse([valid])).not.toThrow()
  })
  it('FactsFileSchema rejects array with bad id', () => {
    expect(() => FactsFileSchema.parse([{ ...valid, id: 'bad' }])).toThrow()
  })
})
