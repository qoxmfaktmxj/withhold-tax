import type { Fact } from '@/lib/facts/schema'
import { dashboardFacts } from '@/lib/facts/store'
import { SourcePill } from './SourcePill'
import { VerifyStatus } from './VerifyStatus'

export function UpdatesDashboard({ facts }: { facts: Fact[] }) {
  const items = dashboardFacts(facts)
  if (items.length === 0) return <p style={{ color: 'var(--color-muted)' }}>개정 항목 없음.</p>
  return (
    <table className="wt-tbl">
      <thead><tr><th>항목</th><th>변경 전</th><th>2026 기준</th><th>시행일</th><th>구분</th><th>출처/검증</th></tr></thead>
      <tbody>
        {items.map((f) => (
          <tr key={f.id}>
            <td>{f.slug}</td>
            <td style={{ color: 'var(--color-muted)' }}>{f.previousValue || '—'}</td>
            <td>{f.claim}</td>
            <td className="mono">{f.effectiveDate || '—'}</td>
            <td>{f.changeType}</td>
            <td>
              <SourcePill sourceType={f.sourceType} sourceTitle={f.sourceTitle} asOf={f.asOf} lawRef={f.lawRef} lawUrl={f.lawUrl} />
              {' '}
              <VerifyStatus status={f.verifyStatus} descId={`vs-dash-${f.id}`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
