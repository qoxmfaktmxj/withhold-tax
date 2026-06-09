export function Disclaimer() {
  return (
    <p role="note" aria-label="면책 공지" style={{ margin: 0, lineHeight: 1.7 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.6rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--label-muted)',
          marginRight: '0.5em',
        }}
      >
        면책
      </span>
      <span
        style={{
          fontFamily: "'Noto Sans KR', Pretendard, sans-serif",
          fontSize: '0.82rem',
          color: 'var(--ink-faint)',
        }}
      >
        본 자료는 강의 정리 기반 <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>사내 참고용</strong>입니다.
        신고·납부 전 국가법령정보센터·국세청·홈택스·세무대리인 검토가 우선하며,
        회사는 본 자료 사용 결과에 대해 책임지지 않습니다.
      </span>
    </p>
  )
}
