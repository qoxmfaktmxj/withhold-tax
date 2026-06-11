import { describe, expect, it } from 'vitest'
import { evaluateBusinessIncomePayment } from '@/lib/business-income/decision'

describe('evaluateBusinessIncomePayment', () => {
  it('blocks the 3.3% resident business income rule when the payment is not personal service', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      isPersonalService: false,
      hasBusinessRegistration: false,
    })

    expect(decision.classification).toBe('employee')
    expect(decision.appliesThreePointThree).toBe(false)
    expect(decision.reviewFlags).toContain('personal_service_required')
    expect(decision.action).toEqual({
      type: 'manual-review',
      message: '인적용역 사업소득인지 확인 필요',
    })
  })

  it('routes nonresident payments away from the resident 3.3% rule', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'nonresident',
      isPersonalService: true,
      hasBusinessRegistration: false,
    })

    expect(decision.classification).toBe('nonresident')
    expect(decision.appliesThreePointThree).toBe(false)
    expect(decision.reviewFlags).toContain('nonresident_rule_required')
    expect(decision.action).toEqual({
      type: 'redirect-rule',
      ruleId: 'nonresident_general_wht',
    })
  })

  it('marks business registration as a manual review flag without silently applying 3.3%', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      isPersonalService: true,
      hasBusinessRegistration: true,
    })

    expect(decision.appliesThreePointThree).toBe(false)
    expect(decision.classification).toBe('registered_business')
    expect(decision.reviewFlags).toContain('business_registration_review')
    expect(decision.action).toEqual({
      type: 'manual-review',
      message: '세금계산서/사업자 거래 여부 확인 필요',
    })
  })

  it('applies the resident personal-service 3.3% rule when the classification is clean', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      isPersonalService: true,
      hasBusinessRegistration: false,
    })

    expect(decision.classification).toBe('personal_service_resident')
    expect(decision.appliesThreePointThree).toBe(true)
    expect(decision.ruleId).toBe('resident_business_income_wht')
    expect(decision.action).toEqual({
      type: 'calculate',
      ruleId: 'resident_business_income_wht',
    })
    expect(decision.withholding).toMatchObject({
      nationalTax: 30_000,
      localTax: 3_000,
      total: 33_000,
    })
  })

  it('routes corporation-like payments to manual review instead of the resident personal-service rule', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      incomeClass: 'corporation',
      isPersonalService: true,
      hasBusinessRegistration: false,
    })

    expect(decision.classification).toBe('corporation')
    expect(decision.appliesThreePointThree).toBe(false)
    expect(decision.action).toEqual({
      type: 'manual-review',
      message: '세금계산서/사업자 거래 여부 확인 필요',
    })
  })

  it('does not apply the small-tax exemption to resident personal-service payments after 2024-07-01', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 10_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      isPersonalService: true,
      hasBusinessRegistration: false,
    })

    expect(decision.withholding?.total).toBe(330)
    expect(decision.smallTaxWithholdingRequired).toBe(true)
    expect(decision.smallTaxExemptionApplied).toBe(false)
    expect(decision.factIds).toContain('f_a00001')
  })

  it('calculates the monthly simple statement due date as the last day of the next month', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      isPersonalService: true,
      hasBusinessRegistration: false,
    })

    expect(decision.simpleStatementDueDate).toBe('2026-07-31')
  })

  it('sets year-end settlement target from continuing service status', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      isPersonalService: true,
      hasBusinessRegistration: false,
      isContinuingService: true,
    })

    expect(decision.isYearEndTarget).toBe(true)
  })

  it('creates a February-to-April installment plan when settlement additional tax exceeds 100,000 won', () => {
    const decision = evaluateBusinessIncomePayment({
      grossPayment: 1_000_000,
      paymentDate: '2026-06-10',
      residency: 'resident',
      isPersonalService: true,
      hasBusinessRegistration: false,
      isContinuingService: true,
      additionalTaxAfterSettlement: 150_000,
    })

    expect(decision.installmentPlan).toEqual({
      enabled: true,
      threshold: 100_000,
      installments: [
        { month: 2, amount: 50_000 },
        { month: 3, amount: 50_000 },
        { month: 4, amount: 50_000 },
      ],
    })
  })
})
