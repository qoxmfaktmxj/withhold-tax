import penaltyRulesRaw from '@/content/tax-rules/2026/penalty-rules.json'
import { loadRules } from '@/lib/rules/engine'
import { PenaltyCalculator } from '@/components/calculators/PenaltyCalculator'
import { RuleBasis } from '@/components/calculators/RuleBasis'

export const metadata = { title: '원천세 미납·가산세 리스크 진단 — 원천징수 레퍼런스' }

export default function PenaltyCalculatorPage() {
  const rules = loadRules(penaltyRulesRaw).filter((r) => r.ruleId === 'wht_late_payment_penalty')
  const current = rules.find((r) => r.version === '2026.1.0')!
  const revised = rules.find((r) => r.version === '2026.7.0')!

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>원천세 미납·가산세 리스크 진단</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        원천징수 등 납부지연가산세(국세기본법 제47조의5): 미납세액 × 3% + 미납세액 × 미납일수 ×
        22/100,000, 합계는 미납세액의 10% 한도(전체 50%). 2026.7.1 이후·고지 후 납부는 고지서 확인이 우선입니다.
      </p>
      <PenaltyCalculator />
      <RuleBasis rule={current} />
      <RuleBasis rule={revised} />
    </article>
  )
}
