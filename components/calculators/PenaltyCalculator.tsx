'use client'

import { useMemo, useState } from 'react'
import penaltyRulesRaw from '@/content/tax-rules/2026/penalty-rules.json'
import { loadRules, pickRule, withholdingLatePenalty } from '@/lib/rules/engine'

const RULES = loadRules(penaltyRulesRaw)
const KRW = (n: number) => n.toLocaleString('ko-KR') + '원'

function daysBetween(a: string, b: string): number {
  const ms = new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

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

export function PenaltyCalculator() {
  const [unpaid, setUnpaid] = useState('1000000')
  const [dueDate, setDueDate] = useState('2026-01-10')
  const [payDate, setPayDate] = useState('2026-04-20')

  const result = useMemo(() => {
    const unpaidTax = Number(unpaid.replace(/[^0-9]/g, '')) || 0
    if (!unpaidTax || !dueDate || !payDate || payDate < dueDate) return null
    const rule = pickRule(RULES, 'wht_late_payment_penalty', dueDate)
    if (!rule) return null
    const daysLate = daysBetween(dueDate, payDate)
    return { rule, daysLate, calc: withholdingLatePenalty(rule, { unpaidTax, daysLate }), unpaidTax }
  }, [unpaid, dueDate, payDate])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, maxWidth: 640 }}>
        <div>
          <label htmlFor="pc-unpaid" style={label}>미납·과소납부 세액(원천세 본세)</label>
          <input id="pc-unpaid" style={field} inputMode="numeric" value={unpaid} onChange={(e) => setUnpaid(e.target.value)} />
        </div>
        <div>
          <label htmlFor="pc-due" style={label}>법정납부기한</label>
          <input id="pc-due" style={field} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="pc-pay" style={label}>실제 납부(예정)일</label>
          <input id="pc-pay" style={field} type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
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
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>적용 rule</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                  {result.rule.ruleId}@{result.rule.version}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지연 일수</td>
                <td style={{ textAlign: 'right' }}>{result.daysLate}일</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>기본 가산(3%)</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.calc.basePenalty)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>이자 가산(22/100,000 × 일수)</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.calc.dailyPenalty)}</td>
              </tr>
              {result.calc.capApplied && (
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>한도 적용(미납세액×10%)</td>
                  <td style={{ textAlign: 'right', color: 'var(--blue-700)' }}>{KRW(result.calc.capAmount)}</td>
                </tr>
              )}
              <tr style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0 0', fontWeight: 700 }}>예상 납부지연가산세</td>
                <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, fontSize: '1.05rem', color: 'var(--blue-700)' }}>
                  {KRW(result.calc.total)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: 'var(--gray-500)', fontSize: '0.78rem' }}>본세 포함 총 납부 예상</td>
                <td style={{ textAlign: 'right', color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                  {KRW(result.unpaidTax + result.calc.total)}
                </td>
              </tr>
            </tbody>
          </table>
          {dueDate >= '2026-07-01' && (
            <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--caution-text)' }}>
              2026.7.1 이후 지정납부기한 도래분 — 개정 산식(월할 이자·독촉비용)이 적용됩니다. 본 결과는 고지 전
              일할 구간 추정치이며 고지 이후 금액은 고지서 기준입니다.
            </p>
          )}
        </div>
      )}
      {!result && (
        <p style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--gray-500)' }}>
          금액과 날짜를 입력하면 예상 가산세를 계산합니다. (납부일은 법정납부기한 이후여야 합니다)
        </p>
      )}
    </div>
  )
}
