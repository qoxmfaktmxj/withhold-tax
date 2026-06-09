import type { Metadata } from 'next'
import Link from 'next/link'
import { Noto_Serif_KR, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Disclaimer } from '@/components/Disclaimer'
import { CHAPTERS, availableChapterSlugs } from '@/lib/chapters'

/* ── Fonts ────────────────────────────────────────────────────────────── */
// Noto Serif KR: 명조 display — headings, wordmark
const serif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-serif',
  display: 'swap',
})

// JetBrains Mono: law refs, numbers, code
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
          {/* ── Fixed Left Sidebar ─────────────────────────────── */}
          <aside className="wt-sidebar" aria-label="사이드바 내비게이션">
            <div className="wt-sidebar-inner">

              {/* Wordmark */}
              <Link href="/" className="wt-wordmark">
                원천징수<br />레퍼런스
              </Link>

              {/* Quick nav */}
              <nav aria-label="주요 메뉴">
                <p className="wt-nav-section">바로가기</p>
                <Link href="/updates-2026" className="wt-nav-link">
                  2026 개정 이력
                </Link>
                <Link href="/review-due" className="wt-nav-link">
                  검토 임박 항목
                </Link>
              </nav>

              {/* Chapter index */}
              <nav aria-label="챕터 목차">
                <p className="wt-nav-section">목차</p>
                {CHAPTERS.map((ch) =>
                  available.has(ch.slug) ? (
                    <Link
                      key={ch.slug}
                      href={`/ch/${ch.slug}`}
                      className="wt-nav-link"
                    >
                      {ch.title}
                    </Link>
                  ) : (
                    <span key={ch.slug} className="wt-nav-link--unavailable">
                      {ch.title}
                    </span>
                  )
                )}
              </nav>

              {/* Verify legend */}
              <div>
                <p className="wt-nav-section">검증 범례</p>
                <div className="wt-legend">
                  <div className="wt-legend-item">
                    <span className="wt-seal wt-seal--확정">✓</span>
                    <span>확정 — 1차 출처 매칭</span>
                  </div>
                  <div className="wt-legend-item">
                    <span className="wt-seal wt-seal--확인필요">⚠</span>
                    <span>확인필요 — 재확인 권장</span>
                  </div>
                  <div className="wt-legend-item">
                    <span className="wt-seal wt-seal--강의기반">·</span>
                    <span>강의기반 — 별도 확인</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content area ──────────────────────────────── */}
          <div className="wt-main">
            <main className="wt-content">
              {children}
            </main>

            <footer className="wt-footer">
              <Disclaimer />
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
