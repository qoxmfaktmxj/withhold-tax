import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import socialInsuranceRaw from '@/content/tax-rules/2026/social-insurance-2026.json'
import { ReverseNetPayCalculator } from '@/components/calculators/ReverseNetPayCalculator'
import {
  calculateMonthlyDeductions,
  calculateReverseNetPay,
  REVERSE_ITERATION,
  TAX_YEAR,
} from '@/lib/reverse-net-pay/calc'
import { loadRules } from '@/lib/rules/engine'

describe('calculateReverseNetPay — 왕복 일관성(역산 → 정방향 재계산)', () => {
  const cases = [
    { targetNetMonthlyPay: 2_000_000, dependents: 1, nonTaxableMonthlyPay: 0 },
    { targetNetMonthlyPay: 3_000_000, dependents: 2, nonTaxableMonthlyPay: 200_000 },
    { targetNetMonthlyPay: 4_000_000, dependents: 1, nonTaxableMonthlyPay: 0 },
    { targetNetMonthlyPay: 5_500_000, dependents: 4, nonTaxableMonthlyPay: 200_000 },
    { targetNetMonthlyPay: 8_000_000, dependents: 1, nonTaxableMonthlyPay: 0 },
    { targetNetMonthlyPay: 15_000_000, dependents: 3, nonTaxableMonthlyPay: 200_000 },
  ]

  for (const input of cases) {
    it(`희망 실수령 ${input.targetNetMonthlyPay.toLocaleString('ko-KR')}원·부양 ${input.dependents}인·비과세 ${input.nonTaxableMonthlyPay.toLocaleString('ko-KR')}원 — 정방향 재계산 오차 ±1,000원`, () => {
      const reverse = calculateReverseNetPay(input)
      const forward = calculateMonthlyDeductions(
        reverse.taxableMonthlyPay,
        input.dependents,
        input.nonTaxableMonthlyPay
      )
      expect(Math.abs(forward.netMonthlyPay - input.targetNetMonthlyPay)).toBeLessThanOrEqual(1_000)
      expect(forward.grossMonthlyPay).toBe(reverse.grossMonthlyPay)
      expect(forward.netMonthlyPay).toBe(reverse.achievedNetMonthlyPay)
    })
  }
})

describe('calculateReverseNetPay — 실수령 4,000,000원 수렴', () => {
  it('부양 1인·비과세 0원 — 세전 4,866,981원으로 수렴 (귀속 2026 고정)', () => {
    expect(TAX_YEAR).toBe(2026)
    const result = calculateReverseNetPay({
      targetNetMonthlyPay: 4_000_000,
      dependents: 1,
      nonTaxableMonthlyPay: 0,
    })
    expect(result.converged).toBe(true)
    expect(result.iterations).toBeLessThan(REVERSE_ITERATION.maxIterations)
    expect(result).toMatchObject({
      grossMonthlyPay: 4_866_981,
      taxableMonthlyPay: 4_866_981,
      achievedNetMonthlyPay: 4_000_001,
    })
    expect(Math.abs(result.netDifference)).toBeLessThanOrEqual(10)
    expect(result.breakdown).toMatchObject({
      nationalPension: 231_180,
      healthInsurance: 174_960,
      longTermCare: 22_980,
      employmentInsurance: 43_800,
      monthlyIncomeTax: 358_240,
      monthlyLocalIncomeTax: 35_820,
      totalMonthlyDeductions: 866_980,
    })
  })
})

describe('calculateMonthlyDeductions — 2026 국민연금 상·하한', () => {
  it('과세 월급이 상한을 넘으면 2026.7.1 이후 상한 659만원으로 국민연금을 계산한다', () => {
    const result = calculateMonthlyDeductions(8_000_000, 1, 0)

    expect(result.nationalPension).toBe(313_020)
  })
})

describe('calculateReverseNetPay — 비과세 20만원 포함', () => {
  it('실수령 4,000,000원·부양 1인·비과세 200,000원 — 과세급여만 줄고 비과세는 그대로 가산', () => {
    const result = calculateReverseNetPay({
      targetNetMonthlyPay: 4_000_000,
      dependents: 1,
      nonTaxableMonthlyPay: 200_000,
    })
    expect(result.converged).toBe(true)
    expect(result).toMatchObject({
      taxableMonthlyPay: 4_601_711,
      grossMonthlyPay: 4_801_711,
      achievedNetMonthlyPay: 4_000_001,
    })
    expect(result.breakdown.nonTaxableMonthlyPay).toBe(200_000)
    expect(result.grossMonthlyPay).toBe(result.taxableMonthlyPay + 200_000)

    // 같은 실수령액이면 비과세가 있을 때 세전 총지급액이 더 낮아야 함
    const withoutNonTaxable = calculateReverseNetPay({
      targetNetMonthlyPay: 4_000_000,
      dependents: 1,
      nonTaxableMonthlyPay: 0,
    })
    expect(result.grossMonthlyPay).toBeLessThan(withoutNonTaxable.grossMonthlyPay)
  })
})

describe('social_insurance_rates_2026 rule — lib 상수와 예제 일치', () => {
  it('rule이 스키마를 통과하고 examples[0]가 lib 계산과 일치', () => {
    const rule = loadRules(socialInsuranceRaw).find((r) => r.ruleId === 'social_insurance_rates_2026')
    expect(rule).toBeDefined()
    expect(rule!.formula.params).toMatchObject({
      nationalPensionEmployeeRate: 0.0475,
      nationalPensionMonthlyBaseCap: 6_590_000,
      nationalPensionMonthlyBaseFloor: 410_000,
      healthInsuranceEmployeeRate: 0.03595,
      longTermCareRateOnHealthInsurance: 0.1314,
      employmentInsuranceEmployeeRate: 0.009,
      localIncomeTaxRate: 0.1,
      personalDeductionPerPerson: 1_500_000,
    })

    const example = rule!.examples[0]
    const input = example.input as {
      targetNetMonthlyPay: number
      dependents: number
      nonTaxableMonthlyPay: number
    }
    const result = calculateReverseNetPay(input)
    const expected = example.expected as Record<string, number | boolean>
    expect(result.converged).toBe(expected.converged)
    expect(result.grossMonthlyPay).toBe(expected.grossMonthlyPay)
    expect(result.achievedNetMonthlyPay).toBe(expected.achievedNetMonthlyPay)
    expect(result.breakdown).toMatchObject({
      nationalPension: expected.nationalPension,
      healthInsurance: expected.healthInsurance,
      longTermCare: expected.longTermCare,
      employmentInsurance: expected.employmentInsurance,
      monthlyIncomeTax: expected.monthlyIncomeTax,
      monthlyLocalIncomeTax: expected.monthlyLocalIncomeTax,
    })
  })
})

describe('ReverseNetPayCalculator UI', () => {
  it('기본값(실수령 4,000,000원·부양 1인·비과세 0원) — 세전 4,866,981원 표시', () => {
    render(<ReverseNetPayCalculator />)

    expect(screen.getByLabelText('희망 월 실수령액')).toHaveValue('4000000')
    expect(screen.getByLabelText('부양가족 수(본인 포함)')).toHaveValue('1')
    expect(screen.getByLabelText('월 비과세 합계')).toHaveValue('0')

    const result = screen.getByRole('region', { name: '세후 세전 역산 결과' })
    expect(
      within(result).getByRole('row', { name: '예상 세전 월급(총지급액) 4,866,981원' })
    ).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '국민연금(4.75%) 231,180원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '계산 실수령액 4,000,001원' })).toBeInTheDocument()
    expect(within(result).getByText(/간이세액표가 아닌 연말정산 방식 연 환산 근사치/)).toBeInTheDocument()
    expect(within(result).getByText(/2026\.7\.1 이후 기준\(659만\/41만\)/)).toBeInTheDocument()
  })

  it('비과세 200,000원 입력 시 세전 총지급액 4,801,711원으로 갱신', () => {
    render(<ReverseNetPayCalculator />)

    fireEvent.change(screen.getByLabelText('월 비과세 합계'), { target: { value: '200000' } })

    const result = screen.getByRole('region', { name: '세후 세전 역산 결과' })
    expect(
      within(result).getByRole('row', { name: '예상 세전 월급(총지급액) 4,801,711원' })
    ).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '비과세 합계 200,000원' })).toBeInTheDocument()
  })
})
