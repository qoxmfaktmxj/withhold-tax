'use client'

import { useMemo, useState } from 'react'
import { calculateSalaryNetPay } from '@/lib/salary-net-pay/calculate'

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

export function SalaryNetPayCalculator() {
  const [grossMonthlyPay, setGrossMonthlyPay] = useState('4000000')
  const [nonTaxablePay, setNonTaxablePay] = useState('200000')
  const [incomeTax, setIncomeTax] = useState('120000')
  const [localIncomeTax, setLocalIncomeTax] = useState('12000')
  const [nationalPension, setNationalPension] = useState('180000')
  const [healthInsurance, setHealthInsurance] = useState('140000')
  const [longTermCareInsurance, setLongTermCareInsurance] = useState('18000')
  const [employmentInsurance, setEmploymentInsurance] = useState('36000')
  const [otherDeductions, setOtherDeductions] = useState('50000')
  const [paymentMonths, setPaymentMonths] = useState('12')

  const result = useMemo(
    () =>
      calculateSalaryNetPay({
        grossMonthlyPay: parseWon(grossMonthlyPay),
        nonTaxablePay: parseWon(nonTaxablePay),
        incomeTax: parseWon(incomeTax),
        localIncomeTax: parseWon(localIncomeTax),
        nationalPension: parseWon(nationalPension),
        healthInsurance: parseWon(healthInsurance),
        longTermCareInsurance: parseWon(longTermCareInsurance),
        employmentInsurance: parseWon(employmentInsurance),
        otherDeductions: parseWon(otherDeductions),
        paymentMonths: Number(paymentMonths) || 12,
      }),
    [
      employmentInsurance,
      grossMonthlyPay,
      healthInsurance,
      incomeTax,
      localIncomeTax,
      longTermCareInsurance,
      nationalPension,
      nonTaxablePay,
      otherDeductions,
      paymentMonths,
    ]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 860 }}>
        <div>
          <label htmlFor="salary-gross" style={label}>월 총급여</label>
          <input id="salary-gross" style={field} inputMode="numeric" value={grossMonthlyPay} onChange={(e) => setGrossMonthlyPay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-nontax" style={label}>비과세 급여</label>
          <input id="salary-nontax" style={field} inputMode="numeric" value={nonTaxablePay} onChange={(e) => setNonTaxablePay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-months" style={label}>지급 개월 수</label>
          <input id="salary-months" style={field} inputMode="numeric" value={paymentMonths} onChange={(e) => setPaymentMonths(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-income-tax" style={label}>소득세</label>
          <input id="salary-income-tax" style={field} inputMode="numeric" value={incomeTax} onChange={(e) => setIncomeTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-local-tax" style={label}>지방소득세</label>
          <input id="salary-local-tax" style={field} inputMode="numeric" value={localIncomeTax} onChange={(e) => setLocalIncomeTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-pension" style={label}>국민연금</label>
          <input id="salary-pension" style={field} inputMode="numeric" value={nationalPension} onChange={(e) => setNationalPension(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-health" style={label}>건강보험</label>
          <input id="salary-health" style={field} inputMode="numeric" value={healthInsurance} onChange={(e) => setHealthInsurance(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-care" style={label}>장기요양보험</label>
          <input id="salary-care" style={field} inputMode="numeric" value={longTermCareInsurance} onChange={(e) => setLongTermCareInsurance(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-employment" style={label}>고용보험</label>
          <input id="salary-employment" style={field} inputMode="numeric" value={employmentInsurance} onChange={(e) => setEmploymentInsurance(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-other" style={label}>기타 공제</label>
          <input id="salary-other" style={field} inputMode="numeric" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} />
        </div>
      </div>

      <section
        aria-label="연봉·실수령액 검산 결과"
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
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.05rem' }}>검산 결과</h2>
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>과세 급여</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.taxablePay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>공제 합계</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.totalDeductions)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 700 }}>월 실수령액</td>
              <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, color: 'var(--blue-700)' }}>{KRW(result.monthlyNetPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>연 총급여</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.annualGrossPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>연 실수령액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.annualNetPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>공제율</td>
              <td style={{ textAlign: 'right' }}>{result.deductionRate.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          국민연금·건강보험·고용보험 요율 추정값을 자동 산출하지 않습니다. 급여명세서 또는 사내 급여 시스템의 공제액을 입력해 실수령액을 검산합니다.
        </p>
      </section>
    </div>
  )
}
