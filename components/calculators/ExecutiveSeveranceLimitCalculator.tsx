'use client'

import { useMemo, useState } from 'react'
import { calculateExecutiveSeveranceLimit } from '@/lib/executive-severance/check'

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

export function ExecutiveSeveranceLimitCalculator() {
  const [totalSeverance, setTotalSeverance] = useState('700000000')
  const [joinDate, setJoinDate] = useState('2015-01-01')
  const [retireDate, setRetireDate] = useState('2026-12-31')
  const [avgAnnualSalary3x, setAvgAnnualSalary3x] = useState('100000000')
  const [avgAnnualSalary2x, setAvgAnnualSalary2x] = useState('150000000')

  const result = useMemo(
    () =>
      calculateExecutiveSeveranceLimit({
        totalSeverance: won(totalSeverance),
        joinDate,
        retireDate,
        avgAnnualSalary3x: won(avgAnnualSalary3x),
        avgAnnualSalary2x: won(avgAnnualSalary2x),
      }),
    [avgAnnualSalary2x, avgAnnualSalary3x, joinDate, retireDate, totalSeverance]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, maxWidth: 840 }}>
        <div>
          <label htmlFor="esl-total" style={label}>퇴직금 총액</label>
          <input id="esl-total" style={field} inputMode="numeric" value={totalSeverance} onChange={(e) => setTotalSeverance(e.target.value)} />
        </div>
        <div>
          <label htmlFor="esl-join" style={label}>입사일(임원 취임일)</label>
          <input id="esl-join" style={field} type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="esl-retire" style={label}>퇴직일</label>
          <input id="esl-retire" style={field} type="date" value={retireDate} onChange={(e) => setRetireDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="esl-avg3" style={label}>2019.12.31 이전 3년 연평균환산액</label>
          <input id="esl-avg3" style={field} inputMode="numeric" value={avgAnnualSalary3x} onChange={(e) => setAvgAnnualSalary3x(e.target.value)} />
        </div>
        <div>
          <label htmlFor="esl-avg2" style={label}>퇴직일 직전 3년 연평균환산액</label>
          <input id="esl-avg2" style={field} inputMode="numeric" value={avgAnnualSalary2x} onChange={(e) => setAvgAnnualSalary2x(e.target.value)} />
        </div>
      </div>

      <section
        aria-label="임원퇴직금 한도 계산 결과"
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
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.05rem' }}>한도 계산 결과</h2>
        {!result.valid ? (
          <p style={{ margin: 0, color: 'var(--caution-text)', fontSize: '0.88rem', fontWeight: 700 }}>{result.error}</p>
        ) : (
          <>
            <p
              className="wt-mono"
              style={{
                display: 'inline-block',
                margin: '0 0 12px',
                color: result.excessAmount > 0 ? 'var(--caution-text)' : 'var(--blue-700)',
                fontSize: '0.78rem',
                fontWeight: 800,
              }}
            >
              {result.excessAmount > 0 ? '한도 초과 — 초과분은 근로소득으로 과세' : '한도 이내 — 전액 퇴직소득 인정'}
            </p>
            <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>퇴직금 총액</td>
                  <td style={{ textAlign: 'right' }}>{KRW(result.totalSeverance)}</td>
                </tr>
                {result.periods.map((p) => (
                  <tr key={p.periodKey}>
                    <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>
                      {p.multiplier}배수 구간 한도 · {p.months}개월
                    </td>
                    <td style={{ textAlign: 'right' }}>{KRW(p.limit)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0 0', fontWeight: 700 }}>퇴직소득 한도 합계</td>
                  <td style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 800 }}>{KRW(result.totalLimit)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>퇴직소득 인정액</td>
                  <td style={{ textAlign: 'right' }}>{KRW(result.retirementIncome)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 700, color: result.excessAmount > 0 ? 'var(--caution-text)' : 'var(--gray-600)' }}>
                    근로소득 전환액
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>{KRW(result.excessAmount)}</td>
                </tr>
              </tbody>
            </table>
            {result.warnings.length > 0 && (
              <ul
                style={{
                  margin: '12px 0 0',
                  padding: '10px 14px 10px 28px',
                  background: 'var(--caution-bg)',
                  border: '1px solid var(--caution-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--gray-700)',
                }}
              >
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </>
        )}
        <p style={{ margin: '12px 0 0', color: 'var(--gray-500)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          연평균환산액은 해당 구간 종료일 소급 직전 3년 총급여(비과세·법인세법 시행령 §43 손금불산입 급여 제외) 합계 ÷ 3이며,
          구간 근무기간이 3년 미만이면 실제 기간으로 연환산한 금액을 입력합니다. 2011.12.31 이전 근속분(한도 없음·안분 규정)은
          본 계산기에 반영되지 않습니다. 실무 참조용 추정치로, 최종 확인은 법령·홈택스·세무대리인이 우선합니다.
        </p>
      </section>
    </div>
  )
}
