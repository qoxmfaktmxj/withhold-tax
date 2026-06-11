import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MonthlyWithholdingChecker } from '@/components/calculators/MonthlyWithholdingChecker'
import { checkMonthlyWithholding, floorToTen } from '@/lib/monthly-withholding/check'

describe('checkMonthlyWithholding', () => {
  it('checks selected withholding ratio against the official simplified table amount', () => {
    expect(
      checkMonthlyWithholding({
        taxableMonthlyPay: 3_500_000,
        familyCount: 2,
        childCount8To20: 1,
        officialSimpleTax: 84_000,
        withholdingRatePercent: 80,
        actualNationalTax: 67_200,
        actualLocalTax: 6_720,
      })
    ).toMatchObject({
      expectedNationalTax: 67_200,
      expectedLocalTax: 6_720,
      expectedTotalTax: 73_920,
      nationalTaxDifference: 0,
      localTaxDifference: 0,
      status: 'match',
    })
  })

  it('flags under-withholding when actual tax is below the selected ratio result', () => {
    expect(
      checkMonthlyWithholding({
        taxableMonthlyPay: 5_200_000,
        familyCount: 1,
        childCount8To20: 0,
        officialSimpleTax: 180_000,
        withholdingRatePercent: 100,
        actualNationalTax: 150_000,
        actualLocalTax: 15_000,
      })
    ).toMatchObject({
      expectedNationalTax: 180_000,
      expectedLocalTax: 18_000,
      nationalTaxDifference: -30_000,
      localTaxDifference: -3_000,
      status: 'under_withheld',
    })
  })

  it('floors local income tax to ten won units', () => {
    expect(floorToTen(6_789)).toBe(6_780)
  })
})

describe('MonthlyWithholdingChecker', () => {
  it('renders a monthly payroll withholding check with official table input', () => {
    render(<MonthlyWithholdingChecker />)

    expect(screen.getByRole('heading', { name: '검산 결과' })).toBeInTheDocument()
    expect(screen.getByLabelText('월 과세급여')).toHaveValue('3500000')
    expect(screen.getByLabelText('간이세액표 소득세')).toHaveValue('84000')

    const result = screen.getByRole('region', { name: '월 급여 원천징수 검산 결과' })
    expect(within(result).getByRole('row', { name: '예상 소득세 84,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '예상 지방소득세 8,400원' })).toBeInTheDocument()
    expect(within(result).getByText('공식 간이세액표 값 기준 일치')).toBeInTheDocument()
  })

  it('updates the expected tax when the employee selected 80%', () => {
    render(<MonthlyWithholdingChecker />)

    fireEvent.change(screen.getByRole('combobox', { name: '선택 원천징수비율' }), {
      target: { value: '80' },
    })

    const result = screen.getByRole('region', { name: '월 급여 원천징수 검산 결과' })
    expect(within(result).getByRole('row', { name: '예상 소득세 67,200원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '차이 16,800원' })).toBeInTheDocument()
    expect(within(result).getByText('회사 원천징수액이 기준보다 많음')).toBeInTheDocument()
  })
})
