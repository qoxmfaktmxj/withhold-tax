import deadlinesRaw from '@/content/tax-rules/2026/deadlines.json'
import { calculateDeadline, loadRules, type DeadlineResult } from '@/lib/rules/engine'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { VerifyStatus } from '@/components/VerifyStatus'
import type { TaxRule } from '@/lib/rules/schema'

export const metadata = { title: '신고·납부 캘린더 — 원천징수 레퍼런스' }

const FACTS = Object.fromEntries(loadFacts(factsRaw).map((f) => [f.id, f]))

/** 반복 주기별 분류 */
function freq(basis: string): '매월' | '반기' | '연 1회' | '기간' {
  if (basis === 'payment_month') return '매월'
  if (basis === 'half_year') return '반기'
  if (basis === 'next_year_months') return '기간'
  return '연 1회'
}

function sampleInput(rule: TaxRule): Record<string, unknown> {
  const basis = String(rule.formula.params.basis)
  if (basis === 'payment_month') return { paymentDate: '2026-01-25' }
  if (basis === 'half_year') return { taxYear: 2026, half: 'H1' }
  if (basis === 'tax_year' || basis === 'next_year_months') return { taxYear: 2026 }
  return { baseDate: '2026-01-01' }
}

function ScheduleSummary({ result }: { result: DeadlineResult }) {
  return (
    <div style={{ minWidth: 210 }}>
      <div style={{ fontWeight: 700 }}>법정 기한 {result.dueDate}</div>
      <div style={{ color: 'var(--blue-700)', fontWeight: 700 }}>조정 기한 {result.adjustedDueDate}</div>
      {result.periodLabel && <div style={{ color: 'var(--gray-600)', fontSize: '0.74rem' }}>{result.periodLabel}</div>}
      <div
        style={{
          marginTop: 5,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--gray-600)',
          lineHeight: 1.55,
        }}
      >
        D-30 {result.reminderDates.d30}
        <br />
        D-7 {result.reminderDates.d7}
        <br />
        D-1 {result.reminderDates.d1}
      </div>
    </div>
  )
}

function CalendarSection({ title, items }: { title: string; items: TaxRule[] }) {
  return (
    <>
      <h2>{title}</h2>
      <table className="wt-tbl" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>항목</th>
            <th>산출 일정</th>
            <th>근거</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const f = FACTS[r.factIds[0]]
            const isNew = r.effectiveFrom >= '2026-01-01'
            const schedule = calculateDeadline(r, sampleInput(r))
            return (
              <tr key={`${r.ruleId}@${r.version}`}>
                <td>
                  {r.name}
                  {isNew && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'var(--blue-700)',
                        background: 'var(--blue-50)',
                        border: '1px solid var(--blue-100)',
                        borderRadius: 4,
                        padding: '1px 5px',
                      }}
                    >
                      2026 신설
                    </span>
                  )}
                  {r.warnings.length > 0 && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)', marginTop: 3 }}>
                      {r.warnings.join(' · ')}
                    </div>
                  )}
                </td>
                <td>
                  <ScheduleSummary result={schedule} />
                  <div style={{ marginTop: 6, fontSize: '0.73rem', color: 'var(--gray-500)' }}>
                    {r.formula.expression}
                  </div>
                </td>
                <td>
                  {f ? (
                    <span style={{ whiteSpace: 'nowrap' }}>
                      <a
                        href={f.lawUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--blue-600)' }}
                      >
                        {f.lawRef || f.sourceTitle}
                      </a>{' '}
                      <VerifyStatus status={f.verifyStatus} />
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default function CalendarPage() {
  const rules = loadRules(deadlinesRaw)
  const monthly = rules.filter((r) => freq(String(r.formula.params.basis)) === '매월')
  const halfYear = rules.filter((r) => freq(String(r.formula.params.basis)) === '반기')
  const yearly = rules.filter((r) => freq(String(r.formula.params.basis)) === '연 1회')
  const windows = rules.filter((r) => freq(String(r.formula.params.basis)) === '기간')

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>원천세 신고·납부 캘린더</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '64ch' }}>
        원천징수의무자 기준 반복 기한. 기한이 공휴일·토요일이면 다음 영업일까지. 반기별 납부 승인
        사업자는 상·하반기 일괄 신고(1~6월분 7.10 / 7~12월분 익년 1.10). HR 시스템 알림은 기한
        30일·7일 전 + 경과 경고 3단계를 권장.
      </p>

      <CalendarSection title="매월 반복" items={monthly} />
      <CalendarSection title="반기" items={halfYear} />
      <CalendarSection title="연 1회" items={yearly} />
      <CalendarSection title="기간 규칙 (2026 신설)" items={windows} />

      <p style={{ marginTop: 'var(--space-lg)', fontSize: '0.76rem', color: 'var(--gray-500)' }}>
        ⚠️ 사내 참고용. 영업일 보정·반기납부 승인 여부·사업장 단위 신고 구조는 회사 설정에 따라
        달라지므로 신고 전 홈택스·세무대리인 확인이 우선합니다.
      </p>
    </article>
  )
}
