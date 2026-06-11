import { describe, expect, it } from 'vitest'
import penaltyRulesRaw from '@/content/tax-rules/2026/penalty-rules.json'
import { applyPaymentStatementPenalty, loadRules, pickRule } from '@/lib/rules/engine'

const rule = pickRule(loadRules(penaltyRulesRaw), 'payment_statement_penalty', '2026-06-10')!

describe('applyPaymentStatementPenalty', () => {
  it('keeps the custom rule out of generic automatic dispatch', () => {
    expect(rule.formula.type).toBe('custom')
    expect(rule.calculationMode).toBe('manual-review')
  })

  it('calculates annual payment statement missing penalty at 1%', () => {
    const result = applyPaymentStatementPenalty(rule, {
      amount: 10_000_000,
      statementType: 'annual',
      submissionStatus: 'missing',
      companySize: 'general',
    })

    expect(result).toMatchObject({
      rate: 0.01,
      rawPenalty: 100_000,
      total: 100_000,
      capApplied: false,
      capAmount: 100_000_000,
    })
    expect(result.factIds).toContain('f_c40004')
  })

  it('calculates annual payment statement late-submission penalty at 0.5%', () => {
    const result = applyPaymentStatementPenalty(rule, {
      amount: 10_000_000,
      statementType: 'annual',
      submissionStatus: 'late',
      companySize: 'general',
    })

    expect(result.rate).toBe(0.005)
    expect(result.total).toBe(50_000)
    expect(result.factIds).toContain('f_c40005')
  })

  it('calculates simplified statement missing and late penalties with lower rates', () => {
    const missing = applyPaymentStatementPenalty(rule, {
      amount: 10_000_000,
      statementType: 'simplified',
      submissionStatus: 'missing',
      companySize: 'general',
    })
    const late = applyPaymentStatementPenalty(rule, {
      amount: 10_000_000,
      statementType: 'simplified',
      submissionStatus: 'late',
      companySize: 'general',
    })

    expect(missing.rate).toBe(0.0025)
    expect(missing.total).toBe(25_000)
    expect(late.rate).toBe(0.00125)
    expect(late.total).toBe(12_500)
    expect(missing.factIds).toContain('f_c40006')
    expect(late.factIds).toContain('f_c40006')
  })

  it('applies the small-business cap at 50 million won', () => {
    const result = applyPaymentStatementPenalty(rule, {
      amount: 10_000_000_000,
      statementType: 'annual',
      submissionStatus: 'missing',
      companySize: 'sme',
    })

    expect(result.rawPenalty).toBe(100_000_000)
    expect(result.capAmount).toBe(50_000_000)
    expect(result.capApplied).toBe(true)
    expect(result.total).toBe(50_000_000)
    expect(result.factIds).toContain('f_c40008')
  })
})
