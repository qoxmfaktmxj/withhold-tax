import { NonTaxableCapCalculator } from '@/components/calculators/NonTaxableCapCalculator'

export const metadata = { title: '비과세 급여 한도 검산기 — 원천징수 레퍼런스' }

export default function NonTaxableCapPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>비과세 급여 한도 검산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        식대, 보육수당, 자가운전보조금, 국외근로소득의 월별 한도와 과세 전환 금액을 rule 데이터 기준으로 검산합니다.
      </p>
      <NonTaxableCapCalculator />
    </article>
  )
}
