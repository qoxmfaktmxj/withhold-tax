import socialInsuranceRaw from '@/content/tax-rules/2026/social-insurance-2026.json'
import { loadRules } from '@/lib/rules/engine'
import { ReverseNetPayCalculator } from '@/components/calculators/ReverseNetPayCalculator'
import { RuleBasis } from '@/components/calculators/RuleBasis'

export const metadata = { title: '세후→세전 역산 계산기 — 원천징수 레퍼런스' }

export default function ReverseNetPayPage() {
  const rule = loadRules(socialInsuranceRaw).find((r) => r.ruleId === 'social_insurance_rates_2026')

  return (
    <article className="wt-article">
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>세후→세전 역산 계산기</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '62ch' }}>
        희망 월 실수령액에서 2026년 4대보험 요율(국민연금 4.75%·건강 3.595%·장기요양 13.14%·고용
        0.9%)과 소득세·지방소득세를 역산해 세전 월급(총지급액)을 추정합니다. 소득세는 간이세액표가
        아닌 연 환산 근사치로 계산하므로 실제 월 원천징수액과 차이가 있을 수 있습니다. 실무 참조용
        추정치이며, 최종 확인은 법령·국세청 홈택스·각 공단 고시 기준이 우선합니다.
      </p>
      <ReverseNetPayCalculator />
      {rule && <RuleBasis rule={rule} />}
    </article>
  )
}
