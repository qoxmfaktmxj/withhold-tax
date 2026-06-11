import factsRaw from '@/content/facts.json'
import watchlistRaw from '@/content/law-watchlist.json'
import { loadFacts } from '@/lib/facts/store'
import { loadWatchlist } from '@/lib/watchlist'
import { UpdatesDashboard } from '@/components/UpdatesDashboard'

const statusLabel = {
  watching: '감시 중',
  confirmed: '확인 완료',
  implemented: '구현 완료',
  released: '배포 완료',
  deferred: '보류',
  not_applicable: '적용 제외',
}

export default function Page() {
  const facts = loadFacts(factsRaw)
  const watchlist = loadWatchlist(watchlistRaw)
  return (
    <div className="wt-article">
      <header className="wt-hero">
        <span className="wt-hero-eyebrow">개정 이력 · 2026</span>
        <h1>2026 원천징수 개정·시행</h1>
        <p className="wt-hero-lead">
          최근 시행·개정 항목 (시행일 최신순).
          변경 전 내용과 현행 기준을 나란히 확인하세요.
        </p>
      </header>

      <UpdatesDashboard facts={facts} />

      <h2 style={{ marginTop: 'var(--space-xxl)' }}>감시 목록 (watchlist)</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '64ch' }}>
        아직 시행 전이거나 1차 확인이 남은 항목. nextCheckDate에 재확인합니다.
      </p>
      <table className="wt-tbl" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>항목</th>
            <th>상태</th>
            <th>예정 시행</th>
            <th>다음 확인일</th>
            <th>영향</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((w) => (
            <tr key={w.watchId}>
              <td>
                {w.title}
                <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)', marginTop: 3 }}>{w.notes}</div>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{statusLabel[w.status]}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{w.expectedEffectiveDate}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{w.nextCheckDate}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{w.impact.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
