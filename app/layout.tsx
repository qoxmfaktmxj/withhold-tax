import type { Metadata } from 'next'
import Link from 'next/link'
import { Noto_Serif_KR, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Disclaimer } from '@/components/Disclaimer'
import { CHAPTERS, APPENDICES, availableChapterSlugs } from '@/lib/chapters'

/* ── Fonts ────────────────────────────────────────────────────────────── */
// Noto Serif KR: 명조 display — headlines, wordmark
const serif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
  display: 'swap',
})

// JetBrains Mono: law refs, numbers, kickers, labels
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})
// Note: Pretendard (body/UI sans) is loaded via @import in globals.css

export const metadata: Metadata = {
  title: '원천징수 레퍼런스',
  description: '출처·시행일이 명시된 원천징수 실무 참고 자료. 2026 기준.',
}

/* ── Chapter number labels ────────────────────────────────────────────── */
function chapterNumLabel(slug: string, index: number): string {
  if (slug.startsWith('ch')) {
    const n = slug.replace('ch', '')
    return `제${n}장`
  }
  return `부록`
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const available = new Set(availableChapterSlugs())

  return (
    <html
      lang="ko"
      className={`${serif.variable} ${mono.variable}`}
    >
      <body>
        <div className="wt-shell">
          {/* ── Page top rule ──────────────────────────────────── */}
          <div className="wt-page-top-rule" aria-hidden="true" />

          <div className="wt-shell-body">
            {/* ════════════════════════════ SIDEBAR ════════════════════════════ */}
            <aside className="wt-sidebar" aria-label="사이드바 내비게이션">
              <div className="wt-sidebar-inner">

                {/* Masthead — printed index style */}
                <div className="wt-sidebar-masthead">
                  <Link href="/" className="wt-sidebar-masthead-title">
                    원천징수 레퍼런스
                  </Link>
                  <span className="wt-sidebar-masthead-subtitle">
                    Withholding Tax Reference
                  </span>
                </div>

                {/* 바로가기 */}
                <div className="wt-sidebar-section">
                  <span className="wt-sidebar-section-label">바로가기</span>
                  <nav aria-label="주요 메뉴">
                    <ul className="wt-chapter-index">
                      <li>
                        <Link href="/updates-2026" className="wt-chapter-index-item">
                          <span className="wt-chapter-num" style={{ color: 'var(--oxblood)' }}>NEW</span>
                          <span className="wt-chapter-name">2026 개정 이력</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/review-due" className="wt-chapter-index-item">
                          <span className="wt-chapter-num">검토</span>
                          <span className="wt-chapter-name">검토 임박 항목</span>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>

                {/* 목차 */}
                <div className="wt-sidebar-section">
                  <span className="wt-sidebar-section-label">목차</span>
                  <nav aria-label="챕터 목차">
                    <ul className="wt-chapter-index">
                      {CHAPTERS.map((ch, i) => {
                        const numLabel = chapterNumLabel(ch.slug, i)
                        return available.has(ch.slug) ? (
                          <li key={ch.slug}>
                            <Link
                              href={`/ch/${ch.slug}`}
                              className="wt-chapter-index-item"
                            >
                              <span className="wt-chapter-num">{numLabel}</span>
                              <span className="wt-chapter-name">{ch.title}</span>
                            </Link>
                          </li>
                        ) : (
                          <li key={ch.slug} className="wt-chapter-index-item" style={{ cursor: 'default', opacity: 0.5 }}>
                            <span className="wt-chapter-num">{numLabel}</span>
                            <span className="wt-chapter-name">{ch.title}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>
                </div>

                {/* 부록 */}
                <div className="wt-sidebar-section">
                  <span className="wt-sidebar-section-label">부록</span>
                  <nav aria-label="부록">
                    <ul className="wt-chapter-index">
                      {APPENDICES.map((ap) =>
                        available.has(ap.slug) ? (
                          <li key={ap.slug}>
                            <Link
                              href={`/ch/${ap.slug}`}
                              className="wt-chapter-index-item"
                            >
                              <span className="wt-chapter-name">{ap.title}</span>
                            </Link>
                          </li>
                        ) : (
                          <li key={ap.slug} className="wt-chapter-index-item" style={{ cursor: 'default', opacity: 0.5 }}>
                            <span className="wt-chapter-name">{ap.title}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </nav>
                </div>

                {/* 검증 범례 */}
                <div className="wt-sidebar-section">
                  <span className="wt-sidebar-section-label">검증 범례</span>
                  <div className="wt-legend">
                    <div className="wt-legend-item">
                      <span className="wt-seal wt-seal--확정" aria-hidden="true">✓</span>
                      <span>확정 — 국세청 원문 대조</span>
                    </div>
                    <div className="wt-legend-item">
                      <span className="wt-seal wt-seal--확인필요" aria-hidden="true">⚠</span>
                      <span>확인필요 — 추가 검증 권장</span>
                    </div>
                    <div className="wt-legend-item">
                      <span className="wt-seal wt-seal--강의기반" aria-hidden="true">·</span>
                      <span>강의기반 — 출처 미확정</span>
                    </div>
                  </div>
                </div>

              </div>{/* /wt-sidebar-inner */}
            </aside>

            {/* ════════════════════════════ MAIN ════════════════════════════ */}
            <div className="wt-main">
              <main className="wt-content">
                {children}
              </main>

              <footer className="wt-footer" role="contentinfo">
                <span className="wt-footer-left">
                  원천징수 레퍼런스 · CFO Academy · Internal Use Only
                </span>
                <div style={{ textAlign: 'right' }}>
                  <Disclaimer />
                </div>
                <span className="wt-footer-right">
                  Rev. 2026-06-09 · v3.0
                </span>
              </footer>
            </div>
          </div>{/* /wt-shell-body */}
        </div>{/* /wt-shell */}
      </body>
    </html>
  )
}
