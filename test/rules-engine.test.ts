import { describe, it, expect } from 'vitest'
import {
  loadRules,
  pickRule,
  applyRounding,
  applyRateRule,
  withholdingLatePenalty,
  canAutoCalculate,
} from '@/lib/rules/engine'
import type { TaxRule } from '@/lib/rules/schema'

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
  examples: [],
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

describe('canAutoCalculate', () => {
  it('blocks automatic amount calculation for manual-review rules', () => {
    expect(canAutoCalculate(oldPenalty)).toBe(true)
    expect(canAutoCalculate(newPenalty)).toBe(false)
  })
})

describe('content/tax-rules JSON 무결성', () => {
  it('all rule files parse + factIds resolve + examples compute', async () => {
    const factsRaw = (await import('@/content/facts.json')).default as Array<{ id: string }>
    const ids = new Set(factsRaw.map((f) => f.id))
    const files = [
      (await import('@/content/tax-rules/2026/withholding-rates.json')).default,
      (await import('@/content/tax-rules/2026/penalty-rules.json')).default,
      (await import('@/content/tax-rules/2026/deadlines.json')).default,
      (await import('@/content/tax-rules/2026/non-taxable-income.json')).default,
      (await import('@/content/tax-rules/2026/local-income-tax.json')).default,
    ]
    for (const raw of files) {
      const rules = loadRules(raw)
      for (const rule of rules) {
        for (const fid of rule.factIds) {
          expect(ids.has(fid), `${rule.ruleId} → unknown fact ${fid}`).toBe(true)
        }
        // rate 계열 rule의 examples는 엔진으로 재계산해 expected와 일치해야 함
        if (rule.formula.type === 'rate' || rule.formula.type === 'rate-with-local') {
          for (const ex of rule.examples) {
            const out = applyRateRule(rule, ex.input as Record<string, number>)
            for (const [k, v] of Object.entries(ex.expected)) {
              expect(out[k as keyof typeof out], `${rule.ruleId} example "${ex.title}" key ${k}`).toBe(v)
            }
          }
        }
      }
    }
  })
})
