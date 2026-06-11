'use client'

import { useMemo, useState } from 'react'
import { checkMonthlyWithholding, type MonthlyWithholdingStatus } from '@/lib/monthly-withholding/check'

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

function statusText(status: MonthlyWithholdingStatus) {
  if (status === 'match') return '공식 간이세액표 값 기준 일치'
  if (status === 'under_withheld') return '회사 원천징수액이 기준보다 적음'
  return '회사 원천징수액이 기준보다 많음'
}

export function MonthlyWithholdingChecker() {
  const [taxableMonthlyPay, setTaxableMonthlyPay] = useState('3500000')
  const [familyCount, setFamilyCount] = useState('2')
  const [childCount8To20, setChildCount8To20] = useState('1')
  const [officialSimpleTax, setOfficialSimpleTax] = useState('84000')
  const [withholdingRatePercent, setWithholdingRatePercent] = useState<'80' | '100' | '120'>('100')
  const [actualNationalTax, setActualNationalTax] = useState('84000')
  const [actualLocalTax, setActualLocalTax] = useState('8400')

  const result = useMemo(
    () =>
      checkMonthlyWithholding({
        taxableMonthlyPay: won(taxableMonthlyPay),
        familyCount: Number(familyCount) || 1,
        childCount8To20: Number(childCount8To20) || 0,
        officialSimpleTax: won(officialSimpleTax),
        withholdingRatePercent: Number(withholdingRatePercent) as 80 | 100 | 120,
        actualNationalTax: won(actualNationalTax),
        actualLocalTax: won(actualLocalTax),
      }),
    [
      actualLocalTax,
      actualNationalTax,
      childCount8To20,
      familyCount,
      officialSimpleTax,
      taxableMonthlyPay,
      withholdingRatePercent,
    ]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 840 }}>
        <div>
          <label htmlFor="mw-pay" style={label}>월 과세급여</label>
          <input id="mw-pay" style={field} inputMode="numeric" value={taxableMonthlyPay} onChange={(e) => setTaxableMonthlyPay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="mw-family" style={label}>공제대상 가족 수</label>
          <input id="mw-family" style={field} inputMode="numeric" value={familyCount} onChange={(e) => setFamilyCount(e.target.value)} />
        </div>
        <div>
          <label htmlFor="mw-child" style={label}>8~20세 자녀 수</label>
          <input id="mw-child" style={field} inputMode="numeric" value={childCount8To20} onChange={(e) => setChildCount8To20(e.target.value)} />
        </div>
        <div>
          <label htmlFor="mw-official-tax" style={label}>간이세액표 소득세</label>
          <input id="mw-official-tax" style={field} inputMode="numeric" value={officialSimpleTax} onChange={(e) => setOfficialSimpleTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="mw-rate" style={label}>선택 원천징수비율</label>
          <select id="mw-rate" style={field} value={withholdingRatePercent} onChange={(e) => setWithholdingRatePercent(e.target.value as '80' | '100' | '120')}>
            <option value="80">80%</option>
            <option value="100">100%</option>
            <option value="120">120%</option>
          </select>
        </div>
        <div>
          <label htmlFor="mw-actual-national" style={label}>회사 원천징수 소득세</label>
          <input id="mw-actual-national" style={field} inputMode="numeric" value={actualNationalTax} onChange={(e) => setActualNationalTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="mw-actual-local" style={label}>회사 원천징수 지방소득세</label>
          <input id="mw-actual-local" style={field} inputMode="numeric" value={actualLocalTax} onChange={(e) => setActualLocalTax(e.target.value)} />
        </div>
      </div>

      <section
        aria-label="월 급여 원천징수 검산 결과"
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
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>과세급여 기준</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.taxableMonthlyPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>가족/자녀</td>
              <td style={{ textAlign: 'right' }}>
                {result.familyCount}명 / {result.childCount8To20}명
              </td>
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
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>차이</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.nationalTaxDifference)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>합계 차이</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.totalTaxDifference)}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          간이세액표 소득세는 국세청 홈택스의 2026.03.01 시행 근로소득 간이세액표 조회값을 입력합니다.
          월 급여액은 비과세 소득을 제외한 금액입니다.
        </p>
      </section>
    </div>
  )
}
