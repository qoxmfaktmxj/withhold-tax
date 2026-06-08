import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { UpdatesDashboard } from '@/components/UpdatesDashboard'

export default function Page() {
  const facts = loadFacts(factsRaw)
  return (
    <>
      <h1>원천징수 개정·시행 변경 이력</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>
        최근 시행·개정 항목 (시행일 최신순). 2026년 시행 항목 포함.
      </p>
      <UpdatesDashboard facts={facts} />
    </>
  )
}
