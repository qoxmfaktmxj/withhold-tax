import type { Fact } from '@/lib/facts/schema'
import { dashboardFacts } from '@/lib/facts/store'
import { chapterTitle } from '@/lib/chapters'
import { SourcePill } from './SourcePill'
import { VerifyStatus } from './VerifyStatus'

function factDisplayTitle(f: Fact): string {
  return f.title || chapterTitle(f.chapter)
}

export function UpdatesDashboard({ facts }: { facts: Fact[] }) {
  const items = dashboardFacts(facts)
  if (items.length === 0) {
    return (
      <p
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.78rem',
          color: 'var(--ink-faint)',
          padding: 'var(--space-lg) 0',
          borderTop: '1px solid var(--rule)',
        }}
      >
        개정 항목 없음.
      </p>
    )
  }

  return (
    <div className="wt-updates-list" role="list" aria-label="개정 항목 목록">
      {/* Column headers */}
      <div
        role="row"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: 'var(--space-lg)',
          padding: '0 0 var(--space-sm)',
          borderBottom: '2px solid var(--ink)',
          marginBottom: 0,
        }}
      >
        {['항목', '변경 전 → 2026 기준', '시행일 / 구분'].map((h, i) => (
          <span
            key={h}
            className="wt-mono"
            style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
              textAlign: i === 2 ? 'right' : 'left',
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {items.map((f) => (
        <div key={f.id} role="listitem" className="wt-update-row">
          {/* Left: title + citation */}
          <div>
            <p className="wt-update-title">{factDisplayTitle(f)}</p>
            <VerifyStatus status={f.verifyStatus} descId={`vs-dash-${f.id}`} />
            <div style={{ marginTop: 6 }}>
              <SourcePill
                sourceType={f.sourceType}
                sourceTitle={f.sourceTitle}
                asOf={f.asOf}
                lawRef={f.lawRef}
                lawUrl={f.lawUrl}
              />
            </div>
          </div>

          {/* Center: before → current */}
          <div>
            {f.previousValue && (
              <p className="wt-update-prev">
                이전: {f.previousValue}
              </p>
            )}
            <p className="wt-update-claim">{f.claim}</p>
          </div>

          {/* Right: date + badge */}
          <div className="wt-update-meta">
            {f.effectiveDate && (
              <span
                className="wt-mono"
                style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}
              >
                {f.effectiveDate}
              </span>
            )}
            <span className={`wt-change-badge wt-change-badge--${f.changeType}`}>
              {f.changeType}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
