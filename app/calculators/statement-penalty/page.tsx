import { StatementPenaltyCalculator } from '@/components/calculators/StatementPenaltyCalculator'

export const metadata = { title: '지급명세서·간이지급명세서 가산세 계산기 — 원천징수 레퍼런스' }

export default function StatementPenaltyPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>지급명세서·간이지급명세서 가산세 계산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        미제출·지연제출 지급금액과 명세서 유형, 기업 구분을 기준으로 제출불성실 가산세와 한도 적용 여부를 검산합니다.
      </p>
      <StatementPenaltyCalculator />
    </article>
  )
}
