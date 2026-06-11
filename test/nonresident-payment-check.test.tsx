import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NonresidentPaymentChecklist } from '@/components/calculators/NonresidentPaymentChecklist'
import { evaluateNonresidentPayment } from '@/lib/nonresident-payment/checklist'

describe('evaluateNonresidentPayment', () => {
  it('blocks treaty application without a limited-rate application form date', () => {
    const decision = evaluateNonresidentPayment({
      paymentDate: '2026-06-10',
      payeeType: 'individual',
      incomeType: 'royalty',
      treatyApplied: true,
      treatyApplicationFormDate: null,
      residenceCertificateDate: '2026-06-01',
      beneficialOwnerConfirmed: true,
      taxOfficeFilingDate: null,
      baseDate: '2027-02-01',
    })

    expect(decision.filingDeadline).toBe('2027-02-28')
    expect(decision.rateMode).toBe('domestic_law_required')
    expect(decision.treatyApplicationFilingStatus).toBe('required_not_filed')
    expect(decision.blockingErrors).toContainEqual(
      expect.objectContaining({ code: 'treaty_application_form_required' })
    )
  })

  it('tracks filed treaty applications as submitted', () => {
    const decision = evaluateNonresidentPayment({
      paymentDate: '2026-06-10',
      payeeType: 'foreign_corporation',
      incomeType: 'dividend',
      treatyApplied: true,
      treatyApplicationFormDate: '2026-06-01',
      residenceCertificateDate: '2026-06-01',
      beneficialOwnerConfirmed: true,
      taxOfficeFilingDate: '2027-02-20',
      baseDate: '2027-02-22',
    })

    expect(decision.treatyApplicationFilingStatus).toBe('filed')
  })

  it('marks missing treaty application filing as overdue after the deadline', () => {
    const decision = evaluateNonresidentPayment({
      paymentDate: '2026-06-10',
      payeeType: 'individual',
      incomeType: 'royalty',
      treatyApplied: true,
      treatyApplicationFormDate: '2026-06-01',
      residenceCertificateDate: '2026-06-01',
      beneficialOwnerConfirmed: true,
      taxOfficeFilingDate: null,
      baseDate: '2027-03-01',
    })

    expect(decision.treatyApplicationFilingStatus).toBe('overdue')
    expect(decision.warnings).toContainEqual(
      expect.objectContaining({ code: 'filing_overdue' })
    )
  })

  it('does not require a treaty application filing when domestic-law rates apply', () => {
    const decision = evaluateNonresidentPayment({
      paymentDate: '2026-06-10',
      payeeType: 'individual',
      incomeType: 'interest',
      treatyApplied: false,
      treatyApplicationFormDate: null,
      residenceCertificateDate: null,
      beneficialOwnerConfirmed: false,
      taxOfficeFilingDate: null,
      baseDate: '2027-03-01',
    })

    expect(decision.treatyApplicationFilingStatus).toBe('not_required')
  })

  it('warns for missing residence certificate and beneficial-owner confirmation', () => {
    const decision = evaluateNonresidentPayment({
      paymentDate: '2026-06-10',
      payeeType: 'foreign_corporation',
      incomeType: 'dividend',
      treatyApplied: true,
      treatyApplicationFormDate: '2026-06-01',
      residenceCertificateDate: null,
      beneficialOwnerConfirmed: false,
      taxOfficeFilingDate: null,
      baseDate: '2027-02-22',
    })

    expect(decision.rateMode).toBe('treaty_ready')
    expect(decision.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining([
        'residence_certificate_missing',
        'beneficial_owner_unconfirmed',
        'filing_due_soon_30',
        'filing_due_soon_7',
        'local_income_tax_separate',
        'foreign_corporation_treaty_filing',
      ])
    )
    expect(decision.warnings.find((warning) => warning.code === 'foreign_corporation_treaty_filing')?.message)
      .toContain('법인세법 제98조의6 제4항')
  })

  it('handles leap-year February deadline', () => {
    expect(
      evaluateNonresidentPayment({
        paymentDate: '2027-03-01',
        payeeType: 'individual',
        incomeType: 'interest',
        treatyApplied: false,
        treatyApplicationFormDate: null,
        residenceCertificateDate: null,
        beneficialOwnerConfirmed: false,
        taxOfficeFilingDate: null,
        baseDate: '2027-03-01',
      }).filingDeadline
    ).toBe('2028-02-29')
  })
})

describe('NonresidentPaymentChecklist', () => {
  it('renders the default filing deadline and domestic-law mode', () => {
    render(<NonresidentPaymentChecklist />)

    const result = screen.getByRole('region', { name: '비거주자 지급 점검 결과' })
    expect(within(result).getByRole('row', { name: '제출 기한 2027-02-28' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '제출 상태 제출 대상 아님' })).toBeInTheDocument()
    expect(within(result).getByRole('row', { name: '적용 판단 국내법 세율 적용' })).toBeInTheDocument()
    expect(screen.getByText(/지방소득세 특별징수는 별도 확인/)).toBeInTheDocument()
  })

  it('blocks treaty mode until the application form date is entered', () => {
    render(<NonresidentPaymentChecklist />)

    fireEvent.click(screen.getByLabelText('조세조약 적용'))

    expect(screen.getByText(/제한세율 신청서 수령일이 필수입니다/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('제한세율 신청서 수령일'), { target: { value: '2026-06-01' } })

    expect(screen.queryByText(/제한세율 신청서 수령일이 필수입니다/)).not.toBeInTheDocument()
  })
})
