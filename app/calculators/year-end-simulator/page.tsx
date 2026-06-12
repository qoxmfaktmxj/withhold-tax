import yearEndRulesRaw from '@/content/tax-rules/2026/year-end-settlement.json'
import { YearEndSimulator } from '@/components/calculators/YearEndSimulator'
import { RuleBasis } from '@/components/calculators/RuleBasis'
import { loadRules } from '@/lib/rules/engine'

export const metadata = { title: '연말정산 환급·추가납부 시뮬레이터 — 원천징수 레퍼런스' }

export default function YearEndSimulatorPage() {
  const rule = loadRules(yearEndRulesRaw).find((entry) => entry.ruleId === 'employee_year_end_tax_simulator_2026')

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>연말정산 환급·추가납부 시뮬레이터</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        총급여, 기납부세액, 인적공제, 자녀 수, 연금보험료와 직접입력 공제 합계로 결정세액과 환급·추가납부 예상액을 간이 추정합니다.
      </p>
      <YearEndSimulator />
      {rule && <RuleBasis rule={rule} />}
    </article>
  )
}
