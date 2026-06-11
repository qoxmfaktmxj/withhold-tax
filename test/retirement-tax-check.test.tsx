import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RetirementTaxChecker } from '@/components/calculators/RetirementTaxChecker'
import { checkRetirementTax } from '@/lib/retirement-tax/check'

describe('checkRetirementTax', () => {
  it('checks retirement income tax withholding against official calculated tax', () => {
    expect(
      checkRetirementTax({
        retirementPay: 80_000_000,
        officialRetirementIncomeTax: 2_400_000,
        actualNationalTax: 2_400_000,
        actualLocalTax: 240_000,
      })
    ).toMatchObject({
      expectedNationalTax: 2_400_000,
      expectedLocalTax: 240_000,
      expectedTotalTax: 2_640_000,
      actualTotalTax: 2_640_000,
      totalTaxDifference: 0,
      status: 'match',
    })
  })

  it('flags under-withholding when actual retirement tax is below official calculated tax', () => {
    expect(
      checkRetirementTax({
        retirementPay: 80_000_000,
        officialRetirementIncomeTax: 2_400_000,
        actualNationalTax: 2_000_000,
        actualLocalTax: 200_000,
      })
    ).toMatchObject({
      nationalTaxDifference: -400_000,
      localTaxDifference: -40_000,
      totalTaxDifference: -440_000,
      status: 'under_withheld',
    })
  })
})

describe('RetirementTaxChecker', () => {
  it('renders the default retirement tax check result', () => {
    render(<RetirementTaxChecker />)

    const result = screen.getByRole('region', { name: '퇴직소득세 검산 결과' })
    expect(screen.getByLabelText('퇴직급여')).toHaveValue('80000000')
    expect(within(result).getByRole('row', { name: '예상 소득세 2,400,000원' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '예상 지방소득세 240,000원' })).toBeInTheDocument()
    expect(within(result).getByText('공식 산출세액 기준 일치')).toBeInTheDocument()
  })

  it('updates the difference when actual withholding changes', () => {
    render(<RetirementTaxChecker />)

    fireEvent.change(screen.getByLabelText('실제 원천징수 소득세'), { target: { value: '2000000' } })

    const result = screen.getByRole('region', { name: '퇴직소득세 검산 결과' })
    expect(within(result).getByRole('row', { name: '소득세 차이 -400,000원' })).toBeInTheDocument()
    expect(within(result).getByText('실제 원천징수액이 기준보다 적음')).toBeInTheDocument()
  })
})
