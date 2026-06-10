import type { Metadata } from 'next'
import Link from 'next/link'
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Disclaimer } from '@/components/Disclaimer'
import { CommandPalette } from '@/components/CommandPalette'
import { CHAPTERS, APPENDICES, availableChapterSlugs } from '@/lib/chapters'

/* ── Fonts ────────────────────────────────────────────────────────────── */
// Hanken Grotesk: display / headlines — tight letter-spacing, weight 700/800
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
  display: 'swap',
})

// JetBrains Mono: law refs, citations, dates, code
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})
// Note: Pretendard Variable (Korean body) is loaded via @import in globals.css

export const metadata: Metadata = {
  title: '원천징수 레퍼런스',
  description: '출처·시행일이 명시된 원천징수 실무 참고 자료. 2026 기준.',
}

/* ── Chapter number labels ────────────────────────────────────────────── */
function chapterNumLabel(slug: string): string {
  if (slug.startsWith('ch')) {
    const n = slug.replace('ch', '').padStart(2, '0')
    return `CH ${n}`
  }
  return '부록'
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const available = new Set(availableChapterSlugs())

  return (
    <html
      lang="ko"
      className={`${hanken.variable} ${mono.variable}`}
    >
      <body>
        <div className="wt-shell">
          <div className="wt-shell-body">
            {/* ════════════════════════════ SIDEBAR ════════════════════════════ */}
            <aside className="wt-sidebar" aria-label="사이드바 내비게이션">
              <div className="wt-sidebar-inner">

                {/* Wordmark */}
                <div className="wt-sidebar-masthead">
                  <div className="wt-sidebar-wordmark-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <div>
                    <Link href="/" className="wt-sidebar-masthead-title">
                      원천징수 레퍼런스
                    </Link>
                    <span className="wt-sidebar-masthead-subtitle">
                      2026 실무 참고자료
                    </span>
                  </div>
                </div>

                {/* 전체 검색 (⌘K) */}
                <div className="wt-sidebar-section">
                  <CommandPalette />
                </div>

                {/* 바로가기 */}
                <div className="wt-sidebar-section">
                  <span className="wt-sidebar-section-label">바로가기</span>
                  <nav aria-label="주요 메뉴">
                    <ul className="wt-chapter-index">
                      <li>
                        <Link href="/updates-2026" className="wt-chapter-index-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--blue-600)', flexShrink: 0 }}>
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                            <polyline points="17 6 23 6 23 12"/>
                          </svg>
                          <span className="wt-chapter-name">2026 개정 이력</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/review-due" className="wt-chapter-index-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--blue-600)', flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span className="wt-chapter-name">검토 임박 항목</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/screen-guides" className="wt-chapter-index-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--blue-600)', flexShrink: 0 }}>
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                          </svg>
                          <span className="wt-chapter-name">화면 개발 가이드</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/calculators" className="wt-chapter-index-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--blue-600)', flexShrink: 0 }}>
                            <rect x="4" y="2" width="16" height="20" rx="2"/>
                            <line x1="8" y1="6" x2="16" y2="6"/>
                            <line x1="8" y1="12" x2="8" y2="12.01"/>
                            <line x1="12" y1="12" x2="12" y2="12.01"/>
                            <line x1="16" y1="12" x2="16" y2="16"/>
                            <line x1="8" y1="16" x2="8" y2="16.01"/>
                            <line x1="12" y1="16" x2="12" y2="16.01"/>
                          </svg>
                          <span className="wt-chapter-name">계산기</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/calendar" className="wt-chapter-index-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--blue-600)', flexShrink: 0 }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span className="wt-chapter-name">신고·납부 캘린더</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/sources" className="wt-chapter-index-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--blue-600)', flexShrink: 0 }}>
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                          </svg>
                          <span className="wt-chapter-name">출처 목록</span>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>

                {/* 목차 */}
                <div className="wt-sidebar-section" style={{ marginTop: 6 }}>
                  <span className="wt-sidebar-section-label">목차</span>
                  <nav aria-label="챕터 목차">
                    <ul className="wt-chapter-index">
                      {CHAPTERS.map((ch) => {
                        const numLabel = chapterNumLabel(ch.slug)
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
                          <li
                            key={ch.slug}
                            className="wt-chapter-index-item"
                            style={{ cursor: 'default', opacity: 0.5 }}
                            aria-disabled="true"
                          >
                            <span className="wt-chapter-num">{numLabel}</span>
                            <span className="wt-chapter-name">{ch.title}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>
                </div>

                {/* 부록 */}
                <div className="wt-sidebar-section" style={{ marginTop: 6 }}>
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
                          <li
                            key={ap.slug}
                            className="wt-chapter-index-item"
                            style={{ cursor: 'default', opacity: 0.5 }}
                            aria-disabled="true"
                          >
                            <span className="wt-chapter-name">{ap.title}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </nav>
                </div>

                {/* 검증 범례 */}
                <div className="wt-sidebar-section" style={{ marginTop: 8 }}>
                  <span className="wt-sidebar-section-label">검증 범례</span>
                </div>
                <div className="wt-legend">
                  <div className="wt-legend-item">
                    <span className="wt-seal wt-seal--확정" aria-hidden="true">✓ 확정</span>
                    <span>법령 원문 교차 확인</span>
                  </div>
                  <div className="wt-legend-item">
                    <span className="wt-seal wt-seal--확인필요" aria-hidden="true">⚠ 확인필요</span>
                    <span>재검증 권장</span>
                  </div>
                  <div className="wt-legend-item">
                    <span className="wt-seal wt-seal--강의기반" aria-hidden="true">· 강의기반</span>
                    <span>강의 자료 기반</span>
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
