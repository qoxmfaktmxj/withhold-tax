import { describe, expect, it } from 'vitest'
import { calculateYearEndInstallmentSchedule } from '@/lib/year-end/installment'

describe('calculateYearEndInstallmentSchedule', () => {
  it('creates a February-to-April business income installment schedule when additional tax exceeds 100,000 won', () => {
    const schedule = calculateYearEndInstallmentSchedule({
      incomeType: 'business',
      settlementYear: 2026,
      additionalTax: 150_000,
    })

    expect(schedule.status).toBe('available')
    expect(schedule.threshold).toBe(100_000)
    expect(schedule.factIds).toContain('f_ca0007')
    expect(schedule.installments).toEqual([
      { year: 2027, month: 2, amount: 50_000 },
      { year: 2027, month: 3, amount: 50_000 },
      { year: 2027, month: 4, amount: 50_000 },
    ])
    expect(schedule.reportMemo).toContain('원천징수이행상황신고서')
  })

  it('keeps the scheduler disabled when additional tax is not above the threshold', () => {
    const schedule = calculateYearEndInstallmentSchedule({
      incomeType: 'business',
      settlementYear: 2026,
      additionalTax: 100_000,
    })

    expect(schedule.status).toBe('not_available')
    expect(schedule.reason).toBe('threshold_not_exceeded')
    expect(schedule.installments).toEqual([])
  })

  it('adjusts the final month when the additional tax does not split evenly', () => {
    const schedule = calculateYearEndInstallmentSchedule({
      incomeType: 'business',
      settlementYear: 2026,
      additionalTax: 100_001,
    })

    expect(schedule.installments.map((item) => item.amount)).toEqual([
      33_333,
      33_333,
      33_335,
    ])
  })

  it('creates an earned income installment schedule from the employee year-end settlement fact', () => {
    const schedule = calculateYearEndInstallmentSchedule({
      incomeType: 'earned',
      settlementYear: 2026,
      additionalTax: 150_000,
    })

    expect(schedule.status).toBe('available')
    expect(schedule.factIds).toContain('f_yas001')
    expect(schedule.installments).toEqual([
      { year: 2027, month: 2, amount: 50_000 },
      { year: 2027, month: 3, amount: 50_000 },
      { year: 2027, month: 4, amount: 50_000 },
    ])
    expect(schedule.reportMemo).toContain('급여')
  })
})
