'use client'

import { useMemo, useState } from 'react'
import { evaluateBusinessIncomePayment, type BusinessIncomeClassification } from '@/lib/business-income/decision'

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
  const [incomeClass, setIncomeClass] = useState<BusinessIncomeClassification>('personal_service_resident')

  const result = useMemo(() => {
    const grossPayment = Number(gross.replace(/[^0-9]/g, '')) || 0
    if (!grossPayment) return null
    return evaluateBusinessIncomePayment({
      grossPayment,
      paymentDate: payDate || '2026-01-01',
      incomeClass,
      residency: incomeClass === 'nonresident' ? 'nonresident' : 'resident',
      isPersonalService: incomeClass === 'personal_service_resident' || incomeClass === 'registered_business',
      hasBusinessRegistration: incomeClass === 'registered_business',
    })
  }, [gross, payDate, incomeClass])

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
        <div>
          <label htmlFor="bc-class" style={label}>소득 분류</label>
          <select
            id="bc-class"
            style={field}
            value={incomeClass}
            onChange={(e) => setIncomeClass(e.target.value as BusinessIncomeClassification)}
          >
            <option value="personal_service_resident">인적용역 사업소득(거주자)</option>
            <option value="registered_business">사업자등록/세금계산서 거래</option>
            <option value="employee">근로소득 가능성</option>
            <option value="nonresident">비거주자</option>
            <option value="corporation">법인 거래</option>
          </select>
        </div>
      </div>

      {result && result.action.type === 'calculate' && result.withholding && (
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
                <td style={{ textAlign: 'right' }}>{KRW(result.withholding.nationalTax)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지방소득세(소득세의 10%) — 지자체 납부</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.withholding.localTax)}</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0 0', fontWeight: 700 }}>원천징수 합계(3.3%)</td>
                <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800, fontSize: '1.05rem', color: 'var(--blue-700)' }}>
                  {KRW(result.withholding.total)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: 'var(--gray-500)', fontSize: '0.78rem' }}>실지급액</td>
                <td style={{ textAlign: 'right', color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                  {KRW(Number(gross.replace(/[^0-9]/g, '')) - result.withholding.total)}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
            세액은 10원 미만 절사 기준. 신고·납부 기한: 지급일이 속한 달의 다음 달 10일.
          </p>
        </div>
      )}
      {result && result.action.type !== 'calculate' && (
        <div
          style={{
            marginTop: 18,
            background: 'var(--caution-bg)',
            border: '1px solid var(--caution-border)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px',
            maxWidth: 640,
          }}
        >
          <p style={{ margin: 0, fontWeight: 800, color: 'var(--caution-text)' }}>
            {result.action.type === 'manual-review' ? result.action.message : `연결 rule: ${result.action.ruleId}`}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--gray-600)' }}>
            분류: {result.classification} · 3.3% 거주자 인적용역 rule 미적용
          </p>
        </div>
      )}
    </div>
  )
}
