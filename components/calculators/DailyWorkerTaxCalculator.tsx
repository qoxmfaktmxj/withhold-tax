'use client'

import { useMemo, useState } from 'react'
import {
  calcDailyWorkerTax,
  type DailyWorkerPaymentMethod,
  type DailyWorkerTaxStatus,
} from '@/lib/daily-worker/check'

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

function statusText(status: DailyWorkerTaxStatus) {
  if (status === 'no_tax') return '원천징수할 세액 없음'
  if (status === 'small_sum_exempt') return '소액부징수 적용 — 원천징수 세액 0원'
  return '원천징수 대상'
}

export function DailyWorkerTaxCalculator() {
  const [dailyWage, setDailyWage] = useState('187000')
  const [workDays, setWorkDays] = useState('1')
  const [paymentMethod, setPaymentMethod] = useState<DailyWorkerPaymentMethod>('per_day')

  const result = useMemo(
    () =>
      calcDailyWorkerTax({
        dailyWage: won(dailyWage),
        workDays: Number(workDays) || 0,
        paymentMethod,
      }),
    [dailyWage, paymentMethod, workDays]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 840 }}>
        <div>
          <label htmlFor="dw-wage" style={label}>일당</label>
          <input id="dw-wage" style={field} inputMode="numeric" value={dailyWage} onChange={(e) => setDailyWage(e.target.value)} />
        </div>
        <div>
          <label htmlFor="dw-days" style={label}>근무일수</label>
          <input id="dw-days" style={field} inputMode="numeric" value={workDays} onChange={(e) => setWorkDays(e.target.value)} />
        </div>
        <div>
          <label htmlFor="dw-method" style={label}>지급방식</label>
          <select id="dw-method" style={field} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as DailyWorkerPaymentMethod)}>
            <option value="per_day">일별 지급</option>
            <option value="lump_sum">월 일괄 지급</option>
          </select>
        </div>
      </div>

      <section
        aria-label="일용근로 원천징수 계산 결과"
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
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.05rem' }}>계산 결과</h2>
        <p
          className="wt-mono"
          style={{
            display: 'inline-block',
            margin: '0 0 12px',
            color: result.status === 'withhold' ? 'var(--caution-text)' : 'var(--blue-700)',
            fontSize: '0.78rem',
            fontWeight: 800,
          }}
        >
          {statusText(result.status)}
        </p>
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>총지급액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.totalPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>일별 산정세액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.dailyIncomeTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>산정세액 합계</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.calculatedTotalIncomeTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>소액부징수</td>
              <td style={{ textAlign: 'right' }}>{result.smallSumApplied ? '적용' : '미적용'}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>징수 소득세</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800 }}>{KRW(result.withheldIncomeTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지방소득세</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.withheldLocalTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>징수세액 합계</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.totalWithheldTax)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>실수령액</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800 }}>{KRW(result.netPay)}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          일세액 = (일당 − 150,000원) × 6% × (1 − 55%). 세액 1,000원 미만은 소액부징수로 원천징수하지
          않으며, 일정 기간 단위 일괄지급 시에는 일별 세액 합계액 기준으로 판단합니다. 본 결과는 실무
          참조용이며, 최종 확인은 법령(국가법령정보센터)·국세청 홈택스 기준이 우선합니다.
        </p>
      </section>
    </div>
  )
}
