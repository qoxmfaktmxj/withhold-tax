'use client'

import { useMemo, useState } from 'react'
import penaltyRulesRaw from '@/content/tax-rules/2026/penalty-rules.json'
import { loadRules, pickRule, withholdingLatePenalty } from '@/lib/rules/engine'

const RULES = loadRules(penaltyRulesRaw)
const KRW = (n: number) => n.toLocaleString('ko-KR') + '원'
type NoticeStatus = 'before_notice' | 'after_notice'

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
  const [noticeStatus, setNoticeStatus] = useState<NoticeStatus>('before_notice')
  const [noticeDate, setNoticeDate] = useState('2026-08-10')
  const [designatedDueDate, setDesignatedDueDate] = useState('2026-08-20')
  const [demandCost, setDemandCost] = useState('0')

  const result = useMemo(() => {
    const unpaidTax = Number(unpaid.replace(/[^0-9]/g, '')) || 0
    if (!unpaidTax || !dueDate || !payDate || payDate < dueDate) return null
    const ruleDate = noticeStatus === 'after_notice' && designatedDueDate ? designatedDueDate : dueDate
    const rule = pickRule(RULES, 'wht_late_payment_penalty', ruleDate)
    if (!rule) return null
    const daysLate = daysBetween(dueDate, payDate)
    const calc = withholdingLatePenalty(rule, {
      unpaidTax,
      daysLate,
      legalDueDate: dueDate,
      paymentDate: payDate,
      noticeDate: noticeStatus === 'after_notice' ? noticeDate : undefined,
      designatedDueDate: noticeStatus === 'after_notice' ? designatedDueDate : undefined,
      demandCost: noticeStatus === 'after_notice' ? Number(demandCost.replace(/[^0-9]/g, '')) || 0 : undefined,
    })
    const billReviewRequired = noticeStatus === 'after_notice' || calc.manualReviewRequired
    return {
      rule,
      daysLate,
      calc,
      unpaidTax,
      billReviewRequired,
    }
  }, [unpaid, dueDate, payDate, noticeStatus, noticeDate, designatedDueDate, demandCost])

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
        <div>
          <label htmlFor="pc-notice" style={label}>고지 전/후 여부</label>
          <select
            id="pc-notice"
            style={field}
            value={noticeStatus}
            onChange={(e) => setNoticeStatus(e.target.value as NoticeStatus)}
          >
            <option value="before_notice">고지 전 자진납부</option>
            <option value="after_notice">고지 후 납부</option>
          </select>
        </div>
      </div>

      {noticeStatus === 'after_notice' && (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, maxWidth: 640, marginTop: 14 }}
        >
          <div>
            <label htmlFor="pc-notice-date" style={label}>납부고지일</label>
            <input
              id="pc-notice-date"
              style={field}
              type="date"
              value={noticeDate}
              onChange={(e) => setNoticeDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pc-designated-due" style={label}>지정납부기한</label>
            <input
              id="pc-designated-due"
              style={field}
              type="date"
              value={designatedDueDate}
              onChange={(e) => setDesignatedDueDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pc-demand-cost" style={label}>독촉비용</label>
            <input
              id="pc-demand-cost"
              style={field}
              inputMode="numeric"
              value={demandCost}
              onChange={(e) => setDemandCost(e.target.value)}
            />
          </div>
        </div>
      )}

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
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>고지 전/후</td>
                <td style={{ textAlign: 'right' }}>
                  {noticeStatus === 'after_notice' ? '고지 후 납부' : '고지 전 자진납부'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>기본 가산(3%)</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.calc.basePenalty)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>이자 가산(22/100,000 × 일수)</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.calc.dailyPenalty)}</td>
              </tr>
              {result.rule.effectiveFrom >= '2026-07-01' && (
                <>
                  <tr>
                    <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>고지 전 일할 이자</td>
                    <td style={{ textAlign: 'right' }}>{KRW(result.calc.preNoticeDailyPenalty)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>지정납부기한 후 월할 이자</td>
                    <td style={{ textAlign: 'right' }}>{KRW(result.calc.postDesignatedMonthlyPenalty)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>독촉비용 반영액</td>
                    <td style={{ textAlign: 'right' }}>{KRW(result.calc.demandCost)}</td>
                  </tr>
                </>
              )}
              {result.calc.capApplied && (
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>한도 적용(미납세액×10%)</td>
                  <td style={{ textAlign: 'right', color: 'var(--blue-700)' }}>{KRW(result.calc.capAmount)}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>10% 한도 여부</td>
                <td style={{ textAlign: 'right' }}>{result.calc.capApplied ? '적용' : '미적용'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>전체 50% 한도</td>
                <td style={{ textAlign: 'right' }}>{KRW(result.calc.outerCapAmount)} 별도 검토</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--gray-600)' }}>고지서 확인</td>
                <td style={{ textAlign: 'right' }}>{result.billReviewRequired ? '수동 검토' : '고지 전 추정'}</td>
              </tr>
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
          {result.rule.effectiveFrom >= '2026-07-01' && (
            <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--caution-text)' }}>
              2026.7.1 이후 지정납부기한 도래분 — 개정 산식(지정납부기한 후 월 1만분의 67, 독촉비용, 150만원
              미만 면제)이 반영됩니다. 고지 이후 금액은 납부고지서 기준으로 수동 검토하세요.
            </p>
          )}
          {result.billReviewRequired && (
            <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--caution-text)' }}>
              고지 후 납부 구간은 납부고지서 기준 확인이 필요합니다.
            </p>
          )}
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--gray-600)' }}>
            지방소득세 특별징수 가산세는 별도 체계로 확인하세요.
          </p>
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
