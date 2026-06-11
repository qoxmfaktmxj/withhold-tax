import Link from 'next/link'
import { AVAILABLE_TOOL_PRIORITIES } from '@/lib/tool-priorities'

export const metadata = { title: '실무 도구 — 원천징수 레퍼런스' }

export default function ToolsPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>실무 도구</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        단순 세율 곱셈보다 신고·납부 리스크가 큰 항목을 우선 제공하는 급여·원천세 검산 도구입니다.
        각 결과는 실무 참고용이며 신고·납부 전 공식 확인이 우선합니다.
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
