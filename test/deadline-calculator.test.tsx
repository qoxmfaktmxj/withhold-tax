import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import deadlinesRaw from '@/content/tax-rules/2026/deadlines.json'
import CalendarPage from '@/app/calendar/page'
import { FilingDeadlineCalculator } from '@/components/calculators/FilingDeadlineCalculator'
import { calculateDeadline, loadRules } from '@/lib/rules/engine'

const rules = loadRules(deadlinesRaw)

describe('calculateDeadline', () => {
  it('calculates monthly withholding due date', () => {
    const rule = rules.find((r) => r.ruleId === 'monthly_wht_filing')!

    expect(calculateDeadline(rule, { paymentDate: '2026-01-25' })).toMatchObject({
      dueDate: '2026-02-10',
      adjustedDueDate: '2026-02-10',
      adjustmentReason: 'none',
      reminderDates: {
        d30: '2026-01-11',
        d7: '2026-02-03',
        d1: '2026-02-09',
      },
    })
  })

  it('moves weekend deadlines to the next Monday and schedules reminders from the adjusted date', () => {
    const rule = rules.find((r) => r.ruleId === 'monthly_wht_filing')!

    expect(calculateDeadline(rule, { paymentDate: '2026-09-25' })).toMatchObject({
      dueDate: '2026-10-10',
      adjustedDueDate: '2026-10-12',
      adjustmentReason: 'weekend',
      reminderDates: {
        d30: '2026-09-12',
        d7: '2026-10-05',
        d1: '2026-10-11',
      },
    })
  })

  it('calculates next-month-end statement deadlines', () => {
    const rule = rules.find((r) => r.ruleId === 'simplified_statement_business_other_monthly')!

    expect(calculateDeadline(rule, { paymentDate: '2026-06-10' })).toMatchObject({
      dueDate: '2026-07-31',
    })
  })

  it('calculates tax-year based end-of-February deadlines', () => {
    const rule = rules.find((r) => r.ruleId === 'payment_statement_others')!

    expect(calculateDeadline(rule, { paymentDate: '2026-06-10' })).toMatchObject({
      dueDate: '2027-02-28',
    })
  })

  it('calculates earned simplified statement half-year deadlines', () => {
    const rule = rules.find((r) => r.ruleId === 'simplified_statement_earned_halfyear')!

    expect(calculateDeadline(rule, { paymentDate: '2026-06-30' })).toMatchObject({
      dueDate: '2026-07-31',
      periodLabel: '상반기 1~6월 지급분',
    })
    expect(calculateDeadline(rule, { paymentDate: '2026-07-01' })).toMatchObject({
      dueDate: '2027-01-31',
      periodLabel: '하반기 7~12월 지급분',
    })
    expect(calculateDeadline(rule, { taxYear: 2026, half: 'H1' })).toMatchObject({
      dueDate: '2026-07-31',
      adjustedDueDate: '2026-07-31',
      periodLabel: '상반기 1~6월 지급분',
    })
  })

  it('uses baseDate as the operational date input when paymentDate is absent', () => {
    const rule = rules.find((r) => r.ruleId === 'payment_statement_daily_worker')!

    expect(calculateDeadline(rule, { baseDate: '2026-06-10' })).toMatchObject({
      dueDate: '2026-07-31',
      adjustedDueDate: '2026-07-31',
      adjustmentReason: 'none',
    })
  })
})

describe('FilingDeadlineCalculator', () => {
  it('renders monthly withholding due date by default', () => {
    render(<FilingDeadlineCalculator />)

    const result = screen.getByRole('region', { name: '기한 계산 결과' })
    expect(screen.getByRole('combobox', { name: '신고·제출 유형' })).toHaveValue('monthly_wht_filing')
    expect(within(result).getByRole('row', { name: '계산 기한 2026-02-10' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '조정 기한 2026-02-10' })).toBeInTheDocument()
    expect(within(result).getByText('D-30 2026-01-11')).toBeInTheDocument()
  })

  it('updates half-year simplified statement deadline', () => {
    render(<FilingDeadlineCalculator />)

    fireEvent.change(screen.getByRole('combobox', { name: '신고·제출 유형' }), {
      target: { value: 'simplified_statement_earned_halfyear' },
    })
    fireEvent.change(screen.getByLabelText('지급일'), { target: { value: '2026-08-15' } })

    const result = screen.getByRole('region', { name: '기한 계산 결과' })
    expect(within(result).getByRole('row', { name: '대상 기간 하반기 7~12월 지급분' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '계산 기한 2027-01-31' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '조정 사유 weekend' })).toBeInTheDocument()
  })
})

describe('CalendarPage', () => {
  it('renders calculated adjusted dates and reminder dates instead of expression-only rows', () => {
    render(<CalendarPage />)

    expect(screen.getAllByRole('columnheader', { name: '산출 일정' })).toHaveLength(4)
    expect(screen.getAllByText(/조정 기한/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/D-30/)[0]).toBeInTheDocument()
  })
})
