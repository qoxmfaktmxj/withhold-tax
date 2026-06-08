import type { Fact } from '@/lib/facts/schema'
import { chapterSummary } from '@/lib/facts/store'

export function ChapterVerifySummary({ facts }: { facts: Fact[] }) {
  const s = chapterSummary(facts)
  return (
    <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
      이 장 검증: <span style={{ color: 'var(--color-verified)' }}>확정 {s.확정}</span> ·{' '}
      <span style={{ color: 'var(--color-check)' }}>확인필요 {s.확인필요}</span> ·{' '}
      <span style={{ color: 'var(--color-lecture)' }}>강의기반 {s.강의기반}</span> / 총 {s.total}
    </p>
  )
}
