import factsRaw from '@/content/facts.json'
import { loadFacts, reviewDue } from '@/lib/facts/store'

export default function Page() {
  const items = reviewDue(loadFacts(factsRaw))
  return (
    <>
      <h1>검토 임박 항목</h1>
      {items.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>검토 예정 항목 없음.</p>
      ) : (
        <table className="wt-tbl">
          <thead>
            <tr>
              <th>다음 검토일</th>
              <th>항목</th>
              <th>현재 상태</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id}>
                <td className="mono">{f.nextReviewBy}</td>
                <td>{f.slug}</td>
                <td>{f.verifyStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
