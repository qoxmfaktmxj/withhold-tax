import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import yearEndRulesRaw from '@/content/tax-rules/2026/year-end-settlement.json'
import { YearEndSimulator } from '@/components/calculators/YearEndSimulator'
import { loadRules } from '@/lib/rules/engine'
import { simulateYearEndSettlement } from '@/lib/year-end/simulate'

describe('simulateYearEndSettlement', () => {
  it('estimates refund, additional payment, and local income tax from direct deduction inputs', () => {
    expect(
      simulateYearEndSettlement({
        grossAnnualPay: 50_000_000,
        prepaidTax: 2_100_000,
        additionalDependents: 1,
        children: 2,
        pensionContribution: 2_160_000,
        deductionTotal: 3_000_000,
      })
    ).toMatchObject({
      taxBase: 29_590_000,
      calculatedTax: 3_178_500,
      earnedIncomeTaxCredit: 660_000,
      childTaxCredit: 549_960,
      finalIncomeTax: 1_968_540,
      localIncomeTax: 196_850,
      settlementTax: -131_460,
      refundAmount: 131_460,
      additionalTax: 0,
      status: 'refund',
    })
  })

  it('returns an additional payment when prepaid tax is lower than final tax', () => {
    expect(
      simulateYearEndSettlement({
        grossAnnualPay: 50_000_000,
        prepaidTax: 1_500_000,
        additionalDependents: 1,
        children: 2,
        pensionContribution: 2_160_000,
        deductionTotal: 3_000_000,
      })
    ).toMatchObject({
      settlementTax: 468_540,
      additionalTax: 468_540,
      refundAmount: 0,
      status: 'additional',
    })
  })

  it('keeps the zero boundary explicit', () => {
    expect(
      simulateYearEndSettlement({
        grossAnnualPay: 50_000_000,
        prepaidTax: 1_968_540,
        additionalDependents: 1,
        children: 2,
        pensionContribution: 2_160_000,
        deductionTotal: 3_000_000,
      })
    ).toMatchObject({
      settlementTax: 0,
      status: 'even',
    })
  })
})

describe('employee_year_end_tax_simulator_2026 rule', () => {
  it('keeps rule examples aligned with lib output', () => {
    const rule = loadRules(yearEndRulesRaw).find((entry) => entry.ruleId === 'employee_year_end_tax_simulator_2026')
    expect(rule).toBeDefined()
    expect(rule!.calculationMode).toBe('automatic')

    for (const example of rule!.examples) {
      expect(simulateYearEndSettlement(example.input as Parameters<typeof simulateYearEndSettlement>[0])).toMatchObject(
        example.expected as Record<string, number | string>,
      )
    }
  })
})

describe('YearEndSimulator', () => {
  it('renders the default refund result and local income tax estimate', () => {
    render(<YearEndSimulator />)

    const result = screen.getByRole('region', { name: '연말정산 시뮬레이션 결과' })
    expect(screen.getByLabelText('총급여')).toHaveValue('50000000')
    expect(within(result).getByRole('row', { name: '결정 소득세 1,968,540원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '지방소득세 10% 참고 196,850원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '환급 예상액 131,460원' })).toBeInTheDocument()
  })
})
