import { z } from 'zod'
import { IncomeType } from '@/lib/facts/schema'

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')

/**
 * 계산 가능한 세무 규칙. MDX(설명)·facts(근거)와 분리된 기계용 데이터.
 * - formula.expression 은 사람용 문서. 실제 계산은 formula.type + params 로 수행.
 * - 모든 rule 은 factIds 로 근거 fact 에 연결되어야 한다.
 */
export const RuleInput = z.object({
  key: z.string().min(1),
  type: z.enum(['number', 'string', 'date', 'boolean', 'enum']),
  required: z.boolean(),
  description: z.string(),
})

export const RuleFormula = z.object({
  type: z.enum([
    'rate',
    'rate-with-local',
    'penalty-late-wht',
    'monthly-cap',
    'date-rule',
    'year-end-installment-amount',
    'custom',
  ]),
  expression: z.string(), // 사람용 산식 설명
  params: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
})

export const RuleRounding = z.object({
  base: z.number().int().positive(), // 예: 10 → 10원 미만 절사
  method: z.enum(['floor', 'round', 'ceil']),
})

export const RuleExample = z.object({
  title: z.string(),
  input: z.record(z.string(), z.unknown()),
  expected: z.record(z.string(), z.unknown()),
})

export const TaxRuleSchema = z.object({
  ruleId: z.string().regex(/^[a-z0-9_]+$/),
  version: z.string(),
  calendarYear: z.number().int(),
  name: z.string().min(1),
  domain: z.string().min(1), // withholding-rate | penalty | deadline | non-taxable | local-income-tax
  incomeType: IncomeType,
  effectiveFrom: ymd,
  effectiveTo: ymd.optional(), // 없으면 계속 유효
  factIds: z.array(z.string()).min(1),
  inputs: z.array(RuleInput).default([]),
  formula: RuleFormula,
  rounding: RuleRounding.optional(),
  calculationMode: z.enum(['automatic', 'manual-review']).default('automatic'),
  examples: z.array(RuleExample).default([]),
  warnings: z.array(z.string()).default([]),
})

export type TaxRule = z.infer<typeof TaxRuleSchema>
export const RulesFileSchema = z.array(TaxRuleSchema)
