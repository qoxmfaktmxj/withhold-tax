import { describe, expect, it } from 'vitest'
import { TOOL_PRIORITIES, getToolPriority } from '@/lib/tool-priorities'

describe('tool priorities', () => {
  it('keeps the evaluated P0 and P1 order', () => {
    expect(
      TOOL_PRIORITIES.map(({ tier, rank, title }) => ({ tier, rank, title }))
    ).toEqual([
      { tier: 'P0', rank: 1, title: '원천세 미납·가산세 리스크 진단' },
      { tier: 'P0', rank: 2, title: '월 급여 원천징수 검산기' },
      { tier: 'P0', rank: 3, title: '비과세 급여 한도 검산기' },
      { tier: 'P0', rank: 4, title: '신고·제출기한 계산기' },
      { tier: 'P0', rank: 5, title: '비거주자 지급 체크리스트' },
      { tier: 'P1', rank: 6, title: '연봉·실수령액 계산기' },
      { tier: 'P1', rank: 7, title: '연말정산 추가세액 분납 스케줄러' },
      { tier: 'P1', rank: 8, title: '지급명세서·간이지급명세서 가산세 계산기' },
      { tier: 'P1', rank: 9, title: '퇴직소득세 검산기' },
      { tier: 'P0', rank: 10, title: '일용근로 원천징수 세액 계산기' },
      { tier: 'P0', rank: 11, title: '종업원분 주민세 계산기' },
      { tier: 'P1', rank: 12, title: '임원퇴직금 한도 계산기' },
      { tier: 'P1', rank: 13, title: '세후→세전 역산 계산기' },
    ])
  })

  it('marks implemented tools as available in priority order', () => {
    expect(TOOL_PRIORITIES.filter((tool) => tool.status === 'available')).toEqual([
      expect.objectContaining({
        id: 'late-payment-risk',
        route: '/tools/late-payment-penalty',
      }),
      expect.objectContaining({
        id: 'monthly-withholding-check',
        route: '/tools/monthly-withholding',
      }),
      expect.objectContaining({
        id: 'non-taxable-cap',
        route: '/tools/non-taxable-cap',
      }),
      expect.objectContaining({
        id: 'filing-deadline',
        route: '/tools/filing-deadline',
      }),
      expect.objectContaining({
        id: 'nonresident-payment-check',
        route: '/tools/nonresident-payment-check',
      }),
      expect.objectContaining({
        id: 'salary-net-pay',
        route: '/tools/salary-net-pay',
      }),
      expect.objectContaining({
        id: 'year-end-installment',
        route: '/tools/year-end-installment',
      }),
      expect.objectContaining({
        id: 'statement-penalty',
        route: '/tools/statement-penalty',
      }),
      expect.objectContaining({
        id: 'retirement-tax-check',
        route: '/tools/retirement-tax',
      }),
      expect.objectContaining({
        id: 'daily-worker-tax',
        route: '/tools/daily-worker-tax',
      }),
      expect.objectContaining({
        id: 'employee-local-tax',
        route: '/tools/employee-local-tax',
      }),
      expect.objectContaining({
        id: 'executive-severance-limit',
        route: '/tools/executive-severance-limit',
      }),
      expect.objectContaining({
        id: 'reverse-net-pay',
        route: '/tools/reverse-net-pay',
      }),
    ])

    expect(getToolPriority('business-income-3-3')).toBeUndefined()
  })
})
