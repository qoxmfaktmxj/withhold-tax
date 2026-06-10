import sourcesRaw from '@/content/sources.json'
import { loadSources, byReliability } from '@/lib/sources/store'
import type { SourceRecord } from '@/lib/sources/schema'

function SourceCard({ s }: { s: SourceRecord }) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-lg)',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {s.url ? (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--accent)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                lineHeight: 1.4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {s.title}
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                lineHeight: 1.4,
              }}
            >
              {s.title}
            </span>
          )}
        </div>
        <span
          className="wt-mono"
          style={{
            fontSize: '0.65rem',
            color: 'var(--gray-400)',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            paddingTop: 2,
          }}
        >
          {s.type}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          {s.publisher}
        </span>
        {s.publishedAt && (
          <>
            <span style={{ color: 'var(--gray-300)', fontSize: '0.7rem' }}>·</span>
            <span className="wt-mono" style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
              발행 {s.publishedAt}
            </span>
          </>
        )}
        <span style={{ color: 'var(--gray-300)', fontSize: '0.7rem' }}>·</span>
        <span className="wt-mono" style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
          확인 {s.accessedAt}
        </span>
      </div>

      {s.notes && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {s.notes}
        </p>
      )}
    </div>
  )
}

interface SectionProps {
  title: string
  description: string
  badge: string
  badgeColor: string
  items: SourceRecord[]
}

function SourceSection({ title, description, badge, badgeColor, items }: SectionProps) {
  if (items.length === 0) return null
  return (
    <section style={{ marginBottom: 'var(--space-xxl)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-sm)',
          paddingBottom: 'var(--space-sm)',
          borderBottom: '2px solid var(--border)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            background: badgeColor,
            color: 'var(--white)',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
          }}
        >
          {badge}
        </span>
        <span
          className="wt-mono"
          style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginLeft: 'auto' }}
        >
          {items.length}건
        </span>
      </div>
      <p
        style={{
          fontSize: '0.84rem',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-lg)',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {items.map((s) => (
          <SourceCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  )
}

export default function Page() {
  const sources = loadSources(sourcesRaw)
  const grouped = byReliability(sources)

  return (
    <div className="wt-article">
      <header className="wt-hero">
        <span className="wt-hero-eyebrow">출처 · 근거 자료</span>
        <h1>출처 목록</h1>
        <p className="wt-hero-lead">
          본 레퍼런스의 fact 근거로 사용된 출처를 신뢰도 등급별로 정리합니다.
          <strong>확정</strong> 표시 fact는 1차 출처(법령 원문)와의 대조를 원칙으로 합니다.
        </p>
      </header>

      <div
        style={{
          background: 'var(--caution-bg)',
          border: '1px solid var(--caution-border)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-md) var(--space-lg)',
          marginBottom: 'var(--space-xxl)',
          fontSize: '0.82rem',
          color: 'var(--caution-text)',
          lineHeight: 1.6,
        }}
        role="note"
        aria-label="면책 고지"
      >
        <strong>면책 고지</strong> — 모든 수치·기한·세율은 국가법령정보센터·국세청·홈택스·최신 예규로
        최종 확인해야 하는 실무 참조용입니다. 단정적 법률자문으로 사용하지 마십시오.
        각 사실에는 <code style={{ fontSize: '0.78rem', background: 'transparent' }}>as-of date</code>와 출처가 부착되어 있습니다.
      </div>

      <SourceSection
        title="1차 출처 — 법령 원문"
        description="법률·시행령·시행규칙 원문 및 공공 API. 확정 fact의 최우선 근거 출처입니다."
        badge="PRIMARY"
        badgeColor="var(--verified-text)"
        items={grouped.primary}
      />

      <SourceSection
        title="공식 안내 — 국세청·홈택스"
        description="국세청 공식 안내 페이지, 예규·해석, 홈택스 서식. 법령 원문 해석의 보조 근거입니다."
        badge="OFFICIAL"
        badgeColor="var(--blue-600)"
        items={grouped['official-guide']}
      />

      <SourceSection
        title="2차 자료 — 보고서·강의"
        description="세무사회·회계법인 보고서, 강의 자료. 법령 원문 단독으로 확정 처리하지 않으며, 1차 출처 보조 참고용으로만 사용합니다."
        badge="SECONDARY"
        badgeColor="var(--gray-500)"
        items={grouped.secondary}
      />
    </div>
  )
}
