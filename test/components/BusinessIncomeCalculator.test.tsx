import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BusinessIncomeCalculator } from '@/components/calculators/BusinessIncomeCalculator'

describe('BusinessIncomeCalculator', () => {
  it('keeps gross payment and payment date inputs available for the rule demo', () => {
    render(<BusinessIncomeCalculator />)

    expect(screen.getByLabelText('지급 총액(인적용역 사업소득)')).toHaveValue('1000000')
    expect(screen.getByLabelText('지급일')).toHaveValue('2026-06-10')
    expect(screen.getByLabelText('소득 분류')).toHaveValue('personal_service_resident')
  })

  it('computes the 3.3% resident business income withholding example', () => {
    render(<BusinessIncomeCalculator />)

    fireEvent.change(screen.getByLabelText('지급 총액(인적용역 사업소득)'), {
      target: { value: '333333' },
    })

    expect(screen.getByText('9,990원')).toBeInTheDocument()
    expect(screen.getByText('990원')).toBeInTheDocument()
    expect(screen.getByText('10,980원')).toBeInTheDocument()
  })

  it('redirects nonresident payments away from the resident 3.3% rule', () => {
    render(<BusinessIncomeCalculator />)

    fireEvent.change(screen.getByLabelText('소득 분류'), { target: { value: 'nonresident' } })

    expect(screen.queryByText('원천징수 합계(3.3%)')).not.toBeInTheDocument()
    expect(screen.getByText(/nonresident_general_wht/)).toBeInTheDocument()
  })

  it('requires manual review for registered-business transactions', () => {
    render(<BusinessIncomeCalculator />)

    fireEvent.change(screen.getByLabelText('소득 분류'), { target: { value: 'registered_business' } })

    expect(screen.queryByText('원천징수 합계(3.3%)')).not.toBeInTheDocument()
    expect(screen.getByText('세금계산서/사업자 거래 여부 확인 필요')).toBeInTheDocument()
  })
})
