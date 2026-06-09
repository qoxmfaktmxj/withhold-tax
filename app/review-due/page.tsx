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
    <div className="wt-article">
      <div className="wt-hero" style={{ paddingTop: 'var(--space-xxl)', paddingBottom: 'var(--space-xl)' }}>
        <span className="wt-hero-eyebrow">검토 일정</span>
        <h1>검토 임박 항목</h1>
        <p className="wt-hero-lead">
          다음 검토일 기준 정렬. 이 날짜 이전에 1차 출처를 재확인하세요.
        </p>
      </div>

      {items.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>검토 예정 항목 없음.</p>
      ) : (
        <div className="wt-review-list" role="list" aria-label="검토 예정 항목">
          {/* Column header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr auto',
              gap: 'var(--space-lg)',
              padding: '0 0 var(--space-sm)',
              borderBottom: '1px solid var(--color-hairline)',
            }}
          >
            {['다음 검토일', '항목', '현재 상태'].map((h) => (
              <span
                key={h}
                className="wt-mono"
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted-soft)' }}
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
                      color: isUrgent ? 'var(--color-check)' : 'var(--color-muted)',
                      fontWeight: isUrgent ? 600 : 400,
                    }}
                  >
                    {f.nextReviewBy}
                  </span>
                  {isUrgent && (
                    <span
                      className="wt-mono"
                      style={{ display: 'block', fontSize: 10, color: 'var(--color-check)', marginTop: 2 }}
                    >
                      {days > 0 ? `${days}일 후` : '기한 경과'}
                    </span>
                  )}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif, serif)',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {factDisplayTitle(f)}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '3px 0 0' }}>
                    {f.chapter}
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
