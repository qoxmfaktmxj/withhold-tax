import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { UpdatesDashboard } from '@/components/UpdatesDashboard'

export default function Page() {
  const facts = loadFacts(factsRaw)
  return (
    <div className="wt-article" style={{ paddingTop: 'var(--space-xl)' }}>
      <header className="wt-hero">
        <span className="wt-hero-eyebrow">개정 이력 · 2026</span>
        <h1>2026 원천징수 개정·시행</h1>
        <p className="wt-hero-lead">
          최근 시행·개정 항목 (시행일 최신순).
          변경 전 내용과 현행 기준을 나란히 확인하세요.
        </p>
      </header>

      <UpdatesDashboard facts={facts} />
    </div>
  )
}
