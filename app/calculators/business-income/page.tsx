import ratesRaw from '@/content/tax-rules/2026/withholding-rates.json'
import { loadRules } from '@/lib/rules/engine'
import { BusinessIncomeCalculator } from '@/components/calculators/BusinessIncomeCalculator'
import { RuleBasis } from '@/components/calculators/RuleBasis'

export const metadata = { title: '사업소득 원천징수 계산기 — 원천징수 레퍼런스' }

export default function BusinessIncomeCalculatorPage() {
  const rule = loadRules(ratesRaw).find((r) => r.ruleId === 'resident_business_income_wht')!

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>사업소득 원천징수 계산기 (3.3%)</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        거주자 인적용역 사업소득: 소득세 3%(세무서) + 지방소득세 0.3%(지자체). 국세와 지방세는
        납부처·가산세 체계가 달라 분리 계산합니다. 2024.7.1 이후 지급분부터 1,000원 미만 소액부징수
        배제(즉 전액 원천징수).
      </p>
      <BusinessIncomeCalculator />
      <RuleBasis rule={rule} />
    </article>
  )
}
