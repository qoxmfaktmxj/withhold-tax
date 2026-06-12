import employeeLocalTaxRulesRaw from '@/content/tax-rules/2026/employee-local-tax.json'
import { loadRules } from '@/lib/rules/engine'
import { EmployeeLocalTaxCalculator } from '@/components/calculators/EmployeeLocalTaxCalculator'
import { RuleBasis } from '@/components/calculators/RuleBasis'

export const metadata = { title: '종업원분 주민세 계산기 — 원천징수 레퍼런스' }

export default function EmployeeLocalTaxPage() {
  const rule = loadRules(employeeLocalTaxRulesRaw).find(
    (r) => r.ruleId === 'employee_local_tax' && r.version === '2026.1.0'
  )!

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>종업원분 주민세 계산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        직전 12개월 월평균 급여총액으로 면세점(1억 5천만원 이하)을 판정하고, 2026년 신설
        장기근속수당 공제(1인당 월 급여 10% 범위·최대 36만원)와 육아휴직 대체인력 급여 전액
        공제를 반영해 당월 종업원분 주민세(표준세율 0.5%)와 신고기한(다음 달 10일)을 계산합니다.
        실무 참조용이며 최종 확인은 법령·위택스가 우선합니다.
      </p>
      <EmployeeLocalTaxCalculator />
      <RuleBasis rule={rule} />
    </article>
  )
}
