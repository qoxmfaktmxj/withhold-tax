import Link from 'next/link'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { factsToDocs } from '@/lib/search/facts-docs'
import { availableChapterSlugs, CHAPTERS, chapterTitle } from '@/lib/chapters'
import { Search } from '@/components/Search'

export default function Home() {
  const facts = loadFacts(factsRaw)
  const docs = factsToDocs(facts)
  const available = new Set(availableChapterSlugs())

  // 2026 개정 항목 수
  const updates2026Count = facts.filter(
    (f) => f.changeType !== '없음' && f.effectiveDate?.startsWith('2026')
  ).length

  return (
    <div>
      {/* ── Editorial Hero ──────────────────────────────────── */}
      <section className="wt-hero">
        <span className="wt-hero-eyebrow">2026 기준 · 원천징수 실무</span>
        <h1>
          출처가 있는<br />원천징수 레퍼런스
        </h1>
        <p className="wt-hero-lead">
          법령 조문·시행일·검증상태가 명시된 사내 참고 자료.
          국세청 재검증 전 빠르게 근거를 찾고 판단의 출발점으로 활용하세요.
        </p>
      </section>

      {/* ── Search ──────────────────────────────────────────── */}
      <Search docs={docs} availableChapters={[...available]} />

      {/* ── 2026 개정 Navy Band ─────────────────────────────── */}
      {updates2026Count > 0 && (
        <div className="wt-navy-band">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <div>
              <p
                className="wt-mono"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'var(--color-on-dark-soft)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                2026 개정·시행
              </p>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-on-dark)' }}>
                {updates2026Count}건의 변경 항목이 시행되었습니다
              </h2>
              <p style={{ margin: 'var(--space-sm) 0 0', fontSize: 14, color: 'var(--color-on-dark-soft)' }}>
                고배당기업 배당 과세특례 신설, 간이지급명세서 제출주기 유예 등.
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link
                href="/updates-2026"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'var(--color-coral)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                개정 이력 전체 보기 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Chapter Grid ────────────────────────────────────── */}
      <div style={{ marginTop: 'var(--space-xxl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)', fontSize: '1.25rem' }}>목차</h2>
        <div className="wt-chapter-grid">
          {CHAPTERS.map((ch, i) => {
            const isAvailable = available.has(ch.slug)
            // Derive a short chapter number label
            const numLabel = ch.slug.startsWith('ch')
              ? `Ch ${ch.slug.replace('ch', '')}`
              : ch.slug === 'nonresident'
              ? '부록 A'
              : '부록 B'

            if (isAvailable) {
              return (
                <Link
                  key={ch.slug}
                  href={`/ch/${ch.slug}`}
                  className="wt-chapter-card"
                >
                  <span className="wt-chapter-number">{numLabel}</span>
                  <span className="wt-chapter-title">{ch.title}</span>
                </Link>
              )
            }
            return (
              <div
                key={ch.slug}
                className="wt-chapter-card wt-chapter-card--unavailable"
                aria-disabled="true"
              >
                <span className="wt-chapter-number">{numLabel}</span>
                <span className="wt-chapter-title">{ch.title}</span>
                <span
                  className="wt-mono"
                  style={{ fontSize: 10, color: 'var(--color-muted-soft)', marginTop: 6, display: 'block' }}
                >
                  작성 예정
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
