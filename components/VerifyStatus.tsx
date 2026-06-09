import type { Fact } from '@/lib/facts/schema'

const MAP: Record<
  Fact['verifyStatus'],
  { icon: string; cls: string; note: string }
> = {
  '확정':    { icon: '✓', cls: 'wt-seal--확정',    note: '공식 1차 출처와 직접 매칭됨' },
  '확인필요': { icon: '⚠', cls: 'wt-seal--확인필요', note: '출처는 있으나 해석/시행시점 재확인 권장' },
  '강의기반': { icon: '·', cls: 'wt-seal--강의기반', note: '강의 설명 기반. 공식 1차 출처 미확정 — 신고 전 별도 확인 필요' },
}

export function VerifyStatus({
  status,
  descId,
}: {
  status: Fact['verifyStatus']
  descId?: string
}) {
  const m = MAP[status]
  const id = descId ?? `vs-${status}`

  if (status === '강의기반') {
    return (
      <span id={id} style={{ display: 'inline' }}>
        <details style={{ display: 'inline', verticalAlign: 'middle' }}>
          <summary
            title={m.note}
            aria-label={`검증상태: ${status}. ${m.note}`}
            className={`wt-seal ${m.cls}`}
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span aria-hidden>{m.icon}</span>
            <span>{status}</span>
          </summary>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--gray-500)',
              marginTop: 4,
              marginLeft: 4,
              lineHeight: 1.5,
            }}
          >
            {m.note}
          </span>
        </details>
      </span>
    )
  }

  return (
    <span
      id={id}
      title={m.note}
      aria-label={`검증상태: ${status}. ${m.note}`}
      className={`wt-seal ${m.cls}`}
    >
      <span aria-hidden>{m.icon}</span>
      <span>{status}</span>
    </span>
  )
}
