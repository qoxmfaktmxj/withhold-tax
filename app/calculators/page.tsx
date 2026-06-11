import Link from 'next/link'
import { AVAILABLE_TOOL_PRIORITIES } from '@/lib/tool-priorities'

export const metadata = { title: '급여·세무 시뮬레이터 — 원천징수 레퍼런스' }

export default function CalculatorsPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>급여·세무 시뮬레이터</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        rule 데이터(content/tax-rules) 기반 실무 리스크 검산 도구. 단순 세율 곱셈보다
        신고·납부 리스크가 큰 항목을 우선 제공합니다. 신고·납부 전 공식 확인이 우선합니다.
      </p>
      <div className="wt-chapter-grid" role="list" style={{ marginTop: 'var(--space-lg)' }}>
        {AVAILABLE_TOOL_PRIORITIES.map((tool) => (
          <Link key={tool.id} href={tool.route} className="wt-chapter-card" role="listitem">
            <span className="wt-chapter-title">{tool.title}</span>
            <span style={{ display: 'block', marginTop: 6, fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 400 }}>
              {tool.summary}
            </span>
          </Link>
        ))}
      </div>
    </article>
  )
}
