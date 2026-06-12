import { describe, it, expect } from 'vitest'
import {
  loadRules,
  pickRule,
  applyRounding,
  applyRateRule,
  applyLocalIncomeTaxRule,
  applyMonthlyCapRule,
  applyYearEndInstallmentAmountRule,
  calculateDeadline,
  withholdingLatePenalty,
  canAutoCalculate,
  calculateRule,
} from '@/lib/rules/engine'
import type { TaxRule } from '@/lib/rules/schema'
import socialInsuranceRaw from '@/content/tax-rules/2026/social-insurance-2026.json'
import fs from 'node:fs'
import path from 'node:path'

const rateRule: TaxRule = {
  ruleId: 'resident_business_income_wht_2026',
  version: '2026.1.0',
  calendarYear: 2026,
  name: '거주자 사업소득 원천징수',
  domain: 'withholding-rate',
  incomeType: 'business',
  effectiveFrom: '2026-01-01',
  factIds: ['f_ca0001'],
  inputs: [{ key: 'grossPayment', type: 'number', required: true, description: '지급 총액' }],
  formula: { type: 'rate-with-local', expression: '국세 3% + 지방소득세(국세의 10%)', params: { rate: 0.03, localRate: 0.1 } },
  rounding: { base: 10, method: 'floor' },
  calculationMode: 'automatic',
  examples: [
    {
      title: '1,000,000원 지급',
      input: { grossPayment: 1_000_000 },
      expected: { nationalTax: 30_000, localTax: 3_000, total: 33_000 },
    },
  ],
  warnings: [],
}

const oldPenalty: TaxRule = {
  ...rateRule,
  ruleId: 'wht_late_penalty',
  name: '원천세 납부지연(현행)',
  domain: 'penalty',
  incomeType: 'all',
  effectiveFrom: '2020-01-01',
  effectiveTo: '2026-06-30',
  factIds: ['f_a00004'],
  formula: { type: 'penalty-late-wht', expression: '3% + 22/100,000·일', params: { baseRate: 0.03, dailyRate: 0.00022, innerCap: 0.1, outerCap: 0.5 } },
  rounding: undefined,
}

const newPenalty: TaxRule = {
  ...oldPenalty,
  ruleId: 'wht_late_penalty',
  version: '2026.7.0',
  effectiveFrom: '2026-07-01',
  effectiveTo: undefined,
  factIds: ['f_c40017'],
  calculationMode: 'manual-review',
}

const monthlyCapRule: TaxRule = {
  ...rateRule,
  ruleId: 'meal_allowance_monthly_cap',
  version: '2026.1.0',
  domain: 'non-taxable',
  incomeType: 'earned',
  factIds: ['f_c60001'],
  formula: { type: 'monthly-cap', expression: '월 한도', params: { cap: 200_000 } },
  rounding: undefined,
}

const localIncomeTaxRule: TaxRule = {
  ...rateRule,
  ruleId: 'local_income_tax_special_collection',
  version: '2026.1.0',
  domain: 'local-income-tax',
  incomeType: 'all',
  effectiveFrom: '2018-01-01',
  factIds: ['f_nr0015'],
  inputs: [{ key: 'nationalTax', type: 'number', required: true, description: '원천징수 소득세·법인세액(원)' }],
  formula: { type: 'rate', expression: '지방소득세 = 원천징수세액 × 10%', params: { rate: 0.1 } },
  rounding: { base: 10, method: 'floor' },
}

const dateRule: TaxRule = {
  ...rateRule,
  ruleId: 'wht_monthly_due',
  version: '2026.1.0',
  domain: 'deadline',
  incomeType: 'all',
  factIds: ['f_c40001'],
  formula: { type: 'date-rule', expression: '지급월 다음 달 10일', params: { basis: 'payment_month', offsetMonths: 1, day: 10 } },
  rounding: undefined,
}

const customStatementPenaltyRule: TaxRule = {
  ...rateRule,
  ruleId: 'payment_statement_penalty',
  version: '2026.1.0',
  domain: 'penalty',
  incomeType: 'all',
  factIds: ['f_c40004', 'f_c40005', 'f_c40006', 'f_c40008'],
  formula: {
    type: 'custom',
    expression: '지급명세서 가산세',
    params: { missRate: 0.01, lateRate: 0.005, simpleMissRate: 0.0025, simpleLateRate: 0.00125, generalCap: 100_000_000, smeCap: 50_000_000 },
  },
  rounding: undefined,
  calculationMode: 'manual-review',
}

const businessInstallmentAmountRule = {
  ...rateRule,
  ruleId: 'business_yas_installment_amount',
  version: '2026.1.0',
  name: '사업소득 연말정산 추가납부세액 분납 금액',
  domain: 'year-end-settlement',
  incomeType: 'business',
  factIds: ['f_ca0007'],
  inputs: [
    { key: 'incomeType', type: 'enum', required: true, description: '연말정산 대상 소득 유형' },
    { key: 'settlementYear', type: 'number', required: true, description: '귀속연도' },
    { key: 'additionalTax', type: 'number', required: true, description: '연말정산 추가 납부세액' },
  ],
  formula: {
    type: 'year-end-installment-amount',
    expression: '추가 납부세액 10만원 초과 시 다음 연도 2~4월 사업소득 지급분에 균등 분납',
    params: { threshold: 100_000, startMonth: 2, installmentCount: 3 },
  },
  rounding: undefined,
  calculationMode: 'automatic',
  examples: [
    {
      title: '150,000원 추가 납부세액',
      input: { incomeType: 'business', settlementYear: 2026, additionalTax: 150_000 },
      expected: {
        status: 'available',
        threshold: 100_000,
        installments: [
          { year: 2027, month: 2, amount: 50_000 },
          { year: 2027, month: 3, amount: 50_000 },
          { year: 2027, month: 4, amount: 50_000 },
        ],
      },
    },
  ],
}

describe('pickRule (적용일 기준 버전 선택)', () => {
  const rules = loadRules([oldPenalty, newPenalty, rateRule])

  it('selects pre-revision rule before 2026-07-01', () => {
    expect(pickRule(rules, 'wht_late_penalty', '2026-06-30')?.version).toBe('2026.1.0')
  })
  it('selects revised rule from 2026-07-01', () => {
    expect(pickRule(rules, 'wht_late_penalty', '2026-07-01')?.version).toBe('2026.7.0')
  })
  it('returns undefined outside any window', () => {
    expect(pickRule(rules, 'wht_late_penalty', '2019-12-31')).toBeUndefined()
  })
})

describe('applyRounding', () => {
  it('floors to 10원', () => {
    expect(applyRounding(30009, { base: 10, method: 'floor' })).toBe(30000)
  })
  it('passes through without rounding spec', () => {
    expect(applyRounding(30009, undefined)).toBe(30009)
  })
})

describe('applyRateRule — 사업소득 3% + 지방 0.3%', () => {
  it('computes 1,000,000 → 국세 30,000 / 지방 3,000 / 합계 33,000', () => {
    const r = applyRateRule(rateRule, { grossPayment: 1_000_000 })
    expect(r.nationalTax).toBe(30_000)
    expect(r.localTax).toBe(3_000)
    expect(r.total).toBe(33_000)
  })
  it('rounds down each tax to 10원 (333,333원 지급)', () => {
    const r = applyRateRule(rateRule, { grossPayment: 333_333 })
    // 333,333×3% = 9,999.99 → 9,990 (floor 10) / 지방 9,990×10% = 999 → 990
    expect(r.nationalTax).toBe(9_990)
    expect(r.localTax).toBe(990)
  })
})

describe('applyLocalIncomeTaxRule — 원천징수세액의 10%', () => {
  it('computes local income tax from national tax, not from gross payment', () => {
    expect(applyLocalIncomeTaxRule(localIncomeTaxRule, { nationalTax: 30_000 })).toEqual({
      localTax: 3_000,
    })
  })
})

describe('withholdingLatePenalty — 현행 산식(2026.6.30까지)', () => {
  it('100일 지연: 3% + 0.022%×100 = 5.2%', () => {
    const r = withholdingLatePenalty(oldPenalty, { unpaidTax: 1_000_000, daysLate: 100 })
    expect(r.basePenalty).toBe(30_000)
    expect(r.dailyPenalty).toBe(22_000)
    expect(r.capApplied).toBe(false)
    expect(r.total).toBe(52_000)
  })
  it('319일 부근에서 10% 한도 도달', () => {
    const r400 = withholdingLatePenalty(oldPenalty, { unpaidTax: 1_000_000, daysLate: 400 })
    expect(r400.capApplied).toBe(true)
    expect(r400.total).toBe(100_000) // 10% cap
  })
  it('0일(기한 내)이면 0', () => {
    const r = withholdingLatePenalty(oldPenalty, { unpaidTax: 1_000_000, daysLate: 0 })
    expect(r.total).toBe(0)
  })
})

describe('withholdingLatePenalty — 2026.7 이후 개정 산식 구성요소', () => {
  it('separates pre-notice daily penalty, post-designated monthly penalty, demand cost, and caps', () => {
    const r = withholdingLatePenalty(newPenalty, {
      unpaidTax: 2_000_000,
      daysLate: 30,
      designatedDueDate: '2026-08-20',
      paymentDate: '2026-11-20',
      demandCost: 2500,
    })

    expect(r).toMatchObject({
      basePenalty: 60_000,
      preNoticeDailyPenalty: 13_200,
      dailyPenalty: 13_200,
      postDesignatedMonthlyPenalty: 40_200,
      demandCost: 2500,
      innerCapAmount: 200_000,
      outerCapAmount: 1_000_000,
      capApplied: false,
      manualReviewRequired: true,
      total: 115_900,
    })
  })

  it('exempts post-designated monthly penalty and demand cost below 1.5 million won', () => {
    const r = withholdingLatePenalty(newPenalty, {
      unpaidTax: 1_000_000,
      daysLate: 30,
      designatedDueDate: '2026-08-20',
      paymentDate: '2026-11-20',
      demandCost: 2500,
    })

    expect(r.postDesignatedMonthlyPenalty).toBe(0)
    expect(r.demandCost).toBe(0)
    expect(r.manualReviewRequired).toBe(true)
    expect(r.total).toBe(36_600)
  })
})

describe('canAutoCalculate', () => {
  it('blocks automatic amount calculation for manual-review rules', () => {
    expect(canAutoCalculate(oldPenalty)).toBe(true)
    expect(canAutoCalculate(newPenalty)).toBe(false)
  })

  it('rejects custom rules that are marked automatic when loading rule files', () => {
    expect(() =>
      loadRules([
        {
          ...customStatementPenaltyRule,
          calculationMode: 'automatic',
        },
      ])
    ).toThrow(/custom rule.*manual-review/)
  })

  it('rejects non-canonical incomeType values when loading rule files', () => {
    expect(() =>
      loadRules([
        {
          ...rateRule,
          incomeType: 'interest-dividend',
        },
      ])
    ).toThrow()
  })

  it('rejects automatic rules without examples when loading rule files', () => {
    expect(() =>
      loadRules([
        {
          ...rateRule,
          examples: [],
        },
      ])
    ).toThrow(/automatic rule.*example/)
  })
})

describe('calculateRule — formula type dispatcher', () => {
  it('calculates rate-with-local rules', () => {
    const result = calculateRule(rateRule, { grossPayment: 1_000_000 })

    expect(result).toMatchObject({
      type: 'rate',
      nationalTax: 30_000,
      localTax: 3_000,
      total: 33_000,
      ruleId: 'resident_business_income_wht_2026',
      version: '2026.1.0',
    })
  })

  it('calculates local-income-tax rules from nationalTax', () => {
    const result = calculateRule(localIncomeTaxRule, { nationalTax: 30_000 })

    expect(result).toMatchObject({
      type: 'local-income-tax',
      localTax: 3_000,
      ruleId: 'local_income_tax_special_collection',
      version: '2026.1.0',
    })
  })

  it('calculates monthly-cap rules', () => {
    const result = calculateRule(monthlyCapRule, { monthlyAmount: 250_000, months: 2 })

    expect(result).toMatchObject({
      type: 'monthly-cap',
      capAmount: 400_000,
      nonTaxableAmount: 400_000,
      taxableAmount: 100_000,
      excessAmount: 100_000,
      ruleId: 'meal_allowance_monthly_cap',
      version: '2026.1.0',
    })
  })

  it('calculates date-rule deadlines', () => {
    const result = calculateRule(dateRule, { paymentDate: '2026-06-25' })

    expect(result).toMatchObject({
      type: 'date-rule',
      dueDate: '2026-07-10',
      adjustedDueDate: '2026-07-10',
      isHolidayAdjusted: false,
      ruleId: 'wht_monthly_due',
      version: '2026.1.0',
    })
  })

  it('calculates business year-end settlement installment amounts', () => {
    const [rule] = loadRules([businessInstallmentAmountRule])
    const result = calculateRule(rule, {
      incomeType: 'business',
      settlementYear: 2026,
      additionalTax: 150_000,
    })

    expect(result).toMatchObject({
      type: 'year-end-installment-amount',
      status: 'available',
      threshold: 100_000,
      factIds: ['f_ca0007'],
      installments: [
        { year: 2027, month: 2, amount: 50_000 },
        { year: 2027, month: 3, amount: 50_000 },
        { year: 2027, month: 4, amount: 50_000 },
      ],
      ruleId: 'business_yas_installment_amount',
      version: '2026.1.0',
    })
  })

  it('keeps business installment unavailable when additional tax is 100,000 won or less', () => {
    const [rule] = loadRules([businessInstallmentAmountRule])
    const result = calculateRule(rule, {
      incomeType: 'business',
      settlementYear: 2026,
      additionalTax: 100_000,
    })

    expect(result).toMatchObject({
      type: 'year-end-installment-amount',
      status: 'not_available',
      reason: 'threshold_not_exceeded',
      installments: [],
    })
  })

  it('returns manual review for manual-review rules', () => {
    const result = calculateRule(newPenalty, { unpaidTax: 1_000_000, daysLate: 10 })

    expect(result).toMatchObject({
      type: 'manual-review',
      message: '이 rule은 자동 계산 대상이 아닙니다.',
      ruleId: 'wht_late_penalty',
      version: '2026.7.0',
    })
  })

  it('returns manual review for the composite-rates social insurance rule', () => {
    const rule = loadRules(socialInsuranceRaw).find((r) => r.ruleId === 'social_insurance_rates_2026')
    expect(rule).toBeDefined()
    expect(rule!.formula.type).toBe('composite-rates')
    expect(rule!.calculationMode).toBe('manual-review')

    const input = rule!.examples[0].input as Record<string, unknown>
    expect(calculateRule(rule!, input)).toMatchObject({
      type: 'manual-review',
      message: '이 rule은 자동 계산 대상이 아닙니다.',
      ruleId: 'social_insurance_rates_2026',
      version: '2026.1.0',
    })

    // calculationMode와 무관하게 dispatcher의 composite-rates 분기 자체도 manual-review로 라우팅
    const automaticVariant: TaxRule = { ...rule!, calculationMode: 'automatic' }
    expect(calculateRule(automaticVariant, input)).toMatchObject({
      type: 'manual-review',
      message: '복합 요율 체인(4대보험+소득세 근사)은 전용 계산기(lib/reverse-net-pay)를 사용하세요.',
      ruleId: 'social_insurance_rates_2026',
      version: '2026.1.0',
    })
  })

  it('does not auto-dispatch custom rules through the generic dispatcher', () => {
    const result = calculateRule(customStatementPenaltyRule, {
      amount: 10_000_000,
      statementType: 'simplified',
      submissionStatus: 'late',
      companySize: 'general',
    })

    expect(result).toMatchObject({
      type: 'manual-review',
      message: '이 rule은 자동 계산 대상이 아닙니다.',
      ruleId: 'payment_statement_penalty',
      version: '2026.1.0',
    })
  })
})

describe('content/tax-rules JSON 무결성', () => {
  it('registers business_yas_installment_amount as a JSON-backed automatic rule', () => {
    const rulesDir = path.join(process.cwd(), 'content', 'tax-rules', '2026')
    const rules = fs
      .readdirSync(rulesDir)
      .filter((file) => file.endsWith('.json'))
      .flatMap((file) => loadRules(JSON.parse(fs.readFileSync(path.join(rulesDir, file), 'utf8'))))
    const rule = rules.find((item) => item.ruleId === 'business_yas_installment_amount')

    expect(rule).toMatchObject({
      ruleId: 'business_yas_installment_amount',
      domain: 'year-end-settlement',
      incomeType: 'business',
      calculationMode: 'automatic',
      factIds: ['f_ca0007'],
      formula: {
        type: 'year-end-installment-amount',
        params: { threshold: 100_000, startMonth: 2, installmentCount: 3 },
      },
    })
  })

  it('registers employee_yas_installment_amount as a JSON-backed automatic rule', () => {
    const rulesDir = path.join(process.cwd(), 'content', 'tax-rules', '2026')
    const rules = fs
      .readdirSync(rulesDir)
      .filter((file) => file.endsWith('.json'))
      .flatMap((file) => loadRules(JSON.parse(fs.readFileSync(path.join(rulesDir, file), 'utf8'))))
    const rule = rules.find((item) => item.ruleId === 'employee_yas_installment_amount')

    expect(rule).toMatchObject({
      ruleId: 'employee_yas_installment_amount',
      domain: 'year-end-settlement',
      incomeType: 'earned',
      calculationMode: 'automatic',
      factIds: ['f_yas001'],
      formula: {
        type: 'year-end-installment-amount',
        params: { threshold: 100_000, startMonth: 2, installmentCount: 3 },
      },
    })

    expect(calculateRule(rule!, {
      incomeType: 'earned',
      settlementYear: 2026,
      additionalTax: 150_000,
    })).toMatchObject({
      type: 'year-end-installment-amount',
      status: 'available',
      factIds: ['f_yas001'],
      installments: [
        { year: 2027, month: 2, amount: 50_000 },
        { year: 2027, month: 3, amount: 50_000 },
        { year: 2027, month: 4, amount: 50_000 },
      ],
    })
  })

  it('all rule files parse + factIds resolve + examples compute', async () => {
    const factsRaw = (await import('@/content/facts.json')).default as Array<{ id: string }>
    const ids = new Set(factsRaw.map((f) => f.id))
    const rulesDir = path.join(process.cwd(), 'content', 'tax-rules', '2026')
    const files = fs
      .readdirSync(rulesDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => JSON.parse(fs.readFileSync(path.join(rulesDir, file), 'utf8')))
    for (const raw of files) {
      const rules = loadRules(raw)
      for (const rule of rules) {
        for (const fid of rule.factIds) {
          expect(ids.has(fid), `${rule.ruleId} → unknown fact ${fid}`).toBe(true)
        }
        if (rule.calculationMode !== 'manual-review') {
          expect(rule.examples.length, `${rule.ruleId} must include at least one example`).toBeGreaterThan(0)
        }
        // rate 계열 rule의 examples는 엔진으로 재계산해 expected와 일치해야 함
        if (rule.domain === 'local-income-tax') {
          for (const ex of rule.examples) {
            const out = applyLocalIncomeTaxRule(rule, ex.input as Record<string, number>)
            for (const [k, v] of Object.entries(ex.expected)) {
              expect(out[k as keyof typeof out], `${rule.ruleId} example "${ex.title}" key ${k}`).toEqual(v)
            }
          }
        } else if (rule.formula.type === 'rate' || rule.formula.type === 'rate-with-local') {
          for (const ex of rule.examples) {
            const out = applyRateRule(rule, ex.input as Record<string, number>)
            for (const [k, v] of Object.entries(ex.expected)) {
              expect(out[k as keyof typeof out], `${rule.ruleId} example "${ex.title}" key ${k}`).toEqual(v)
            }
          }
        } else if (rule.formula.type === 'monthly-cap') {
          for (const ex of rule.examples) {
            const out = applyMonthlyCapRule(rule, ex.input as Record<string, unknown>)
            for (const [k, v] of Object.entries(ex.expected)) {
              expect(out[k as keyof typeof out], `${rule.ruleId} example "${ex.title}" key ${k}`).toEqual(v)
            }
          }
        } else if (rule.formula.type === 'date-rule') {
          for (const ex of rule.examples) {
            const out = calculateDeadline(rule, ex.input as Record<string, unknown>)
            for (const [k, v] of Object.entries(ex.expected)) {
              expect(out[k as keyof typeof out], `${rule.ruleId} example "${ex.title}" key ${k}`).toEqual(v)
            }
          }
        } else if (rule.formula.type === 'year-end-installment-amount') {
          for (const ex of rule.examples) {
            const out = applyYearEndInstallmentAmountRule(rule, ex.input as Record<string, unknown>)
            for (const [k, v] of Object.entries(ex.expected)) {
              expect(out[k as keyof typeof out], `${rule.ruleId} example "${ex.title}" key ${k}`).toEqual(v)
            }
          }
        }
      }
    }
  })
})
