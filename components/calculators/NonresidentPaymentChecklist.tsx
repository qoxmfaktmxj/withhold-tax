'use client'

import { useMemo, useState } from 'react'
import {
  evaluateNonresidentPayment,
  type NonresidentIncomeType,
  type NonresidentPayeeType,
} from '@/lib/nonresident-payment/checklist'

const field: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--white)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
}
const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--gray-600)',
  marginBottom: 6,
}
const rateModeLabel = {
  domestic_law: '국내법 세율 적용',
  domestic_law_required: '국내법 세율 적용 필요',
  treaty_ready: '조세조약 제한세율 적용 준비',
}
const filingStatusLabel = {
  not_required: '제출 대상 아님',
  required_not_filed: '제출 필요',
  filed: '제출 완료',
  overdue: '제출기한 경과',
}

export function NonresidentPaymentChecklist() {
  const [paymentDate, setPaymentDate] = useState('2026-06-10')
  const [payeeType, setPayeeType] = useState<NonresidentPayeeType>('individual')
  const [incomeType, setIncomeType] = useState<NonresidentIncomeType>('royalty')
  const [treatyApplied, setTreatyApplied] = useState(false)
  const [treatyApplicationFormDate, setTreatyApplicationFormDate] = useState('')
  const [residenceCertificateDate, setResidenceCertificateDate] = useState('')
  const [beneficialOwnerConfirmed, setBeneficialOwnerConfirmed] = useState(false)
  const [taxOfficeFilingDate, setTaxOfficeFilingDate] = useState('')

  const decision = useMemo(
    () =>
      evaluateNonresidentPayment({
        paymentDate,
        payeeType,
        incomeType,
        treatyApplied,
        treatyApplicationFormDate: treatyApplicationFormDate || null,
        residenceCertificateDate: residenceCertificateDate || null,
        beneficialOwnerConfirmed,
        taxOfficeFilingDate: taxOfficeFilingDate || null,
      }),
    [
      beneficialOwnerConfirmed,
      incomeType,
      payeeType,
      paymentDate,
      residenceCertificateDate,
      taxOfficeFilingDate,
      treatyApplicationFormDate,
      treatyApplied,
    ]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, maxWidth: 860 }}>
        <div>
          <label htmlFor="nr-payee-type" style={label}>대상자 유형</label>
          <select id="nr-payee-type" style={field} value={payeeType} onChange={(e) => setPayeeType(e.target.value as NonresidentPayeeType)}>
            <option value="individual">비거주자(개인)</option>
            <option value="foreign_corporation">외국법인</option>
          </select>
        </div>
        <div>
          <label htmlFor="nr-income-type" style={label}>소득 유형</label>
          <select id="nr-income-type" style={field} value={incomeType} onChange={(e) => setIncomeType(e.target.value as NonresidentIncomeType)}>
            <option value="interest">이자</option>
            <option value="dividend">배당</option>
            <option value="business">사업</option>
            <option value="royalty">사용료</option>
            <option value="earned">근로</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div>
          <label htmlFor="nr-payment-date" style={label}>지급일</label>
          <input id="nr-payment-date" style={field} type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>
        <label
          htmlFor="nr-treaty"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, color: 'var(--gray-700)', fontSize: '0.86rem', fontWeight: 600 }}
        >
          <input id="nr-treaty" type="checkbox" checked={treatyApplied} onChange={(e) => setTreatyApplied(e.target.checked)} />
          조세조약 적용
        </label>
        <div>
          <label htmlFor="nr-treaty-form-date" style={label}>제한세율 신청서 수령일</label>
          <input
            id="nr-treaty-form-date"
            style={field}
            type="date"
            value={treatyApplicationFormDate}
            onChange={(e) => setTreatyApplicationFormDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nr-residence-cert-date" style={label}>거주자증명서 수령일</label>
          <input
            id="nr-residence-cert-date"
            style={field}
            type="date"
            value={residenceCertificateDate}
            onChange={(e) => setResidenceCertificateDate(e.target.value)}
          />
        </div>
        <label
          htmlFor="nr-beneficial-owner"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, color: 'var(--gray-700)', fontSize: '0.86rem', fontWeight: 600 }}
        >
          <input
            id="nr-beneficial-owner"
            type="checkbox"
            checked={beneficialOwnerConfirmed}
            onChange={(e) => setBeneficialOwnerConfirmed(e.target.checked)}
          />
          실질귀속자 확인 완료
        </label>
        <div>
          <label htmlFor="nr-tax-office-date" style={label}>세무서 제출일</label>
          <input id="nr-tax-office-date" style={field} type="date" value={taxOfficeFilingDate} onChange={(e) => setTaxOfficeFilingDate(e.target.value)} />
        </div>
      </div>

      <section
        aria-label="비거주자 지급 점검 결과"
        style={{
          marginTop: 18,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)',
          padding: '18px 20px',
          maxWidth: 860,
        }}
      >
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>제출 기한</td>
              <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--blue-700)' }}>{decision.filingDeadline}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>제출 상태</td>
              <td style={{ textAlign: 'right' }}>{filingStatusLabel[decision.treatyApplicationFilingStatus]}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>적용 판단</td>
              <td style={{ textAlign: 'right' }}>{rateModeLabel[decision.rateMode]}</td>
            </tr>
          </tbody>
        </table>

        {decision.blockingErrors.length > 0 && (
          <div style={{ marginTop: 14, border: '1px solid var(--danger-border)', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
            {decision.blockingErrors.map((issue) => (
              <p key={issue.code} style={{ margin: 0, color: 'var(--danger-text)', fontWeight: 700 }}>
                {issue.message}
              </p>
            ))}
          </div>
        )}

        <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: 'var(--gray-600)', fontSize: '0.8rem', lineHeight: 1.65 }}>
          {decision.warnings.map((issue) => (
            <li key={issue.code}>{issue.message}</li>
          ))}
        </ul>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {decision.checklistItems.map((item) => (
            <span key={item} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', fontSize: '0.78rem', color: 'var(--gray-700)' }}>
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
