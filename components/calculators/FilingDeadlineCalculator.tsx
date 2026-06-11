'use client'

import { useMemo, useState } from 'react'
import deadlinesRaw from '@/content/tax-rules/2026/deadlines.json'
import { calculateDeadline, loadRules } from '@/lib/rules/engine'

const RULES = loadRules(deadlinesRaw).filter((rule) => rule.formula.type === 'date-rule')

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

export function FilingDeadlineCalculator() {
  const [ruleId, setRuleId] = useState('monthly_wht_filing')
  const [paymentDate, setPaymentDate] = useState('2026-01-25')
  const rule = RULES.find((item) => item.ruleId === ruleId) ?? RULES[0]
  const result = useMemo(() => calculateDeadline(rule, { paymentDate }), [paymentDate, rule])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, maxWidth: 760 }}>
        <div>
          <label htmlFor="deadline-rule" style={label}>신고·제출 유형</label>
          <select id="deadline-rule" style={field} value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
            {RULES.map((item) => (
              <option key={item.ruleId} value={item.ruleId}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deadline-payment-date" style={label}>지급일</label>
          <input
            id="deadline-payment-date"
            style={field}
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>
      </div>

      <section
        aria-label="기한 계산 결과"
        style={{
          marginTop: 18,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)',
          padding: '18px 20px',
          maxWidth: 760,
        }}
      >
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>적용 rule</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                {result.ruleId}@{result.ruleVersion}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지급일</td>
              <td style={{ textAlign: 'right' }}>{paymentDate}</td>
            </tr>
            {result.periodLabel && (
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>대상 기간</td>
                <td style={{ textAlign: 'right' }}>{result.periodLabel}</td>
              </tr>
            )}
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>계산 기한</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, color: 'var(--blue-700)' }}>
                {result.dueDate}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>조정 기한</td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>{result.adjustedDueDate}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>조정 사유</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                {result.adjustmentReason}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          aria-label="알림 일정"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.76rem',
            color: 'var(--gray-700)',
          }}
        >
          <span>D-30 {result.reminderDates.d30}</span>
          <span>D-7 {result.reminderDates.d7}</span>
          <span>D-1 {result.reminderDates.d1}</span>
        </div>
        {result.warnings.length > 0 && (
          <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--gray-600)', fontSize: '0.78rem', lineHeight: 1.6 }}>
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
