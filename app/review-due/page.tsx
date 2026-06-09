import factsRaw from '@/content/facts.json'
import { loadFacts, reviewDue } from '@/lib/facts/store'
import { chapterTitle } from '@/lib/chapters'
import { VerifyStatus } from '@/components/VerifyStatus'
import type { Fact } from '@/lib/facts/schema'

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

  return (
    <div className="wt-article" style={{ paddingTop: 'var(--space-xl)' }}>
      {/* Gazette page header */}
      <header className="wt-hero">
        <span className="wt-hero-eyebrow">검토 일정</span>
        <h1>검토 임박 항목</h1>
        <p className="wt-hero-lead">
          다음 검토일 기준 정렬.
          이 날짜 이전에 1차 출처를 재확인하세요.
        </p>
      </header>

      {items.length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.78rem',
            color: 'var(--ink-faint)',
            padding: 'var(--space-lg) 0',
            borderTop: '1px solid var(--rule)',
          }}
        >
          검토 예정 항목 없음.
        </p>
      ) : (
        <div className="wt-review-list" role="list" aria-label="검토 예정 항목">
          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr auto',
              gap: 'var(--space-lg)',
              padding: '0 0 var(--space-sm)',
              borderBottom: '2px solid var(--ink)',
            }}
          >
            {['다음 검토일', '항목', '현재 상태'].map((h) => (
              <span
                key={h}
                className="wt-mono"
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
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
                      color: isUrgent ? 'var(--caution)' : 'var(--ink-faint)',
                      fontWeight: isUrgent ? 600 : 400,
                      fontSize: '0.78rem',
                    }}
                  >
                    {f.nextReviewBy}
                  </span>
                  {isUrgent && (
                    <span
                      className="wt-mono"
                      style={{
                        display: 'block',
                        fontSize: '0.65rem',
                        color: 'var(--caution)',
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
                      fontFamily: 'var(--font-serif, serif)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {factDisplayTitle(f)}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.68rem',
                      color: 'var(--ink-faint)',
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
