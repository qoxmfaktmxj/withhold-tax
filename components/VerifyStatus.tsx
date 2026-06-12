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

  // <details>는 MDX 문단(<p>) 안에서 invalid nesting → hydration 실패.
  // 모든 상태를 span + title/aria-label로 통일해 본문 어디서든 안전하게 렌더.
  // id는 호출부가 descId를 줄 때만 부여 — 고정 fallback id는 같은 페이지에
  // 동일 status 배지가 여러 개일 때 중복 DOM id를 만든다.
  return (
    <span
      id={descId}
      title={m.note}
      aria-label={`검증상태: ${status}. ${m.note}`}
      className={`wt-seal ${m.cls}`}
    >
      <span aria-hidden>{m.icon}</span>
      <span>{status}</span>
    </span>
  )
}
