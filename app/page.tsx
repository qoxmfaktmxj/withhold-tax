import Link from 'next/link'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { factsToDocs } from '@/lib/search/facts-docs'
import { availableChapterSlugs, CHAPTERS, APPENDICES } from '@/lib/chapters'
import { Search } from '@/components/Search'

/* ── Chapter number label helper ─────────────────────────────────────── */
function chapterNumLabel(slug: string): string {
  if (slug.startsWith('ch')) return `제${slug.replace('ch', '')}장`
  if (slug === 'nonresident') return '부록'
  if (slug === 'interest-dividend') return '부록'
  return '부록'
}

export default function Home() {
  const facts = loadFacts(factsRaw)
  const docs = factsToDocs(facts)
  const available = new Set(availableChapterSlugs())

  // 2026 개정 항목 수
  const updates2026Count = facts.filter(
    (f) => f.changeType !== '없음' && f.effectiveDate?.startsWith('2026')
  ).length

  // 오늘 날짜 (서버 렌더)
  const today = new Date()
  const publishDate = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`

  return (
    <div>
      {/* ════════════ GAZETTE MASTHEAD ════════════ */}
      <header className="wt-gazette-masthead">
        <div className="wt-gazette-kicker">
          CFO Academy &nbsp;·&nbsp; 원천징수 실무 &nbsp;·&nbsp; 第2026號
        </div>
        <h1 className="wt-gazette-headline">
          출처가 있는 원천징수 레퍼런스
        </h1>
        <div className="wt-gazette-dateline">
          Published {publishDate} &nbsp;·&nbsp; Revision III &nbsp;·&nbsp; Internal Reference
        </div>
      </header>

      <div style={{ padding: '28px var(--space-xxl) var(--space-xxl)' }}>

        {/* ════════════ LEAD ════════════ */}
        <p className="wt-lead-text">
          법령 조문·시행일·검증상태가 명시된 사내 참고 자료입니다.
          <strong>국세청 재검증 전 빠르게 근거를 찾으세요.</strong>
          본 레퍼런스의 모든 항목은 소득세법·법인세법·조세특례제한법 원문과 대조하여
          검증 등급을 부여하였으며, 개정 사항은 시행일 기준으로 즉시 반영됩니다.
        </p>

        {/* ════════════ SEARCH ════════════ */}
        <Search docs={docs} availableChapters={[...available]} />

        {/* ════════════ 2026 개정 NOTICE BLOCK ════════════ */}
        {updates2026Count > 0 && (
          <div className="wt-notice-block">
            <div className="wt-notice-inner">
              <span className="wt-notice-label">2026 개정·시행</span>
              <span className="wt-notice-text">
                {updates2026Count}건의 변경 항목이 시행되었습니다 —
                고배당기업 배당 과세특례 신설, 간이지급명세서 제출주기 유예 등
              </span>
            </div>
            <Link href="/updates-2026" className="wt-notice-link">
              개정 이력 전체 보기 →
            </Link>
          </div>
        )}

        {/* ════════════ TRUST-MARK CITATION CARDS ════════════ */}
        <div className="wt-section-rule-heading">
          <span className="wt-section-rule-text">인용 사례 · 규정 출처</span>
          <div className="wt-section-rule-line" />
        </div>

        <div className="wt-citation-cluster">
          {/* Card 1: Verified — 비영업대금 25% (correct) */}
          <div className="wt-citation-card">
            <div className="wt-citation-card-header">
              <span className="wt-citation-card-kicker">
                원천징수 세율 · 비영업대금 이익
              </span>
              <span className="wt-citation-card-status wt-citation-card-status--확정">
                ✓ 확정
              </span>
            </div>
            <div className="wt-citation-card-body">
              <p className="wt-citation-statement">
                비영업대금 이익의 원천징수세율은{' '}
                <span className="wt-citation-rate">25%</span>입니다.
              </p>
            </div>
            <div className="wt-citation-ref">
              § 소득세법 제129조 제1항 제1호 나목 &nbsp;·&nbsp;
              시행 2026.06 &nbsp;·&nbsp;
              <span className="ref-verified">국세청 ✓확정</span>
              &nbsp;— 국가법령정보센터 원문 대조 완료
            </div>
          </div>

          {/* Card 2: 확인필요 — 고배당 과세특례 */}
          <div className="wt-citation-card">
            <div className="wt-citation-card-header">
              <span className="wt-citation-card-kicker">
                배당소득 · 고배당기업 과세특례
              </span>
              <span className="wt-citation-card-status wt-citation-card-status--확인필요">
                ⚠ 확인필요
              </span>
            </div>
            <div className="wt-citation-card-body">
              <p className="wt-citation-statement">
                고배당기업 배당소득은 일반 배당소득세율
                (14% → 20% → 25% → 30% 누진)이 적용되며,
                과세특례 요건 충족 시 분리과세 가능합니다.
              </p>
            </div>
            <div className="wt-citation-ref">
              § 조세특례제한법 제17조의3 &nbsp;·&nbsp;
              시행 2026.01 &nbsp;·&nbsp;
              <span className="ref-caution">⚠확인필요</span>
              &nbsp;— 시행령 세부 요건 확정 후 재검증 필요
            </div>
          </div>
        </div>

        {/* ════════════ CHAPTER INDEX GRID ════════════ */}
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
