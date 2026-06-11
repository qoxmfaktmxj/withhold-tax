import { SalaryNetPayCalculator } from '@/components/calculators/SalaryNetPayCalculator'

export const metadata = { title: '연봉·실수령액 검산기 — 원천징수 레퍼런스' }

export default function SalaryNetPayPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>연봉·실수령액 검산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        월 총급여와 급여명세서 공제액을 기준으로 월 실수령액, 연 실수령액, 공제율을 검산합니다.
      </p>
      <SalaryNetPayCalculator />
    </article>
  )
}
