export type ImplementationPriorityTier = 'P0' | 'P1' | 'P2'
export type ImplementationPriorityStatus = 'done' | 'partial' | 'blocked' | 'planned'

export type ImplementationPriority = {
  id: string
  tier: ImplementationPriorityTier
  rank: number
  title: string
  status: ImplementationPriorityStatus
  note: string
  evidence: string
}

export const IMPLEMENTATION_PRIORITY_STATUS_LABELS: Record<ImplementationPriorityStatus, string> = {
  done: '완료',
  partial: '부분 완료',
  blocked: '차단',
  planned: '계획',
}

export const IMPLEMENTATION_PRIORITIES: ImplementationPriority[] = [
  {
    id: 'implementation-status-default',
    tier: 'P0',
    rank: 1,
    title: 'implementationStatus 기본값 변경',
    status: 'done',
    note: '신규 fact를 낙관적으로 content_done 처리하지 않도록 기본값을 not_started로 둔다.',
    evidence: 'lib/facts/schema.ts, test/sources.test.ts',
  },
  {
    id: 'fact-verification-gate',
    tier: 'P0',
    rank: 2,
    title: 'critical/high fact 검증 강화',
    status: 'done',
    note: 'high/critical 또는 계산/신고 영향 fact는 primarySourceVerified, sourceIds, lawRef, lawUrl을 함께 요구한다.',
    evidence: 'scripts/check-fact-confidence.mjs, test/fact-confidence-script.test.mjs',
  },
  {
    id: 'rule-engine-formula-types',
    tier: 'P0',
    rank: 3,
    title: 'rule engine에 monthly-cap, date-rule, custom 구현',
    status: 'done',
    note: '비과세 한도, 제출기한, 수동검토 custom rule을 계산 엔진에서 분기 처리한다.',
    evidence: 'lib/rules/engine.ts, test/rules-engine.test.ts',
  },
  {
    id: 'local-income-tax-example',
    tier: 'P0',
    rank: 4,
    title: 'local-income-tax.json example 수정',
    status: 'done',
    note: '지방소득세 rule은 grossPayment가 아니라 nationalTax를 입력으로 받는다.',
    evidence: 'content/tax-rules/2026/local-income-tax.json, test/rules-engine.test.ts',
  },
  {
    id: 'qa-new-routes-exit-code',
    tier: 'P0',
    rank: 5,
    title: 'qa-new-routes.mjs 실패 시 exit 1',
    status: 'done',
    note: '신규 route QA 실패를 structured error와 non-zero exit로 CI에서 잡을 수 있게 했다.',
    evidence: 'scripts/qa-new-routes.mjs, test/qa-gate.test.mjs',
  },
  {
    id: 'freshness-critical-order',
    tier: 'P0',
    rank: 6,
    title: 'fact-freshness.mjs riskOrder에 critical 추가',
    status: 'done',
    note: 'critical fact가 high보다 먼저 정렬되도록 risk order에 포함했다.',
    evidence: 'scripts/fact-freshness.mjs, test/fact-freshness.test.mjs',
  },
  {
    id: 'treaty-limited-rate-filing',
    tier: 'P0',
    rank: 7,
    title: '법인세법 §98조의6 제한세율 제출의무 확인',
    status: 'done',
    note: '비거주자 지급 체크리스트에 제한세율 신청서 제출 상태와 기한 경고를 반영했다.',
    evidence: 'lib/nonresident-payment/checklist.ts, test/nonresident-payment-check.test.tsx',
  },
  {
    id: 'screen-specs-json',
    tier: 'P1',
    rank: 1,
    title: 'screen-specs JSON 분리',
    status: 'done',
    note: '전체 업무 객체 화면 가이드를 content/screen-specs JSON registry에서 조회한다.',
    evidence: 'content/screen-specs/*.json, lib/screen-guides.ts, test/screen-guide-spec.test.tsx',
  },
  {
    id: 'calculate-deadline',
    tier: 'P1',
    rank: 2,
    title: 'calculateDeadline 구현',
    status: 'done',
    note: '월별, 반기, 과세연도, 기간형 기한과 주말 조정, 리마인더 날짜를 산출한다.',
    evidence: 'lib/rules/engine.ts, test/deadline-calculator.test.tsx',
  },
  {
    id: 'business-yas-installment-amount',
    tier: 'P1',
    rank: 3,
    title: 'business_yas_installment_amount rule 추가',
    status: 'done',
    note: '사업소득 연말정산 추가납부세액 분납 금액을 tax-rule JSON과 dispatcher에서 자동 계산한다.',
    evidence: 'content/tax-rules/2026/year-end-settlement.json, lib/rules/engine.ts, test/rules-engine.test.ts',
  },
  {
    id: 'employee-yas-installment',
    tier: 'P1',
    rank: 4,
    title: 'employee_yas_installment fact/rule 추가',
    status: 'done',
    note: '근로소득 연말정산 추가세액 분납 fact와 스케줄 산출을 연결했다.',
    evidence: 'content/facts.json, lib/year-end/installment.ts, test/year-end-installment-fact.test.ts',
  },
  {
    id: 'non-taxable-cap-engine',
    tier: 'P1',
    rank: 5,
    title: '비과세 계산기 또는 급여항목 검증 엔진 추가',
    status: 'done',
    note: '식대, 보육수당, 자가운전보조금, 국외근로소득 한도 검산 도구를 제공한다.',
    evidence: 'components/calculators/NonTaxableCapCalculator.tsx, test/non-taxable-cap.test.tsx',
  },
  {
    id: 'search-index-expansion',
    tier: 'P1',
    rank: 6,
    title: '검색 인덱스 확장',
    status: 'done',
    note: 'chapters 외 facts, tax-rules, screen-guides, sources, watchlist를 검색 문서로 포함한다.',
    evidence: 'scripts/gen-search-index.mjs, test/search-index-content.test.ts',
  },
  {
    id: 'github-actions-ci',
    tier: 'P2',
    rank: 1,
    title: 'GitHub Actions CI 추가',
    status: 'partial',
    note: '기본 GitHub Actions는 있으나 평가서가 요구한 typecheck, freshness, strict links 단계까지는 아직 확장 전이다.',
    evidence: '.github/workflows/quality-gate.yml',
  },
  {
    id: 'pull-request-template',
    tier: 'P2',
    rank: 2,
    title: 'PR 템플릿 추가',
    status: 'done',
    note: 'fact, rule, 화면 가이드, 계산 영향, 출처 확인 체크리스트를 PR에 포함한다.',
    evidence: '.github/pull_request_template.md',
  },
  {
    id: 'fact-id-generator',
    tier: 'P2',
    rank: 3,
    title: 'fact ID 발급 스크립트',
    status: 'done',
    note: '기존 prefix 숫자 폭을 보존해 다음 fact ID를 출력하는 read-only CLI를 제공한다.',
    evidence: 'scripts/new-fact-id.mjs, test/fact-id-generator.test.mjs',
  },
]

export function getImplementationPrioritiesByTier(tier: ImplementationPriorityTier): ImplementationPriority[] {
  return IMPLEMENTATION_PRIORITIES.filter((item) => item.tier === tier)
}

export function getImplementationPrioritySummary() {
  return IMPLEMENTATION_PRIORITIES.reduce(
    (summary, item) => {
      summary.total += 1
      summary[item.status] += 1
      return summary
    },
    { total: 0, done: 0, partial: 0, blocked: 0, planned: 0 }
  )
}
