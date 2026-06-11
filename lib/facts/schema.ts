import { z } from 'zod'

const ymd = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
  .refine((s) => {
    const d = new Date(s + 'T00:00:00Z')
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
  }, '유효한 날짜가 아님')
const ymdOrEmpty = z.union([ymd, z.literal('')])

export const SourceType = z.enum(['LAW', 'EDICT', 'INTERPRETATION', 'NTS', 'BOOK', 'LECTURE', 'CASE'])
export const VerifyStatus = z.enum(['확정', '확인필요', '강의기반'])
export const ChangeType = z.enum(['신설', '개정', '폐지', '없음', '유예'])
export const Risk = z.enum(['critical', 'high', 'medium', 'low'])
export const IncomeType = z.enum([
  'all',
  'earned',
  'daily_worker',
  'business',
  'other',
  'retirement',
  'pension',
  'interest',
  'dividend',
  'interest_dividend',
  'nonresident',
  'foreign_corporation',
  'local_income_tax',
])

/** 레퍼런스 내 구현 진행 단계 (콘텐츠→rule→화면가이드→테스트) */
export const ImplementationStatus = z.enum([
  'not_started', 'content_done', 'rule_done', 'screen_spec_done', 'tests_done', 'released',
])

/** 이 fact 변경이 HR 제품에 미치는 영향 영역 */
export const ImplementationImpact = z.object({
  content: z.boolean().default(true),
  ui: z.boolean().default(false),
  calculation: z.boolean().default(false),
  reporting: z.boolean().default(false),
  migration: z.boolean().default(false),
})

export const FactSchema = z.object({
  id: z.string().regex(/^f_[a-z0-9]{6}$/, 'f_ + 6 lowercase alphanumeric'),
  slug: z.string().min(1),
  title: z.string().default(''),
  chapter: z.string().regex(/^[a-z][a-z0-9-]*$/),
  claim: z.string().min(1),
  sourceType: SourceType,
  sourceTitle: z.string(),
  lawRef: z.string(),
  lawUrl: z.string(),
  asOf: ymd,
  effectiveDate: ymdOrEmpty,
  verifyStatus: VerifyStatus,
  risk: Risk,
  changeType: ChangeType,
  previousValue: z.string(),
  history: z.array(z.object({ date: ymd, author: z.string(), note: z.string() })).min(1),
  nextReviewBy: ymdOrEmpty,
  // --- 파일럿 도출 갭 필드 (기본값으로 하위호환) ---
  primarySourceVerified: z.boolean().default(false),
  confidenceScore: z.number().int().min(0).max(100).default(0),
  subordinateLawRef: z.string().default(''),
  scopeLimitations: z.string().default(''),
  localTaxRef: z.string().default(''),
  supersededRefs: z.string().default(''),
  appliesFrom: ymdOrEmpty.default(''),
  sunsetDate: z.string().default(''), // 자유텍스트: '부칙 확인' 등 허용
  reviewerId: z.string().default(''),
  // --- 사내 레퍼런스 고도화 필드 (2026-06-10, 전부 기본값 = 하위호환) ---
  sourceIds: z.array(z.string().regex(/^src_[a-z0-9_]+$/)).default([]), // content/sources.json 참조
  incomeType: IncomeType.default('all'),
  appliesTo: z.string().default(''),  // 적용대상 서술 (예: '2026.1.1 이후 연말정산분')
  implementationStatus: ImplementationStatus.default('not_started'),
  implementationImpact: ImplementationImpact.default({
    content: true, ui: false, calculation: false, reporting: false, migration: false,
  }),
})

export type Fact = z.infer<typeof FactSchema>
export type IncomeTypeValue = z.infer<typeof IncomeType>
export const FactsFileSchema = z.array(FactSchema)
