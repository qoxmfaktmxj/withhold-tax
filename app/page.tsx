import Link from 'next/link'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { availableChapterSlugs, CHAPTERS, APPENDICES } from '@/lib/chapters'

/* ── Chapter number label helper ─────────────────────────────────────── */
function chapterNumLabel(slug: string): string {
  if (slug.startsWith('ch')) {
    const n = slug.replace('ch', '').padStart(2, '0')
    return `CH ${n}`
  }
  return '부록'
}

export default function Home() {
  const facts = loadFacts(factsRaw)
  const available = new Set(availableChapterSlugs())

  // 2026 개정 항목 수
  const updates2026Count = facts.filter(
    (f) => f.changeType !== '없음' && f.effectiveDate?.startsWith('2026')
  ).length

  return (
    <div>
      {/* ════════════ WEBFLOW HERO ════════════ */}
      <header className="wt-gazette-masthead">
        <div className="wt-gazette-kicker">
          원천징수 실무 · 2026
        </div>
        <h1 className="wt-gazette-headline">
          출처가 있는<br />원천징수 레퍼런스
        </h1>
        <p className="wt-gazette-dateline">
          법령 조문·시행일·검증상태가 명시된 사내 참고 자료.{' '}
          국세청 재검증 전 빠르게 근거를 찾고 판단의 출발점으로 활용하세요.
        </p>
      </header>

      <div style={{ padding: '28px var(--space-xxl) var(--space-xxl)' }}>

        {/* ════════════ 2026 개정 BAND ════════════ */}
        {updates2026Count > 0 && (
          <div className="wt-notice-block">
            <div className="wt-notice-inner">
              <span className="wt-notice-label">2026 개정·시행</span>
              <span className="wt-notice-text">
                {updates2026Count}건의 변경 항목이 시행되었습니다
                <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>
                  {' '}— 고배당기업 배당 과세특례 신설, 간이지급명세서 제출주기 유예 등
                </span>
              </span>
            </div>
            <Link href="/updates-2026" className="wt-notice-link">
              개정 이력 보기 →
            </Link>
          </div>
        )}

        {/* ════════════ TRUST-MARK CITATION CARDS ════════════ */}
        <div className="wt-section-rule-heading">
          <span className="wt-section-rule-text">출처 표기 예시</span>
          <div className="wt-section-rule-line" />
        </div>

        <div className="wt-citation-cluster">
          {/* Card 1: 확정 — 비영업대금 25% (실제 데이터) */}
          <div className="wt-citation-card">
            <div className="wt-citation-card-header">
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--gray-900)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.3,
                    marginBottom: 4,
                  }}
                >
                  비영업대금 이익 원천징수세율{' '}
                  <span style={{ color: 'var(--blue-600)' }}>25%</span>
                </div>
              </div>
              <span className="wt-citation-card-status wt-citation-card-status--확정">
                ✓ 확정
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12 }}>
              비영업대금 이익(금전 대여에 따른 이자소득)에 대한 원천징수세율은 25%이며,
              소득세법 제129조 제1항에 명시되어 있습니다.
              지방소득세(2.5%)를 포함하면 실효 원천징수세율은 27.5%입니다.
            </p>
            <div className="wt-citation-ref">
              <span style={{ color: 'var(--blue-600)', fontWeight: 600 }}>§ 소득세법 제129조 제1항 제1호 나목</span>
              <span style={{ margin: '0 6px', color: 'var(--gray-300)' }}>·</span>
              시행 2026.06
              <span style={{ margin: '0 6px', color: 'var(--gray-300)' }}>·</span>
              <span className="ref-verified">국세청 ✓확정</span>
              <span style={{ margin: '0 6px', color: 'var(--gray-300)' }}>—</span>
              국가법령정보센터 원문 대조 완료
            </div>
          </div>

          {/* Card 2: 확인필요 — 고배당 과세특례 */}
          <div className="wt-citation-card">
            <div className="wt-citation-card-header">
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--gray-900)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.3,
                    marginBottom: 4,
                  }}
                >
                  외국법인 국내 사업장 없는 경우 세율{' '}
                  <span style={{ color: 'var(--blue-600)' }}>20%</span>
                </div>
              </div>
              <span className="wt-citation-card-status wt-citation-card-status--확인필요">
                ⚠ 확인필요
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12 }}>
              국내 사업장이 없는 외국법인의 국내원천소득에 대한 원천징수세율은 원칙적으로 20%이나,
              조세조약이 체결된 국가의 경우 적용 세율이 상이할 수 있으므로
              개별 조약 내용을 반드시 확인하세요.
            </p>
            <div className="wt-citation-ref">
              <span style={{ color: 'var(--blue-600)', fontWeight: 600 }}>§ 법인세법 제98조 제1항</span>
              <span style={{ margin: '0 6px', color: 'var(--gray-300)' }}>·</span>
              시행 2026.01
              <span style={{ margin: '0 6px', color: 'var(--gray-300)' }}>·</span>
              <span className="ref-caution">⚠ 확인필요</span>
              <span style={{ margin: '0 6px', color: 'var(--gray-300)' }}>—</span>
              조세조약 우선 적용 여부 별도 확인 필요
            </div>
          </div>
        </div>

        {/* ════════════ CHAPTER GRID ════════════ */}
        <div className="wt-section-rule-heading">
          <span className="wt-section-rule-text">전체 장 목차</span>
          <div className="wt-section-rule-line" />
        </div>

        <div className="wt-chapter-grid" role="list" aria-label="챕터 목차">
          {CHAPTERS.map((ch) => {
            const isAvailable = available.has(ch.slug)
            const numLabel = chapterNumLabel(ch.slug)

            if (isAvailable) {
              return (
                <Link
                  key={ch.slug}
                  href={`/ch/${ch.slug}`}
                  className="wt-chapter-card"
                  role="listitem"
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
                role="listitem"
                title="작성 예정"
              >
                <span className="wt-chapter-number">{numLabel}</span>
                <span className="wt-chapter-title">{ch.title}</span>
              </div>
            )
          })}
        </div>

        {/* ════════════ APPENDICES ════════════ */}
        <div className="wt-section-rule-heading" style={{ marginTop: 0 }}>
          <span className="wt-section-rule-text">부록</span>
          <div className="wt-section-rule-line" />
        </div>

        <div className="wt-chapter-grid" role="list" aria-label="부록 목차">
          {APPENDICES.map((ap) => {
            const isAvailable = available.has(ap.slug)
            if (isAvailable) {
              return (
                <Link
                  key={ap.slug}
                  href={`/ch/${ap.slug}`}
                  className="wt-chapter-card"
                  role="listitem"
                >
                  <span className="wt-chapter-title">{ap.title}</span>
                </Link>
              )
            }
            return (
              <div
                key={ap.slug}
                className="wt-chapter-card wt-chapter-card--unavailable"
                aria-disabled="true"
                role="listitem"
                title="작성 예정"
              >
                <span className="wt-chapter-title">{ap.title}</span>
              </div>
            )
          })}
        </div>

      </div>{/* /main padding wrapper */}
    </div>
  )
}
