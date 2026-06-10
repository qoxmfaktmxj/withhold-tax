'use client'

import { useMemo, useState } from 'react'
import ratesRaw from '@/content/tax-rules/2026/withholding-rates.json'
import { loadRules, pickRule, applyRateRule } from '@/lib/rules/engine'

const RULES = loadRules(ratesRaw)
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

export function BusinessIncomeCalculator() {
  const [gross, setGross] = useState('1000000')
  const [payDate, setPayDate] = useState('2026-06-10')

  const result = useMemo(() => {
    const grossPayment = Number(gross.replace(/[^0-9]/g, '')) || 0
    if (!grossPayment) return null
    const rule = pickRule(RULES, 'resident_business_income_wht', payDate || '2026-01-01')
    if (!rule) return null
    return { rule, calc: applyRateRule(rule, { grossPayment }), grossPayment }
  }, [gross, payDate])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, maxWidth: 640 }}>
        <div>
          <label htmlFor="bc-gross" style={label}>지급 총액(인적용역 사업소득)</label>
          <input id="bc-gross" style={field} inputMode="numeric" value={gross} onChange={(e) => setGross(e.target.value)} />
        </div>
        <div>
          <label htmlFor="bc-date" style={label}>지급일</label>
          <input id="bc-date" style={field} type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
        </div>
      </div>

      {result && (
        <div
          style={{
            marginTop: 18,
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-xs)',
            padding: '18px 20px',
            maxWidth: 640,
          }}
        >
          <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>소득세(3%) — 세무서 납부</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.calc.nationalTax)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지방소득세(소득세의 10%) — 지자체 납부</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.calc.localTax)}</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0 0', fontWeight: 700 }}>원천징수 합계(3.3%)</td>
                <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, fontSize: '1.05rem', color: 'var(--blue-700)' }}>
                  {KRW(result.calc.total)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: 'var(--gray-500)', fontSize: '0.78rem' }}>실지급액</td>
                <td style={{ textAlign: 'right', color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                  {KRW(result.grossPayment - result.calc.total)}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
            세액은 10원 미만 절사 기준. 신고·납부 기한: 지급일이 속한 달의 다음 달 10일.
          </p>
        </div>
      )}
    </div>
  )
}
