import factsRaw from '@/content/facts.json'
import { loadFacts, reviewDue } from '@/lib/facts/store'
import { chapterTitle } from '@/lib/chapters'
import { VerifyStatus } from '@/components/VerifyStatus'
import type { Fact } from '@/lib/facts/schema'
import {
  IMPLEMENTATION_PRIORITY_STATUS_LABELS,
  getImplementationPrioritySummary,
  getImplementationPrioritiesByTier,
  type ImplementationPriorityTier,
} from '@/lib/implementation-priorities'

function factDisplayTitle(f: Fact): string {
  return f.title || chapterTitle(f.chapter)
}

// Days until a date from today
function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00Z')
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export default function Page() {
  const items = reviewDue(loadFacts(factsRaw))
  const prioritySummary = getImplementationPrioritySummary()
  const priorityTiers: ImplementationPriorityTier[] = ['P0', 'P1', 'P2']

  return (
    <div className="wt-article">
      <header className="wt-hero">
        <span className="wt-hero-eyebrow">운영 관리</span>
        <h1>운영 검토 큐</h1>
        <p className="wt-hero-lead">
          다음 검토일 기준 정렬. 운영자가 1차 출처 재확인과 fact 상태 관리를 처리하는 큐입니다.
        </p>
      </header>

      <section aria-labelledby="implementation-priority-heading" style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 id="implementation-priority-heading">우선순위별 수정 목록</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '70ch' }}>
          평가서의 타당 항목 {prioritySummary.total}건을 사내 원천징수 지식 시스템 backlog로 고정한 목록입니다.
          완료 {prioritySummary.done}건, 부분 완료 {prioritySummary.partial}건, 차단 {prioritySummary.blocked}건,
          계획 {prioritySummary.planned}건입니다.
        </p>

        <div
          role="list"
          aria-label="우선순위별 수정 목록"
          style={{ display: 'grid', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}
        >
          {priorityTiers.map((tier) => {
            const tierItems = getImplementationPrioritiesByTier(tier)
            return (
              <div key={tier} style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr 92px',
                    gap: 'var(--space-md)',
                    alignItems: 'center',
                    padding: '6px 0',
                    color: 'var(--gray-500)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  <span>{tier}</span>
                  <span>항목</span>
                  <span>상태</span>
                </div>
                {tierItems.map((item) => {
                  const statusLabel = IMPLEMENTATION_PRIORITY_STATUS_LABELS[item.status]
                  return (
                    <div
                      key={item.id}
                      role="listitem"
                      aria-label={`${item.tier} ${item.rank} ${item.title} ${statusLabel}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '72px 1fr 92px',
                        gap: 'var(--space-md)',
                        padding: '10px 0',
                        borderTop: '1px solid var(--border)',
                        alignItems: 'start',
                      }}
                    >
                      <span className="wt-mono" style={{ color: 'var(--gray-500)', fontSize: '0.76rem' }}>
                        {item.tier}-{item.rank}
                      </span>
                      <span>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {item.title}
                        </strong>
                        <span style={{ display: 'block', marginTop: 3, color: 'var(--gray-500)', fontSize: '0.76rem' }}>
                          {item.note}
                        </span>
                        <span className="wt-mono" style={{ display: 'block', marginTop: 3, color: 'var(--gray-400)', fontSize: '0.68rem' }}>
                          {item.evidence}
                        </span>
                      </span>
                      <span
                        className="wt-mono"
                        style={{
                          color: item.status === 'done' ? 'var(--blue-700)' : 'var(--caution-text)',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textAlign: 'right',
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </section>

      {items.length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--gray-400)',
            padding: 'var(--space-lg)',
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          운영 검토 예정 항목 없음.
        </p>
      ) : (
        <div className="wt-review-list" role="list" aria-label="운영 검토 예정 항목">
          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '130px 1fr auto',
              gap: 'var(--space-lg)',
              padding: 'var(--space-sm) var(--space-lg)',
              borderBottom: '1px solid var(--border)',
              background: 'var(--gray-50)',
            }}
          >
            {['다음 검토일', '항목', '현재 상태'].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--gray-500)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {items.map((f) => {
            const days = daysUntil(f.nextReviewBy)
            const isUrgent = days <= 90
            return (
              <div key={f.id} role="listitem" className="wt-review-row">
                <div className="wt-review-date">
                  <span
                    className="wt-mono"
                    style={{
                      color: isUrgent ? 'var(--caution-text)' : 'var(--gray-500)',
                      fontWeight: isUrgent ? 600 : 400,
                      fontSize: '0.78rem',
                    }}
                  >
                    {f.nextReviewBy}
                  </span>
                  {isUrgent && (
                    <span
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--caution-text)',
                        marginTop: 2,
                      }}
                    >
                      {days > 0 ? `${days}일 후` : '기한 경과'}
                    </span>
                  )}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: 0,
                      lineHeight: 1.4,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {factDisplayTitle(f)}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'var(--gray-400)',
                      margin: '3px 0 0',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {chapterTitle(f.chapter)}
                  </p>
                </div>
                <div>
                  <VerifyStatus status={f.verifyStatus} descId={`vs-rev-${f.id}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
