'use client'

import { useMemo, useState } from 'react'
import { checkEmployeeLocalTax } from '@/lib/employee-local-tax/check'

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

export function EmployeeLocalTaxCalculator() {
  // 기본값: 면세점 초과 검증 사례(2026년 5월분)
  const [avgMonthlyPayroll, setAvgMonthlyPayroll] = useState('181000000')
  const [monthlyPayrollTotal, setMonthlyPayrollTotal] = useState('180000000')
  const [longServiceEmployeeCount, setLongServiceEmployeeCount] = useState('10')
  const [longServiceAllowancePerEmployee, setLongServiceAllowancePerEmployee] = useState('400000')
  const [longServiceMonthlyPayPerEmployee, setLongServiceMonthlyPayPerEmployee] = useState('4000000')
  const [childcareReplacementPay, setChildcareReplacementPay] = useState('15000000')
  const [otherDeduction, setOtherDeduction] = useState('14940000')
  const [paymentMonth, setPaymentMonth] = useState('2026-05')

  const result = useMemo(
    () =>
      checkEmployeeLocalTax({
        avgMonthlyPayroll: won(avgMonthlyPayroll),
        monthlyPayrollTotal: won(monthlyPayrollTotal),
        longServiceEmployeeCount: Number(longServiceEmployeeCount) || 0,
        longServiceAllowancePerEmployee: won(longServiceAllowancePerEmployee),
        longServiceMonthlyPayPerEmployee: won(longServiceMonthlyPayPerEmployee),
        childcareReplacementPay: won(childcareReplacementPay),
        otherDeduction: won(otherDeduction),
        paymentMonth: paymentMonth.trim(),
      }),
    [
      avgMonthlyPayroll,
      childcareReplacementPay,
      longServiceAllowancePerEmployee,
      longServiceEmployeeCount,
      longServiceMonthlyPayPerEmployee,
      monthlyPayrollTotal,
      otherDeduction,
      paymentMonth,
    ]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 840 }}>
        <div>
          <label htmlFor="elt-avg" style={label}>직전 12개월 월평균 급여총액</label>
          <input id="elt-avg" style={field} inputMode="numeric" value={avgMonthlyPayroll} onChange={(e) => setAvgMonthlyPayroll(e.target.value)} />
        </div>
        <div>
          <label htmlFor="elt-payroll" style={label}>당월 급여총액(비과세 제외)</label>
          <input id="elt-payroll" style={field} inputMode="numeric" value={monthlyPayrollTotal} onChange={(e) => setMonthlyPayrollTotal(e.target.value)} />
        </div>
        <div>
          <label htmlFor="elt-ls-count" style={label}>장기근속수당 지급 인원</label>
          <input id="elt-ls-count" style={field} inputMode="numeric" value={longServiceEmployeeCount} onChange={(e) => setLongServiceEmployeeCount(e.target.value)} />
        </div>
        <div>
          <label htmlFor="elt-ls-allowance" style={label}>1인당 장기근속수당 지급액</label>
          <input id="elt-ls-allowance" style={field} inputMode="numeric" value={longServiceAllowancePerEmployee} onChange={(e) => setLongServiceAllowancePerEmployee(e.target.value)} />
        </div>
        <div>
          <label htmlFor="elt-ls-pay" style={label}>해당 직원 1인당 월급여</label>
          <input id="elt-ls-pay" style={field} inputMode="numeric" value={longServiceMonthlyPayPerEmployee} onChange={(e) => setLongServiceMonthlyPayPerEmployee(e.target.value)} />
        </div>
        <div>
          <label htmlFor="elt-childcare" style={label}>육아휴직 대체인력 급여 합계</label>
          <input id="elt-childcare" style={field} inputMode="numeric" value={childcareReplacementPay} onChange={(e) => setChildcareReplacementPay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="elt-other" style={label}>기타 공제(중소기업 고용지원 등)</label>
          <input id="elt-other" style={field} inputMode="numeric" value={otherDeduction} onChange={(e) => setOtherDeduction(e.target.value)} />
        </div>
        <div>
          <label htmlFor="elt-month" style={label}>급여 지급월(YYYY-MM)</label>
          <input id="elt-month" type="month" style={field} placeholder="2026-05" value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)} />
        </div>
      </div>

      <section
        aria-label="종업원분 주민세 계산 결과"
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
            color: result.exempt ? 'var(--blue-700)' : 'var(--caution-text)',
            fontSize: '0.78rem',
            fontWeight: 800,
          }}
        >
          {result.exempt
            ? '면세점 이하 — 종업원분 주민세 비과세(신고의무 없음)'
            : '면세점 초과 — 종업원분 주민세 신고 대상'}
        </p>
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>면세점 기준(월평균)</td>
              <td style={{ textAlign: 'right' }}>
                {KRW(result.avgMonthlyPayroll)} / {KRW(result.exemptionThreshold)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>당월 급여총액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.monthlyPayrollTotal)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>장기근속수당 공제</td>
              <td style={{ textAlign: 'right' }}>-{KRW(result.longServiceDeduction)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>육아휴직 대체인력 공제</td>
              <td style={{ textAlign: 'right' }}>-{KRW(result.childcareDeduction)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>기타 공제</td>
              <td style={{ textAlign: 'right' }}>-{KRW(result.otherDeduction)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>과세표준</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800 }}>{KRW(result.taxBase)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 700 }}>세액(표준세율 0.5%)</td>
              <td style={{ textAlign: 'right', fontWeight: 800 }}>{KRW(result.tax)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>신고기한</td>
              <td style={{ textAlign: 'right' }}>{result.filingDeadline ?? '—'}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          {result.filingDeadlineNote}. 표준세율 0.5%는 지자체 조례로 0.25%~0.75% 범위에서 가감될 수
          있습니다. 중소기업 고용지원 공제(지방세법 §84의5)는 별도 계산 후 기타 공제란에 입력합니다.
          실무 참조용 추정치이며, 최종 확인은 법령·위택스·관할 지자체 기준이 우선합니다.
        </p>
      </section>
    </div>
  )
}
