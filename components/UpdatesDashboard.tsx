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
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--gray-400)',
          padding: 'var(--space-lg) 0',
          borderTop: '1px solid var(--border)',
        }}
      >
        개정 항목 없음.
      </p>
    )
  }

  return (
    <table className="wt-updates-table" aria-label="개정 항목 목록">
      <thead>
        <tr>
          {['항목', '변경 전 → 2026 기준', '시행일 / 구분'].map((h, i) => (
            <th
              key={h}
              scope="col"
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--gray-500)',
                textAlign: i === 2 ? 'right' : 'left',
                fontFamily: 'var(--font-display)',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((f) => (
          <tr key={f.id} className="wt-update-row">
            {/* Left: title + citation */}
            <td>
              <p className="wt-update-title">{factDisplayTitle(f)}</p>
              <div style={{ marginBottom: 4 }}>
                <VerifyStatus status={f.verifyStatus} descId={`vs-dash-${f.id}`} />
              </div>
              <div>
                <SourcePill
                  sourceType={f.sourceType}
                  sourceTitle={f.sourceTitle}
                  asOf={f.asOf}
                  lawRef={f.lawRef}
                  lawUrl={f.lawUrl}
                />
              </div>
            </td>

            {/* Center: before → current */}
            <td>
              {f.previousValue && (
                <p className="wt-update-prev">
                  이전: {f.previousValue}
                </p>
              )}
              <p className="wt-update-claim">{f.claim}</p>
            </td>

            {/* Right: date + badge */}
            <td>
              <div className="wt-update-meta">
                {f.effectiveDate && (
                  <span
                    className="wt-mono"
                    style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}
                  >
                    {f.effectiveDate}
                  </span>
                )}
                <span className={`wt-change-badge wt-change-badge--${f.changeType}`}>
                  {f.changeType}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
