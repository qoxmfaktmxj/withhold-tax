import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SalaryNetPayCalculator } from '@/components/calculators/SalaryNetPayCalculator'
import { calculateSalaryNetPay } from '@/lib/salary-net-pay/calculate'
import { calculateSocialInsuranceDeductions } from '@/lib/social-insurance/deductions'

describe('calculateSalaryNetPay', () => {
  it('calculates monthly and annual net pay from payroll statement deductions', () => {
    expect(
      calculateSalaryNetPay({
        grossMonthlyPay: 4_000_000,
        nonTaxablePay: 200_000,
        incomeTax: 120_000,
        localIncomeTax: 12_000,
        nationalPension: 180_000,
        healthInsurance: 140_000,
        longTermCareInsurance: 18_000,
        employmentInsurance: 36_000,
        otherDeductions: 50_000,
        paymentMonths: 12,
      })
    ).toMatchObject({
      taxablePay: 3_800_000,
      totalDeductions: 556_000,
      monthlyNetPay: 3_444_000,
      annualGrossPay: 48_000_000,
      annualNetPay: 41_328_000,
      deductionRate: 13.9,
    })
  })

  it('keeps taxable pay at zero when non-taxable pay is greater than gross pay', () => {
    expect(
      calculateSalaryNetPay({
        grossMonthlyPay: 100_000,
        nonTaxablePay: 150_000,
        incomeTax: 0,
        localIncomeTax: 0,
        nationalPension: 0,
        healthInsurance: 0,
        longTermCareInsurance: 0,
        employmentInsurance: 0,
        otherDeductions: 0,
        paymentMonths: 12,
      }).taxablePay
    ).toBe(0)
  })

  it('auto-calculates 2026 social insurance deductions from taxable pay', () => {
    expect(
      calculateSalaryNetPay({
        grossMonthlyPay: 4_000_000,
        nonTaxablePay: 200_000,
        incomeTax: 120_000,
        localIncomeTax: 12_000,
        nationalPension: 0,
        healthInsurance: 0,
        longTermCareInsurance: 0,
        employmentInsurance: 0,
        otherDeductions: 50_000,
        paymentMonths: 12,
        socialInsuranceMode: 'auto',
        socialInsurancePaymentDate: '2026-07-01',
      })
    ).toMatchObject({
      taxablePay: 3_800_000,
      nationalPension: 180_500,
      healthInsurance: 136_610,
      longTermCareInsurance: 17_950,
      employmentInsurance: 34_200,
      totalDeductions: 551_260,
      monthlyNetPay: 3_448_740,
    })
  })

  it('reuses the meal allowance cap rule before auto social insurance calculation', () => {
    expect(
      calculateSalaryNetPay({
        grossMonthlyPay: 4_000_000,
        nonTaxablePay: 0,
        mealAllowancePay: 500_000,
        incomeTax: 0,
        localIncomeTax: 0,
        nationalPension: 0,
        healthInsurance: 0,
        longTermCareInsurance: 0,
        employmentInsurance: 0,
        otherDeductions: 0,
        paymentMonths: 12,
        socialInsuranceMode: 'auto',
        socialInsurancePaymentDate: '2026-07-01',
      })
    ).toMatchObject({
      nonTaxablePay: 200_000,
      taxableConvertedNonTaxablePay: 300_000,
      taxablePay: 3_800_000,
      nationalPension: 180_500,
      healthInsurance: 136_610,
    })
  })
})

describe('calculateSocialInsuranceDeductions', () => {
  it('uses the 2025.7~2026.6 national pension cap and floor before July 2026', () => {
    expect(calculateSocialInsuranceDeductions({ taxableMonthlyPay: 8_000_000, paymentDate: '2026-06-30' }).nationalPension).toBe(302_570)
    expect(calculateSocialInsuranceDeductions({ taxableMonthlyPay: 100_000, paymentDate: '2026-06-30' }).nationalPension).toBe(19_000)
  })

  it('uses the 2026.7~2027.6 national pension cap and floor from July 2026', () => {
    expect(calculateSocialInsuranceDeductions({ taxableMonthlyPay: 8_000_000, paymentDate: '2026-07-01' }).nationalPension).toBe(313_020)
    expect(calculateSocialInsuranceDeductions({ taxableMonthlyPay: 100_000, paymentDate: '2026-07-01' }).nationalPension).toBe(19_470)
  })

  it('calculates health, long-term care, and employment insurance from taxable pay', () => {
    expect(calculateSocialInsuranceDeductions({ taxableMonthlyPay: 4_000_000, paymentDate: '2026-07-01' })).toMatchObject({
      healthInsurance: 143_800,
      longTermCareInsurance: 18_890,
      employmentInsurance: 36_000,
    })
  })
})

describe('SalaryNetPayCalculator', () => {
  it('renders the default monthly and annual net pay result', () => {
    render(<SalaryNetPayCalculator />)

    const result = screen.getByRole('region', { name: '연봉·실수령액 검산 결과' })
    expect(screen.getByLabelText('월 총급여')).toHaveValue('4000000')
    expect(within(result).getByRole('row', { name: '월 실수령액 3,444,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '연 실수령액 41,328,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '공제율 13.9%' })).toBeInTheDocument()
  })

  it('updates net pay when other deductions change', () => {
    render(<SalaryNetPayCalculator />)

    fireEvent.change(screen.getByLabelText('기타 공제'), { target: { value: '150000' } })

    const result = screen.getByRole('region', { name: '연봉·실수령액 검산 결과' })
    expect(within(result).getByRole('row', { name: '월 실수령액 3,344,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '공제 합계 656,000원' })).toBeInTheDocument()
  })

  it('keeps manual mode by default and can switch social insurance to auto mode', () => {
    render(<SalaryNetPayCalculator />)

    expect(screen.getByLabelText('사회보험 자동 계산')).not.toBeChecked()

    fireEvent.click(screen.getByLabelText('사회보험 자동 계산'))

    const result = screen.getByRole('region', { name: '연봉·실수령액 검산 결과' })
    expect(screen.getByLabelText('사회보험 자동 계산')).toBeChecked()
    expect(within(result).getByRole('row', { name: '공제 합계 551,260원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '월 실수령액 3,448,740원' })).toBeInTheDocument()
  })
})
