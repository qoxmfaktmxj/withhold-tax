import withholdingRatesRaw from '@/content/tax-rules/2026/withholding-rates.json'
import { loadRules } from '@/lib/rules/engine'
import { DailyWorkerTaxCalculator } from '@/components/calculators/DailyWorkerTaxCalculator'
import { RuleBasis } from '@/components/calculators/RuleBasis'

export const metadata = { title: '일용근로 원천징수 세액 — 원천징수 레퍼런스' }

export default function DailyWorkerTaxPage() {
  const rule = loadRules(withholdingRatesRaw).find((r) => r.ruleId === 'daily_worker_wht')

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>일용근로 원천징수 세액</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        일세액 = (일당 − 150,000원) × 6% × (1 − 55%). 세액이 1,000원 미만이면 소액부징수로
        원천징수하지 않으며, 일정 기간 단위로 일괄지급하는 경우 일별 징수세액의 합계액을 기준으로
        판단합니다. 실무 참조용 추정치로, 최종 확인은 법령·국세청 홈택스 기준이 우선합니다.
      </p>
      <DailyWorkerTaxCalculator />
      {rule && <RuleBasis rule={rule} />}
    </article>
  )
}
