import { YearEndInstallmentScheduler } from '@/components/calculators/YearEndInstallmentScheduler'

export const metadata = { title: '연말정산 추가세액 분납 스케줄러 — 원천징수 레퍼런스' }

export default function YearEndInstallmentPage() {
  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>연말정산 추가세액 분납 스케줄러</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        추가납부세액이 10만원을 초과하는 경우 2월부터 4월까지 지급월별 분납액을 산출합니다.
        현재 자동 스케줄은 사업소득 연말정산 fact가 연결된 범위에 한정합니다.
      </p>
      <YearEndInstallmentScheduler />
    </article>
  )
}
