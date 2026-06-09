import type { Fact } from '@/lib/facts/schema'
import { chapterSummary } from '@/lib/facts/store'

export function ChapterVerifySummary({ facts }: { facts: Fact[] }) {
  const s = chapterSummary(facts)
  return (
    <div className="wt-chapter-meta" role="status" aria-label="이 장의 검증 현황">
      <span className="wt-chapter-meta-item">
        <span className="wt-seal wt-seal--확정">✓</span>
        <span>확정 <strong>{s.확정}</strong></span>
      </span>
      <span style={{ color: 'var(--color-hairline)', userSelect: 'none' }}>·</span>
      <span className="wt-chapter-meta-item">
        <span className="wt-seal wt-seal--확인필요">⚠</span>
        <span>확인필요 <strong>{s.확인필요}</strong></span>
      </span>
      <span style={{ color: 'var(--color-hairline)', userSelect: 'none' }}>·</span>
      <span className="wt-chapter-meta-item">
        <span className="wt-seal wt-seal--강의기반">·</span>
        <span>강의기반 <strong>{s.강의기반}</strong></span>
      </span>
      <span style={{ color: 'var(--color-hairline)', userSelect: 'none' }}>·</span>
      <span style={{ color: 'var(--color-muted-soft)' }}>총 {s.total}건</span>
    </div>
  )
}
