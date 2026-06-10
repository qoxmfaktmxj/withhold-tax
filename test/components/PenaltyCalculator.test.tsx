import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PenaltyCalculator } from '@/components/calculators/PenaltyCalculator'

describe('PenaltyCalculator', () => {
  it('shows automatic amount for pre-2026-07-01 due dates', () => {
    render(<PenaltyCalculator />)

    expect(screen.getByText('예상 납부지연가산세')).toBeInTheDocument()
    expect(screen.getByText('52,000원')).toBeInTheDocument()
  })

  it('does not auto-calculate revised 2026-07-01+ penalty rules', () => {
    render(<PenaltyCalculator />)

    fireEvent.change(screen.getByLabelText('법정납부기한'), { target: { value: '2026-07-10' } })
    fireEvent.change(screen.getByLabelText('실제 납부(예정)일'), { target: { value: '2026-08-20' } })

    expect(screen.queryByText('예상 납부지연가산세')).not.toBeInTheDocument()
    expect(screen.getByText(/2026\.7\.1 이후 지정납부기한 도래분은 자동 계산을 중지합니다/)).toBeInTheDocument()
  })
})
