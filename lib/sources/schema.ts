import { z } from 'zod'

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')

/** 출처 유형 — facts.json의 sourceType보다 세분화(서식·회계법인 보고서 포함) */
export const SourceRecordType = z.enum([
  'LAW',                // 법률
  'ENFORCEMENT_DECREE', // 시행령
  'ENFORCEMENT_RULE',   // 시행규칙
  'NTS_GUIDE',          // 국세청 안내
  'NTS_FORM',           // 국세청/홈택스 서식
  'TAX_RULING',         // 예규·해석
  'CASE',               // 판례
  'TAX_FIRM_REPORT',    // 회계법인·세무사회 보고서
  'BOOK',
  'LECTURE',
  'API',                // 공공 API (국가법령정보 공동활용 등)
])

/** 신뢰도: primary(법령 원문) > official-guide(국세청 안내) > secondary(2차 자료) */
export const Reliability = z.enum(['primary', 'official-guide', 'secondary'])

export const SourceRecordSchema = z.object({
  id: z.string().regex(/^src_[a-z0-9_]+$/, 'src_ + snake_case'),
  type: SourceRecordType,
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string(),
  publishedAt: ymd.optional(),
  accessedAt: ymd,
  jurisdiction: z.literal('KR').default('KR'),
  reliability: Reliability,
  notes: z.string().default(''),
})

export type SourceRecord = z.infer<typeof SourceRecordSchema>
export const SourcesFileSchema = z.array(SourceRecordSchema)
