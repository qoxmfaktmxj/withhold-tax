'use client'

import { useMemo, useState } from 'react'
import penaltyRulesRaw from '@/content/tax-rules/2026/penalty-rules.json'
import {
  applyPaymentStatementPenalty,
  loadRules,
  pickRule,
  type CompanySize,
  type PaymentStatementSubmissionStatus,
  type PaymentStatementType,
} from '@/lib/rules/engine'

const RULE = pickRule(loadRules(penaltyRulesRaw), 'payment_statement_penalty', '2026-06-10')
const KRW = (value: number) => `${value.toLocaleString('ko-KR')}원`
const PERCENT = (value: number) => `${(value * 100).toLocaleString('ko-KR', { maximumFractionDigits: 3 })}%`

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

export function StatementPenaltyCalculator() {
  const [amount, setAmount] = useState(10_000_000)
  const [statementType, setStatementType] = useState<PaymentStatementType>('annual')
  const [submissionStatus, setSubmissionStatus] = useState<PaymentStatementSubmissionStatus>('missing')
  const [companySize, setCompanySize] = useState<CompanySize>('general')
  const result = useMemo(() => {
    if (!RULE) return null
    return applyPaymentStatementPenalty(RULE, { amount, statementType, submissionStatus, companySize })
  }, [amount, companySize, statementType, submissionStatus])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 840 }}>
        <div>
          <label htmlFor="statement-amount" style={label}>미제출·지연제출 지급금액</label>
          <input
            id="statement-amount"
            style={field}
            type="number"
            min={0}
            step={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="statement-type" style={label}>명세서 유형</label>
          <select
            id="statement-type"
            style={field}
            value={statementType}
            onChange={(event) => setStatementType(event.target.value as PaymentStatementType)}
          >
            <option value="annual">지급명세서(연)</option>
            <option value="simplified">간이지급명세서</option>
          </select>
        </div>
        <div>
          <label htmlFor="submission-status" style={label}>제출 상태</label>
          <select
            id="submission-status"
            style={field}
            value={submissionStatus}
            onChange={(event) => setSubmissionStatus(event.target.value as PaymentStatementSubmissionStatus)}
          >
            <option value="missing">미제출</option>
            <option value="late">지연제출</option>
          </select>
        </div>
        <div>
          <label htmlFor="company-size" style={label}>기업 구분</label>
          <select
            id="company-size"
            style={field}
            value={companySize}
            onChange={(event) => setCompanySize(event.target.value as CompanySize)}
          >
            <option value="general">일반기업</option>
            <option value="sme">중소기업</option>
          </select>
        </div>
      </div>

      {result && (
        <section
          aria-label="지급명세서 가산세 계산 결과"
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
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>적용 rule</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                  {result.ruleId}@{result.ruleVersion}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>적용 세율</td>
                <td style={{ textAlign: 'right' }}>{PERCENT(result.rate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>한도</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.capAmount)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>한도 적용</td>
                <td style={{ textAlign: 'right' }}>{result.capApplied ? '적용' : '미적용'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>근거 fact</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                  {result.factIds.join(', ')}
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0 0', fontWeight: 700 }}>예상 가산세</td>
                <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, fontSize: '1.05rem', color: 'var(--blue-700)' }}>
                  {KRW(result.total)}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
            지연제출 경감기간과 제출 면제 여부는 소득 유형·지급연도·서식 기준으로 별도 확인하세요.
          </p>
        </section>
      )}
    </div>
  )
}
