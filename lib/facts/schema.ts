import { z } from 'zod'

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
const ymdOrEmpty = z.union([ymd, z.literal('')])

export const SourceType = z.enum(['LAW', 'EDICT', 'INTERPRETATION', 'NTS', 'BOOK', 'LECTURE', 'CASE'])
export const VerifyStatus = z.enum(['확정', '확인필요', '강의기반'])
export const ChangeType = z.enum(['신설', '개정', '폐지', '없음'])
export const Risk = z.enum(['high', 'medium', 'low'])

export const FactSchema = z.object({
  id: z.string().regex(/^f_[a-z0-9]{6}$/, 'f_ + 6 hex/alnum'),
  slug: z.string().min(1),
  chapter: z.string().regex(/^ch\d+$/),
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
  confidenceScore: z.number().min(0).max(100).default(0),
  subordinateLawRef: z.string().default(''),
  scopeLimitations: z.string().default(''),
  localTaxRef: z.string().default(''),
  supersededRefs: z.string().default(''),
  appliesFrom: ymdOrEmpty.default(''),
  sunsetDate: z.string().default(''),
  reviewerId: z.string().default(''),
})

export type Fact = z.infer<typeof FactSchema>
export const FactsFileSchema = z.array(FactSchema)
