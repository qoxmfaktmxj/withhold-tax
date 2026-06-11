import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PenaltyCalculator } from '@/components/calculators/PenaltyCalculator'

describe('PenaltyCalculator', () => {
  it('shows automatic amount for pre-2026-07-01 due dates', () => {
    render(<PenaltyCalculator />)

    expect(screen.getByText('예상 납부지연가산세')).toBeInTheDocument()
    expect(screen.getByText('52,000원')).toBeInTheDocument()
    expect(screen.getByLabelText('고지 전/후 여부')).toBeInTheDocument()
    expect(screen.getByText('전체 50% 한도')).toBeInTheDocument()
    expect(screen.getByText(/지방소득세 특별징수 가산세는 별도 체계/)).toBeInTheDocument()
  })

  it('shows revised 2026-07-01+ penalty components with manual-review flag', () => {
    render(<PenaltyCalculator />)

    fireEvent.change(screen.getByLabelText('법정납부기한'), { target: { value: '2026-07-10' } })
    fireEvent.change(screen.getByLabelText('실제 납부(예정)일'), { target: { value: '2026-11-20' } })
    fireEvent.change(screen.getByLabelText('고지 전/후 여부'), { target: { value: 'after_notice' } })
    fireEvent.change(screen.getByLabelText('납부고지일'), { target: { value: '2026-08-10' } })
    fireEvent.change(screen.getByLabelText('지정납부기한'), { target: { value: '2026-08-20' } })
    fireEvent.change(screen.getByLabelText('독촉비용'), { target: { value: '2500' } })

    expect(screen.getByText('예상 납부지연가산세')).toBeInTheDocument()
    expect(screen.getByText('고지 전 일할 이자')).toBeInTheDocument()
    expect(screen.getByText('지정납부기한 후 월할 이자')).toBeInTheDocument()
    expect(screen.getByText('독촉비용')).toBeInTheDocument()
    expect(screen.getByText('수동 검토')).toBeInTheDocument()
    expect(screen.getByText(/월 1만분의 67/)).toBeInTheDocument()
  })

  it('flags post-notice payments as bill-review required', () => {
    render(<PenaltyCalculator />)

    fireEvent.change(screen.getByLabelText('고지 전/후 여부'), { target: { value: 'after_notice' } })

    expect(screen.getByText(/고지 후 납부 구간은 납부고지서 기준 확인이 필요합니다/)).toBeInTheDocument()
  })

  it('selects the revised rule by designated due date for post-notice payments', () => {
    render(<PenaltyCalculator />)

    fireEvent.change(screen.getByLabelText('법정납부기한'), { target: { value: '2026-06-10' } })
    fireEvent.change(screen.getByLabelText('실제 납부(예정)일'), { target: { value: '2026-09-20' } })
    fireEvent.change(screen.getByLabelText('고지 전/후 여부'), { target: { value: 'after_notice' } })
    fireEvent.change(screen.getByLabelText('납부고지일'), { target: { value: '2026-07-10' } })
    fireEvent.change(screen.getByLabelText('지정납부기한'), { target: { value: '2026-07-20' } })

    expect(screen.getByText('wht_late_payment_penalty@2026.7.0')).toBeInTheDocument()
    expect(screen.getByText('지정납부기한 후 월할 이자')).toBeInTheDocument()
  })
})
