'use client'

import { useMemo, useState } from 'react'
import {
  calculateYearEndInstallmentSchedule,
  type YearEndSettlementIncomeType,
} from '@/lib/year-end/installment'

const formatter = new Intl.NumberFormat('ko-KR')

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

const incomeTypeOptions: Array<{ value: YearEndSettlementIncomeType; label: string }> = [
  { value: 'business', label: '사업소득 연말정산 대상' },
  { value: 'earned', label: '근로소득' },
  { value: 'religious', label: '종교인소득 등' },
]

export function YearEndInstallmentScheduler() {
  const [incomeType, setIncomeType] = useState<YearEndSettlementIncomeType>('business')
  const [settlementYear, setSettlementYear] = useState(2026)
  const [additionalTax, setAdditionalTax] = useState(150_000)
  const schedule = useMemo(
    () => calculateYearEndInstallmentSchedule({ incomeType, settlementYear, additionalTax }),
    [additionalTax, incomeType, settlementYear]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, maxWidth: 840 }}>
        <div>
          <label htmlFor="yas-income-type" style={label}>대상 소득 유형</label>
          <select
            id="yas-income-type"
            style={field}
            value={incomeType}
            onChange={(event) => setIncomeType(event.target.value as YearEndSettlementIncomeType)}
          >
            {incomeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="yas-settlement-year" style={label}>연말정산 귀속연도</label>
          <input
            id="yas-settlement-year"
            style={field}
            type="number"
            min={2026}
            value={settlementYear}
            onChange={(event) => setSettlementYear(Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="yas-additional-tax" style={label}>추가납부세액</label>
          <input
            id="yas-additional-tax"
            style={field}
            type="number"
            min={0}
            step={1}
            value={additionalTax}
            onChange={(event) => setAdditionalTax(Number(event.target.value))}
          />
        </div>
      </div>

      <section
        aria-label="분납 스케줄 결과"
        style={{
          marginTop: 18,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)',
          padding: '18px 20px',
          maxWidth: 840,
        }}
      >
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>분납 기준</td>
              <td style={{ textAlign: 'right' }}>{formatter.format(schedule.threshold)}원 초과</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>근거 fact</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                {schedule.factIds.length > 0 ? schedule.factIds.join(', ') : 'fact 확인 필요'}
              </td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>판정</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, color: schedule.status === 'available' ? 'var(--blue-700)' : 'var(--red-700)' }}>
                {schedule.status === 'available' ? '분납 스케줄 생성' : schedule.status === 'not_available' ? '분납 대상 아님' : '수동 검토 필요'}
              </td>
            </tr>
          </tbody>
        </table>

        {schedule.installments.length > 0 && (
          <table style={{ width: '100%', marginTop: 14, fontSize: '0.88rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--gray-600)' }}>지급월</th>
                <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--gray-600)' }}>추가 원천징수액</th>
              </tr>
            </thead>
            <tbody>
              {schedule.installments.map((item) => (
                <tr key={`${item.year}-${item.month}`}>
                  <td style={{ padding: '6px 0' }}>{item.year}년 {item.month}월</td>
                  <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700 }}>{formatter.format(item.amount)}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {(schedule.reportMemo || schedule.reviewNote) && (
          <p style={{ margin: '12px 0 0', color: 'var(--gray-600)', fontSize: '0.78rem', lineHeight: 1.6 }}>
            {schedule.reportMemo ?? schedule.reviewNote}
          </p>
        )}
      </section>
    </div>
  )
}
