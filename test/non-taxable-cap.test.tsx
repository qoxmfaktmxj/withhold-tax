import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import nonTaxableRulesRaw from '@/content/tax-rules/2026/non-taxable-income.json'
import { NonTaxableCapCalculator } from '@/components/calculators/NonTaxableCapCalculator'
import { applyMonthlyCapRule, loadRules } from '@/lib/rules/engine'

const rules = loadRules(nonTaxableRulesRaw)

describe('applyMonthlyCapRule', () => {
  it('checks meal allowance monthly cap', () => {
    const rule = rules.find((r) => r.ruleId === 'meal_allowance_cap')!

    expect(applyMonthlyCapRule(rule, { monthlyAmount: 250_000 })).toMatchObject({
      periodCap: 200_000,
      nonTaxableAmount: 200_000,
      taxableAmount: 50_000,
      excessAmount: 50_000,
    })
  })

  it('checks childcare cap per child', () => {
    const rule = rules.find((r) => r.ruleId === 'childcare_allowance_cap_per_child')!

    expect(applyMonthlyCapRule(rule, { monthlyAmount: 500_000, childrenUnder6: 2 })).toMatchObject({
      periodCap: 400_000,
      nonTaxableAmount: 400_000,
      taxableAmount: 100_000,
    })
  })

  it('checks overseas special site cap', () => {
    const rule = rules.find((r) => r.ruleId === 'overseas_work_exemption')!

    expect(applyMonthlyCapRule(rule, { monthlyAmount: 6_000_000, isSpecialSite: true })).toMatchObject({
      periodCap: 5_000_000,
      nonTaxableAmount: 5_000_000,
      taxableAmount: 1_000_000,
    })
  })
})

describe('NonTaxableCapCalculator', () => {
  it('renders the meal allowance example by default', () => {
    render(<NonTaxableCapCalculator />)

    const result = screen.getByRole('region', { name: '검산 결과' })
    expect(screen.getByRole('combobox', { name: '급여 항목' })).toHaveValue('meal_allowance_cap')
    expect(within(result).getByText('비과세 금액')).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '비과세 금액 200,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '과세 전환 금액 50,000원' })).toBeInTheDocument()
  })

  it('updates childcare cap from children count', () => {
    render(<NonTaxableCapCalculator />)

    fireEvent.change(screen.getByRole('combobox', { name: '급여 항목' }), {
      target: { value: 'childcare_allowance_cap_per_child' },
    })
    fireEvent.change(screen.getByLabelText('월 지급액'), { target: { value: '500000' } })
    fireEvent.change(screen.getByLabelText('6세 이하 자녀 수'), { target: { value: '2' } })

    const result = screen.getByRole('region', { name: '검산 결과' })
    expect(within(result).getByRole('row', { name: '비과세 금액 400,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '과세 전환 금액 100,000원' })).toBeInTheDocument()
  })
})
