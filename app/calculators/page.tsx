import Link from 'next/link'

export const metadata = { title: '계산기 — 원천징수 레퍼런스' }

const CALCULATORS = [
  {
    slug: 'penalty',
    title: '원천세 납부지연가산세',
    desc: '미납세액·기한·납부일 입력 → 3% + 일할이자, 10% 한도, 2026.7.1 개정 분기 반영',
  },
  {
    slug: 'business-income',
    title: '사업소득 원천징수(3.3%)',
    desc: '지급액 입력 → 소득세 3% + 지방소득세 0.3% 분리 계산, 10원 미만 절사',
  },
]

export default function CalculatorsPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>계산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        rule 데이터(content/tax-rules) 기반 추정 계산기. 모든 결과에 계산 근거 fact와 적용 rule
        버전이 표시됩니다. 신고·납부 전 공식 확인이 우선합니다.
      </p>
      <div className="wt-chapter-grid" role="list" style={{ marginTop: 'var(--space-lg)' }}>
        {CALCULATORS.map((c) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`} className="wt-chapter-card" role="listitem">
            <span className="wt-chapter-title">{c.title}</span>
            <span style={{ display: 'block', marginTop: 6, fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 400 }}>
              {c.desc}
            </span>
          </Link>
        ))}
      </div>
    </article>
  )
}
