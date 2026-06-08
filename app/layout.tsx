import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, JetBrains_Mono, Gowun_Batang } from "next/font/google";
import "./globals.css";
import { Disclaimer } from "@/components/Disclaimer";

const sans = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "원천징수 레퍼런스",
  description: "원천징수 실무 레퍼런스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header style={{ position: 'sticky', top: 0, height: 64, display: 'flex', alignItems: 'center',
          padding: '0 var(--space-lg)', background: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline)', zIndex: 10 }}>
          <a href="/" style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>원천징수 레퍼런스</a>
          <nav style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-md)', fontSize: 14 }}>
            <a href="/updates-2026">2026 개정</a><a href="/review-due">검토 임박</a>
          </nav>
        </header>
        <main style={{ maxWidth: 880, margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>{children}</main>
        <footer style={{ background: 'var(--color-surface-dark)', color: 'var(--color-on-dark)', padding: 'var(--space-xl) var(--space-lg)' }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}><Disclaimer /></div>
        </footer>
      </body>
    </html>
  );
}
