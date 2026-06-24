'use client'

import { useMemo, useState } from 'react'
import { calculateSalaryNetPay } from '@/lib/salary-net-pay/calculate'

const KRW = (n: number) => n.toLocaleString('ko-KR') + '원'

function parseWon(value: string): number {
  return Number(value.replace(/[^0-9]/g, '')) || 0
}

export function SalaryNetPayCalculator() {
  const [grossMonthlyPay, setGrossMonthlyPay] = useState('4000000')
  const [nonTaxablePay, setNonTaxablePay] = useState('200000')
  const [mealAllowancePay, setMealAllowancePay] = useState('0')
  const [incomeTax, setIncomeTax] = useState('120000')
  const [localIncomeTax, setLocalIncomeTax] = useState('12000')
  const [nationalPension, setNationalPension] = useState('180000')
  const [healthInsurance, setHealthInsurance] = useState('140000')
  const [longTermCareInsurance, setLongTermCareInsurance] = useState('18000')
  const [employmentInsurance, setEmploymentInsurance] = useState('36000')
  const [otherDeductions, setOtherDeductions] = useState('50000')
  const [paymentMonths, setPaymentMonths] = useState('12')
  const [autoSocialInsurance, setAutoSocialInsurance] = useState(false)
  const [socialInsurancePaymentDate, setSocialInsurancePaymentDate] = useState('2026-07-01')

  const result = useMemo(
    () =>
      calculateSalaryNetPay({
        grossMonthlyPay: parseWon(grossMonthlyPay),
        nonTaxablePay: parseWon(nonTaxablePay),
        mealAllowancePay: parseWon(mealAllowancePay),
        incomeTax: parseWon(incomeTax),
        localIncomeTax: parseWon(localIncomeTax),
        nationalPension: parseWon(nationalPension),
        healthInsurance: parseWon(healthInsurance),
        longTermCareInsurance: parseWon(longTermCareInsurance),
        employmentInsurance: parseWon(employmentInsurance),
        otherDeductions: parseWon(otherDeductions),
        paymentMonths: Number(paymentMonths) || 12,
        socialInsuranceMode: autoSocialInsurance ? 'auto' : 'manual',
        socialInsurancePaymentDate,
      }),
    [
      autoSocialInsurance,
      employmentInsurance,
      grossMonthlyPay,
      healthInsurance,
      incomeTax,
      localIncomeTax,
      longTermCareInsurance,
      mealAllowancePay,
      nationalPension,
      nonTaxablePay,
      otherDeductions,
      paymentMonths,
      socialInsurancePaymentDate,
    ]
  )

  /* Donut: deductionRate clamped 0–100 */
  const donutPct = Math.min(100, Math.max(0, result.deductionRate))
  const donutGrad = `conic-gradient(var(--accent) 0% ${donutPct}%, var(--accent-100) ${donutPct}% 100%)`

  return (
    <div className="wt-calc">
      {/* ── 토글 + 기간 선택 ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        {/* label wraps the hidden checkbox + visual track + text so getByLabelText works */}
        <label className="wt-calc-toggle-wrap" htmlFor="salary-auto-social">
          <input
            id="salary-auto-social"
            type="checkbox"
            checked={autoSocialInsurance}
            onChange={(e) => setAutoSocialInsurance(e.target.checked)}
            aria-label="사회보험 자동 계산"
          />
          <span className="wt-calc-toggle-track" aria-hidden="true" />
          사회보험 자동 계산
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="salary-social-period" className="wt-calc-label" style={{ marginBottom: 0 }}>
            국민연금 상·하한 적용기간
          </label>
          <select
            id="salary-social-period"
            style={{ width: 220 }}
            value={socialInsurancePaymentDate}
            onChange={(e) => setSocialInsurancePaymentDate(e.target.value)}
            disabled={!autoSocialInsurance}
          >
            <option value="2026-07-01">2026.7~2027.6</option>
            <option value="2026-06-30">2026.1~2026.6</option>
          </select>
        </div>
      </div>

      {/* ── 입력 그리드 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 860 }}>
        <div>
          <label htmlFor="salary-gross" className="wt-calc-label">월 총급여</label>
          <input id="salary-gross" inputMode="numeric" value={grossMonthlyPay} onChange={(e) => setGrossMonthlyPay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-nontax" className="wt-calc-label">비과세 급여</label>
          <input id="salary-nontax" inputMode="numeric" value={nonTaxablePay} onChange={(e) => setNonTaxablePay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-meal" className="wt-calc-label">식대(한도 적용)</label>
          <input id="salary-meal" inputMode="numeric" value={mealAllowancePay} onChange={(e) => setMealAllowancePay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-months" className="wt-calc-label">지급 개월 수</label>
          <input id="salary-months" inputMode="numeric" value={paymentMonths} onChange={(e) => setPaymentMonths(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-income-tax" className="wt-calc-label">소득세</label>
          <input id="salary-income-tax" inputMode="numeric" value={incomeTax} onChange={(e) => setIncomeTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-local-tax" className="wt-calc-label">지방소득세</label>
          <input id="salary-local-tax" inputMode="numeric" value={localIncomeTax} onChange={(e) => setLocalIncomeTax(e.target.value)} />
        </div>
        <div>
          <label htmlFor="salary-pension" className="wt-calc-label">국민연금</label>
          <input id="salary-pension" inputMode="numeric" value={nationalPension} onChange={(e) => setNationalPension(e.target.value)} disabled={autoSocialInsurance} />
        </div>
        <div>
          <label htmlFor="salary-health" className="wt-calc-label">건강보험</label>
          <input id="salary-health" inputMode="numeric" value={healthInsurance} onChange={(e) => setHealthInsurance(e.target.value)} disabled={autoSocialInsurance} />
        </div>
        <div>
          <label htmlFor="salary-care" className="wt-calc-label">장기요양보험</label>
          <input id="salary-care" inputMode="numeric" value={longTermCareInsurance} onChange={(e) => setLongTermCareInsurance(e.target.value)} disabled={autoSocialInsurance} />
        </div>
        <div>
          <label htmlFor="salary-employment" className="wt-calc-label">고용보험</label>
          <input id="salary-employment" inputMode="numeric" value={employmentInsurance} onChange={(e) => setEmploymentInsurance(e.target.value)} disabled={autoSocialInsurance} />
        </div>
        <div>
          <label htmlFor="salary-other" className="wt-calc-label">기타 공제</label>
          <input id="salary-other" inputMode="numeric" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} />
        </div>
      </div>

      {/* ── 결과 카드 ── */}
      <section aria-label="연봉·실수령액 검산 결과" className="wt-calc-result">
        <h2>검산 결과</h2>
        <table>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--stone-600)' }}>과세 급여</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.taxablePay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--stone-600)' }}>공제 합계</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.totalDeductions)}</td>
            </tr>
            {/* 월 실수령액 — visually highlighted via CSS class, semantically still a <tr> */}
            <tr className="wt-calc-result-net-row">
              <td className="wt-calc-result-net-label">월 실수령액</td>
              <td className="wt-calc-result-net-value">{KRW(result.monthlyNetPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--stone-600)' }}>연 총급여</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.annualGrossPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--stone-600)' }}>연 실수령액</td>
              <td style={{ textAlign: 'right' }}>{KRW(result.annualNetPay)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--stone-600)' }}>공제율</td>
              <td style={{ textAlign: 'right' }}>{result.deductionRate.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>

        {/* 공제율 도넛 */}
        <div className="wt-calc-donut-wrap">
          <div
            className="wt-calc-donut"
            style={{ background: donutGrad }}
            role="img"
            aria-label={`공제율 ${result.deductionRate.toFixed(1)}%`}
          />
          <div className="wt-calc-donut-label">
            <strong>{result.deductionRate.toFixed(1)}%</strong>
            공제율 (총급여 대비)
          </div>
        </div>

        <p className="wt-calc-footnote">
          {autoSocialInsurance
            ? '사회보험은 2026년 룰 JSON 기준으로 자동 산출합니다. 소득세·지방소득세·기타 공제는 입력값을 그대로 쓰며, 실제 급여 시스템·간이세액표와 다를 수 있습니다.'
            : '수동 모드는 급여명세서 또는 사내 급여 시스템의 공제액을 입력해 실수령액을 검산합니다. 사회보험 자동 계산을 켜면 2026년 룰 JSON 기준 추정값으로 대체합니다.'}
        </p>
      </section>
    </div>
  )
}
