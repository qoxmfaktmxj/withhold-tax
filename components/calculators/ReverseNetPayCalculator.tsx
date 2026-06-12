'use client'

import { useMemo, useState } from 'react'
import { calculateReverseNetPay, TAX_YEAR } from '@/lib/reverse-net-pay/calc'

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

function won(value: string): number {
  return Number(value.replace(/[^0-9]/g, '')) || 0
}

export function ReverseNetPayCalculator() {
  const [targetNetMonthlyPay, setTargetNetMonthlyPay] = useState('4000000')
  const [dependents, setDependents] = useState('1')
  const [nonTaxableMonthlyPay, setNonTaxableMonthlyPay] = useState('0')

  const result = useMemo(
    () =>
      calculateReverseNetPay({
        targetNetMonthlyPay: won(targetNetMonthlyPay),
        dependents: Number(dependents) || 1,
        nonTaxableMonthlyPay: won(nonTaxableMonthlyPay),
      }),
    [dependents, nonTaxableMonthlyPay, targetNetMonthlyPay]
  )

  const b = result.breakdown

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 840 }}>
        <div>
          <label htmlFor="rnp-target" style={label}>희망 월 실수령액</label>
          <input id="rnp-target" style={field} inputMode="numeric" value={targetNetMonthlyPay} onChange={(e) => setTargetNetMonthlyPay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="rnp-dependents" style={label}>부양가족 수(본인 포함)</label>
          <input id="rnp-dependents" style={field} inputMode="numeric" value={dependents} onChange={(e) => setDependents(e.target.value)} />
        </div>
        <div>
          <label htmlFor="rnp-nontaxable" style={label}>월 비과세 합계</label>
          <input id="rnp-nontaxable" style={field} inputMode="numeric" value={nonTaxableMonthlyPay} onChange={(e) => setNonTaxableMonthlyPay(e.target.value)} />
        </div>
      </div>

      <section
        aria-label="세후 세전 역산 결과"
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
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.05rem' }}>역산 결과 ({TAX_YEAR} 귀속)</h2>
        <p
          className="wt-mono"
          style={{
            display: 'inline-block',
            margin: '0 0 12px',
            color: result.converged ? 'var(--blue-700)' : 'var(--caution-text)',
            fontSize: '0.78rem',
            fontWeight: 800,
          }}
        >
          {result.converged
            ? `반복 ${result.iterations}회 수렴 (오차 ${KRW(Math.abs(result.netDifference))})`
            : `최대 반복(${result.iterations}회) 도달 — 근사치 (오차 ${KRW(Math.abs(result.netDifference))})`}
        </p>
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 700 }}>예상 세전 월급(총지급액)</td>
              <td style={{ textAlign: 'right', fontWeight: 800 }}>{KRW(result.grossMonthlyPay)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 4px', color: 'var(--gray-600)' }}>과세급여</td>
              <td style={{ textAlign: 'right', padding: '8px 0 4px' }}>{KRW(result.taxableMonthlyPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>비과세 합계</td>
              <td style={{ textAlign: 'right' }}>{KRW(b.nonTaxableMonthlyPay)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 4px', color: 'var(--gray-600)' }}>국민연금(4.75%)</td>
              <td style={{ textAlign: 'right', padding: '8px 0 4px' }}>{KRW(b.nationalPension)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>건강보험(3.595%)</td>
              <td style={{ textAlign: 'right' }}>{KRW(b.healthInsurance)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>장기요양(건보료의 13.14%)</td>
              <td style={{ textAlign: 'right' }}>{KRW(b.longTermCare)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>고용보험(0.9%)</td>
              <td style={{ textAlign: 'right' }}>{KRW(b.employmentInsurance)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>소득세(연 환산 근사)</td>
              <td style={{ textAlign: 'right' }}>{KRW(b.monthlyIncomeTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지방소득세(10%)</td>
              <td style={{ textAlign: 'right' }}>{KRW(b.monthlyLocalIncomeTax)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>공제 합계</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800 }}>{KRW(b.totalMonthlyDeductions)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>계산 실수령액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.achievedNetMonthlyPay)}</td>
            </tr>
          </tbody>
        </table>
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            background: 'var(--caution-bg)',
            border: '1px solid var(--caution-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--gray-700)',
            lineHeight: 1.6,
          }}
        >
          간이세액표가 아닌 연말정산 방식 연 환산 근사치 — 실제 월 원천징수액과 다를 수 있음.
          국민연금 상·하한은 2026.7.1 이후 기준(659만/41만)으로 연중 단일 적용 — 2026년 1~6월
          지급분은 직전 적용기간 기준이라 해당 기간은 오차가 더 커질 수 있습니다.
          비과세 항목별 한도는 검증하지 않습니다.
        </div>
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          실무 참조용 추정치입니다. 4대보험 고시 요율·간이세액표·연말정산 결과는 법령·홈택스·각 공단 확인이
          우선합니다.
        </p>
      </section>
    </div>
  )
}
