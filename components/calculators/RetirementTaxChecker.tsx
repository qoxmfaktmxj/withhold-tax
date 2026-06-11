'use client'

import { useMemo, useState } from 'react'
import { checkRetirementTax, type RetirementTaxStatus } from '@/lib/retirement-tax/check'

const KRW = (n: number) => n.toLocaleString('ko-KR') + '원'

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

function parseWon(value: string): number {
  return Number(value.replace(/[^0-9]/g, '')) || 0
}

function statusText(status: RetirementTaxStatus) {
  if (status === 'match') return '공식 산출세액 기준 일치'
  if (status === 'under_withheld') return '실제 원천징수액이 기준보다 적음'
  return '실제 원천징수액이 기준보다 많음'
}

export function RetirementTaxChecker() {
  const [retirementPay, setRetirementPay] = useState('80000000')
  const [officialRetirementIncomeTax, setOfficialRetirementIncomeTax] = useState('2400000')
  const [actualNationalTax, setActualNationalTax] = useState('2400000')
  const [actualLocalTax, setActualLocalTax] = useState('240000')

  const result = useMemo(
    () =>
      checkRetirementTax({
        retirementPay: parseWon(retirementPay),
        officialRetirementIncomeTax: parseWon(officialRetirementIncomeTax),
        actualNationalTax: parseWon(actualNationalTax),
        actualLocalTax: parseWon(actualLocalTax),
      }),
    [actualLocalTax, actualNationalTax, officialRetirementIncomeTax, retirementPay]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 820 }}>
        <div>
          <label htmlFor="retire-pay" style={label}>퇴직급여</label>
          <input id="retire-pay" style={field} inputMode="numeric" value={retirementPay} onChange={(e) => setRetirementPay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="retire-official-tax" style={label}>공식 산출 퇴직소득세</label>
          <input id="retire-official-tax" style={field} inputMode="numeric" value={officialRetirementIncomeTax} onChange={(e) => setOfficialRetirementIncomeTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="retire-actual-national" style={label}>실제 원천징수 소득세</label>
          <input id="retire-actual-national" style={field} inputMode="numeric" value={actualNationalTax} onChange={(e) => setActualNationalTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="retire-actual-local" style={label}>실제 원천징수 지방소득세</label>
          <input id="retire-actual-local" style={field} inputMode="numeric" value={actualLocalTax} onChange={(e) => setActualLocalTax(e.target.value)} />
        </div>
      </div>

      <section
        aria-label="퇴직소득세 검산 결과"
        style={{
          marginTop: 18,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)',
          padding: '18px 20px',
          maxWidth: 820,
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.05rem' }}>검산 결과</h2>
        <p
          className="wt-mono"
          style={{
            display: 'inline-block',
            margin: '0 0 12px',
            color: result.status === 'match' ? 'var(--blue-700)' : 'var(--caution-text)',
            fontSize: '0.78rem',
            fontWeight: 800,
          }}
        >
          {statusText(result.status)}
        </p>
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>퇴직급여</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.retirementPay)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>예상 소득세</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800 }}>{KRW(result.expectedNationalTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>예상 지방소득세</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.expectedLocalTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>소득세 차이</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.nationalTaxDifference)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>합계 차이</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.totalTaxDifference)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>실효세율</td>
              <td style={{ textAlign: 'right' }}>{result.effectiveTaxRate.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          퇴직소득세 산출세액은 홈택스 또는 사내 급여 시스템의 공식 계산값을 입력합니다. 이 도구는 산출세액과 실제 원천징수액의 차이를 검산합니다.
        </p>
      </section>
    </div>
  )
}
