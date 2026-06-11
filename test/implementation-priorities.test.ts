import { describe, expect, it } from 'vitest'
import {
  IMPLEMENTATION_PRIORITIES,
  getImplementationPrioritySummary,
  getImplementationPrioritiesByTier,
} from '@/lib/implementation-priorities'

describe('implementation priorities', () => {
  it('keeps the evaluated P0/P1/P2 fix list in priority order', () => {
    expect(
      IMPLEMENTATION_PRIORITIES.map(({ tier, rank, title }) => ({ tier, rank, title }))
    ).toEqual([
      { tier: 'P0', rank: 1, title: 'implementationStatus 기본값 변경' },
      { tier: 'P0', rank: 2, title: 'critical/high fact 검증 강화' },
      { tier: 'P0', rank: 3, title: 'rule engine에 monthly-cap, date-rule, custom 구현' },
      { tier: 'P0', rank: 4, title: 'local-income-tax.json example 수정' },
      { tier: 'P0', rank: 5, title: 'qa-new-routes.mjs 실패 시 exit 1' },
      { tier: 'P0', rank: 6, title: 'fact-freshness.mjs riskOrder에 critical 추가' },
      { tier: 'P0', rank: 7, title: '법인세법 §98조의6 제한세율 제출의무 확인' },
      { tier: 'P1', rank: 1, title: 'screen-specs JSON 분리' },
      { tier: 'P1', rank: 2, title: 'calculateDeadline 구현' },
      { tier: 'P1', rank: 3, title: 'business_yas_installment_amount rule 추가' },
      { tier: 'P1', rank: 4, title: 'employee_yas_installment fact/rule 추가' },
      { tier: 'P1', rank: 5, title: '비과세 계산기 또는 급여항목 검증 엔진 추가' },
      { tier: 'P1', rank: 6, title: '검색 인덱스 확장' },
      { tier: 'P2', rank: 1, title: 'GitHub Actions CI 추가' },
      { tier: 'P2', rank: 2, title: 'PR 템플릿 추가' },
      { tier: 'P2', rank: 3, title: 'fact ID 발급 스크립트' },
    ])
  })

  it('separates completed, partial, blocked, and planned work without hiding blockers', () => {
    const p0 = getImplementationPrioritiesByTier('P0')
    expect(p0[0]).toMatchObject({ title: 'implementationStatus 기본값 변경', status: 'done' })
    expect(p0[1]).toMatchObject({ title: 'critical/high fact 검증 강화', status: 'done' })
    expect(p0[2]).toMatchObject({ title: 'rule engine에 monthly-cap, date-rule, custom 구현', status: 'done' })

    expect(
      IMPLEMENTATION_PRIORITIES.filter((item) => item.status === 'partial').map((item) => item.id)
    ).toEqual(['github-actions-ci'])
  })

  it('summarizes status counts for the operations queue', () => {
    expect(getImplementationPrioritySummary()).toEqual({
      total: 16,
      done: 15,
      partial: 1,
      blocked: 0,
      planned: 0,
    })
  })
})
