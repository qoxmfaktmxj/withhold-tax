import retirementRulesRaw from '@/content/tax-rules/2026/retirement.json'
import { loadRules } from '@/lib/rules/engine'
import { ExecutiveSeveranceLimitCalculator } from '@/components/calculators/ExecutiveSeveranceLimitCalculator'
import { RuleBasis } from '@/components/calculators/RuleBasis'

export const metadata = { title: '임원퇴직금 한도 계산기 — 원천징수 레퍼런스' }

export default function ExecutiveSeveranceLimitPage() {
  const rule = loadRules(retirementRulesRaw).find((r) => r.ruleId === 'executive_severance_limit')!

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>임원퇴직금 한도 계산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        임원 퇴직소득금액 한도(소득세법 제22조③): 구간별 한도 = 연평균환산액 × 1/10 × 근속연수(근속월수÷12) ×
        배수(2012~2019 근속분 3배, 2020년 이후 근속분 2배)를 합산하고, 한도 초과분은 근로소득으로 과세됩니다.
        2011.12.31 이전 근속분(한도 없음·안분 규정)은 미반영인 실무 참조용 도구이며, 최종 확인은 법령·홈택스가 우선합니다.
      </p>
      <ExecutiveSeveranceLimitCalculator />
      <RuleBasis rule={rule} />
    </article>
  )
}
