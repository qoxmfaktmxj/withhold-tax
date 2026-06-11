import { MonthlyWithholdingChecker } from '@/components/calculators/MonthlyWithholdingChecker'

export const metadata = { title: '월 급여 원천징수 검산기 — 원천징수 레퍼런스' }

export default function MonthlyWithholdingPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>월 급여 원천징수 검산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        홈택스 근로소득 간이세액표 조회값과 회사 원천징수액을 비교해 월 급여 소득세·지방소득세 차이를 검산합니다.
      </p>
      <MonthlyWithholdingChecker />
    </article>
  )
}
