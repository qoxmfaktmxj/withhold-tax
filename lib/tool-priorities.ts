export type ToolPriorityTier = 'P0' | 'P1'
export type ToolPriorityStatus = 'available' | 'planned'

export type ToolPriority = {
  id: string
  tier: ToolPriorityTier
  rank: number
  title: string
  route: string | null
  status: ToolPriorityStatus
  summary: string
}
export type AvailableToolPriority = ToolPriority & { status: 'available'; route: string }

export const TOOL_PRIORITIES: ToolPriority[] = [
  {
    id: 'late-payment-risk',
    tier: 'P0',
    rank: 1,
    title: '원천세 미납·가산세 리스크 진단',
    route: '/tools/late-payment-penalty',
    status: 'available',
    summary: '미납세액·기한·납부일 입력 → 가산세 리스크와 2026.7.1 이후 수동검토 분기 확인',
  },
  {
    id: 'monthly-withholding-check',
    tier: 'P0',
    rank: 2,
    title: '월 급여 원천징수 검산기',
    route: '/tools/monthly-withholding',
    status: 'available',
    summary: '홈택스 간이세액표 조회값과 회사 원천징수액을 비교해 월 급여 소득세·지방소득세 차이 검산',
  },
  {
    id: 'non-taxable-cap',
    tier: 'P0',
    rank: 3,
    title: '비과세 급여 한도 검산기',
    route: '/tools/non-taxable-cap',
    status: 'available',
    summary: '식대, 보육수당, 자가운전보조금, 국외근로소득 등 월별·기간별 한도 검산',
  },
  {
    id: 'filing-deadline',
    tier: 'P0',
    rank: 4,
    title: '신고·제출기한 계산기',
    route: '/tools/filing-deadline',
    status: 'available',
    summary: '지급일, 반기별 납부 승인 여부, 신고유형에 따른 제출기한 산출',
  },
  {
    id: 'nonresident-payment-check',
    tier: 'P0',
    rank: 5,
    title: '비거주자 지급 체크리스트',
    route: '/tools/nonresident-payment-check',
    status: 'available',
    summary: '조세조약, 제한세율 신청서, 거주자증명서, 제출기한, 첨부서류 확인',
  },
  {
    id: 'salary-net-pay',
    tier: 'P1',
    rank: 6,
    title: '연봉·실수령액 계산기',
    route: '/tools/salary-net-pay',
    status: 'available',
    summary: '급여명세서 공제액을 입력해 월 실수령액, 연 실수령액, 공제율 검산',
  },
  {
    id: 'year-end-installment',
    tier: 'P1',
    rank: 7,
    title: '연말정산 추가세액 분납 스케줄러',
    route: '/tools/year-end-installment',
    status: 'available',
    summary: '추가납부세액이 10만원을 초과할 때 2월부터 4월까지 지급월별 분납 스케줄 산출',
  },
  {
    id: 'statement-penalty',
    tier: 'P1',
    rank: 8,
    title: '지급명세서·간이지급명세서 가산세 계산기',
    route: '/tools/statement-penalty',
    status: 'available',
    summary: '지급명세서 제출 지연·누락 리스크와 가산세 검산',
  },
  {
    id: 'retirement-tax-check',
    tier: 'P1',
    rank: 9,
    title: '퇴직소득세 검산기',
    route: '/tools/retirement-tax',
    status: 'available',
    summary: '공식 산출 퇴직소득세와 실제 원천징수 소득세·지방소득세 차이 검산',
  },
  {
    id: 'daily-worker-tax',
    tier: 'P0',
    rank: 10,
    title: '일용근로 원천징수 세액 계산기',
    route: '/tools/daily-worker-tax',
    status: 'available',
    summary: '일당·근무일수 입력 → 일용근로 소득세·지방소득세, 소액부징수(1,000원 미만) 판정',
  },
  {
    id: 'employee-local-tax',
    tier: 'P0',
    rank: 11,
    title: '종업원분 주민세 계산기',
    route: '/tools/employee-local-tax',
    status: 'available',
    summary: '면세점(월평균 1.5억) 판정 → 과세표준 → 2026 신설 공제(장기근속·육아휴직 대체인력) 반영 세액',
  },
  {
    id: 'executive-severance-limit',
    tier: 'P1',
    rank: 12,
    title: '임원퇴직금 한도 계산기',
    route: '/tools/executive-severance-limit',
    status: 'available',
    summary: '2019 이전 3배수·2020 이후 2배수 구간별 한도와 한도 초과분(근로소득 전환액) 산출',
  },
  {
    id: 'reverse-net-pay',
    tier: 'P1',
    rank: 13,
    title: '세후→세전 역산 계산기',
    route: '/tools/reverse-net-pay',
    status: 'available',
    summary: '희망 월 실수령액 입력 → 필요 세전 급여 역산(연 환산 근사, 4대보험·소득세 공제 체인)',
  },
]

export function getToolPriority(id: string) {
  return TOOL_PRIORITIES.find((tool) => tool.id === id)
}

export function isAvailableToolPriority(
  tool: ToolPriority
): tool is AvailableToolPriority {
  return tool.status === 'available' && typeof tool.route === 'string'
}

export const AVAILABLE_TOOL_PRIORITIES: AvailableToolPriority[] = TOOL_PRIORITIES.filter(isAvailableToolPriority)
