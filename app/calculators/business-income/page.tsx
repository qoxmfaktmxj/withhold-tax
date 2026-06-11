import ratesRaw from '@/content/tax-rules/2026/withholding-rates.json'
import { loadRules } from '@/lib/rules/engine'
import { BusinessIncomeCalculator } from '@/components/calculators/BusinessIncomeCalculator'
import { RuleBasis } from '@/components/calculators/RuleBasis'

export const metadata = { title: '사업소득 원천징수 rule demo — 원천징수 레퍼런스' }

export default function BusinessIncomeCalculatorPage() {
  const rule = loadRules(ratesRaw).find((r) => r.ruleId === 'resident_business_income_wht')!

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>사업소득 원천징수 rule demo (3.3%)</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        rule engine의 거주자 인적용역 사업소득 세율 적용 예시입니다. 단순 3.3% 금액 산출은
        실무 도구의 중심 기능으로 보지 않으며, 소득 분류·연말정산 대상·제출기한 판단은
        구현 체크리스트와 fact 근거를 함께 확인해야 합니다.
      </p>
      <BusinessIncomeCalculator />
      <RuleBasis rule={rule} />
    </article>
  )
}
