import Link from 'next/link'
import { SCREEN_GUIDES } from '@/lib/screen-guides'

export const metadata = {
  title: '구현 체크리스트 — 원천징수 실무',
  description: '원천징수 지식을 업무 객체·필드·검증 규칙으로 번역한 명세',
}

export default function ScreenGuidesIndexPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>구현 체크리스트</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        원천징수 지식을 업무 객체·필드·검증 규칙·fact/rule 연결로 번역한 명세
      </p>

      <div className="wt-chapter-grid" role="list" aria-label="업무 객체 구현 체크리스트 목록">
        {SCREEN_GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/screen-guides/${guide.slug}`}
            className="wt-chapter-card"
            role="listitem"
          >
            <span
              className="wt-chapter-number"
              style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}
            >
              {guide.role}
            </span>
            <span className="wt-chapter-title">{guide.title}</span>
            <span
              style={{
                display: 'block',
                marginTop: 'var(--space-xs)',
                fontSize: '0.82rem',
                color: 'var(--gray-500)',
                lineHeight: 1.5,
                fontWeight: 400,
              }}
            >
              {guide.purpose}
            </span>
          </Link>
        ))}
      </div>
    </article>
  )
}
