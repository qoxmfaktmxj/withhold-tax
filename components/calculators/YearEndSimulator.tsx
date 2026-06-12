'use client'

import { useMemo, useState } from 'react'
import { simulateYearEndSettlement } from '@/lib/year-end/simulate'

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

export function YearEndSimulator() {
  const [grossAnnualPay, setGrossAnnualPay] = useState('50000000')
  const [prepaidTax, setPrepaidTax] = useState('2100000')
  const [additionalDependents, setAdditionalDependents] = useState('1')
  const [children, setChildren] = useState('2')
  const [pensionContribution, setPensionContribution] = useState('2160000')
  const [deductionTotal, setDeductionTotal] = useState('3000000')

  const result = useMemo(
    () =>
      simulateYearEndSettlement({
        grossAnnualPay: parseWon(grossAnnualPay),
        prepaidTax: parseWon(prepaidTax),
        additionalDependents: Number(additionalDependents) || 0,
        children: Number(children) || 0,
        pensionContribution: parseWon(pensionContribution),
        deductionTotal: parseWon(deductionTotal),
      }),
    [additionalDependents, children, deductionTotal, grossAnnualPay, pensionContribution, prepaidTax],
  )

  const settlementLabel =
    result.status === 'refund' ? '환급 예상액' : result.status === 'additional' ? '추가납부 예상액' : '정산 차액'
  const settlementAmount =
    result.status === 'refund' ? result.refundAmount : result.status === 'additional' ? result.additionalTax : 0

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 860 }}>
        <div>
          <label htmlFor="year-end-gross" style={label}>총급여</label>
          <input id="year-end-gross" style={field} inputMode="numeric" value={grossAnnualPay} onChange={(event) => setGrossAnnualPay(event.target.value)} />
        </div>
        <div>
          <label htmlFor="year-end-prepaid" style={label}>기납부세액</label>
          <input id="year-end-prepaid" style={field} inputMode="numeric" value={prepaidTax} onChange={(event) => setPrepaidTax(event.target.value)} />
        </div>
        <div>
          <label htmlFor="year-end-dependents" style={label}>인적공제 인원(본인 외)</label>
          <input id="year-end-dependents" style={field} inputMode="numeric" value={additionalDependents} onChange={(event) => setAdditionalDependents(event.target.value)} />
        </div>
        <div>
          <label htmlFor="year-end-children" style={label}>자녀 수</label>
          <input id="year-end-children" style={field} inputMode="numeric" value={children} onChange={(event) => setChildren(event.target.value)} />
        </div>
        <div>
          <label htmlFor="year-end-pension" style={label}>연금보험료</label>
          <input id="year-end-pension" style={field} inputMode="numeric" value={pensionContribution} onChange={(event) => setPensionContribution(event.target.value)} />
        </div>
        <div>
          <label htmlFor="year-end-deductions" style={label}>직접입력 공제 합계</label>
          <input id="year-end-deductions" style={field} inputMode="numeric" value={deductionTotal} onChange={(event) => setDeductionTotal(event.target.value)} />
        </div>
      </div>

      <section
        aria-label="연말정산 시뮬레이션 결과"
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
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.05rem' }}>시뮬레이션 결과</h2>
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>과세표준</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.taxBase)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>산출세액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.calculatedTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>근로소득세액공제</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.earnedIncomeTaxCredit)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>자녀세액공제</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.childTaxCredit)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>결정 소득세</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, color: 'var(--blue-700)' }}>{KRW(result.finalIncomeTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지방소득세 10% 참고</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.localIncomeTax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 700 }}>{settlementLabel}</td>
              <td style={{ textAlign: 'right', fontWeight: 800 }}>{KRW(settlementAmount)}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          신용카드·의료비 등 세부 공제율을 자동 계산하지 않는 직접입력 방식의 간이 추정입니다. 결정세액은 실제 연말정산 자료와 달라질 수 있습니다.
        </p>
      </section>
    </div>
  )
}
