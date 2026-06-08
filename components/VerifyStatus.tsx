import type { Fact } from '@/lib/facts/schema'

const MAP: Record<Fact['verifyStatus'], { icon: string; tone: string; note: string }> = {
  '확정': { icon: '✓', tone: 'var(--color-verified)', note: '공식 1차 출처와 직접 매칭됨' },
  '확인필요': { icon: '!', tone: 'var(--color-check)', note: '출처는 있으나 해석/시행시점 재확인 권장' },
  '강의기반': { icon: '·', tone: 'var(--color-lecture)', note: '강의 설명 기반. 공식 1차 출처 미확정 — 신고 전 별도 확인 필요' },
}

export function VerifyStatus({ status }: { status: Fact['verifyStatus'] }) {
  const m = MAP[status]
  const id = `vs-${status}`
  return (
    <span id={id} title={m.note} aria-label={`검증상태: ${status}. ${m.note}`}
      style={{ color: m.tone, fontSize: 11, fontWeight: 500 }}>
      {m.icon} {status}
    </span>
  )
}
