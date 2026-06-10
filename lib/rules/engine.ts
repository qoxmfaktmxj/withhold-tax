import { RulesFileSchema, type TaxRule, type TaxRuleSchema } from './schema'
import type { z } from 'zod'

export function loadRules(raw: unknown): TaxRule[] {
  return RulesFileSchema.parse(raw)
}

/** 적용일(귀속/지급일)에 유효한 rule 버전 선택: effectiveFrom ≤ date ≤ effectiveTo */
export function pickRule(rules: TaxRule[], ruleId: string, date: string): TaxRule | undefined {
  return rules
    .filter((r) => r.ruleId === ruleId)
    .filter((r) => r.effectiveFrom <= date && (!r.effectiveTo || date <= r.effectiveTo))
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]
}

type Rounding = z.infer<typeof TaxRuleSchema.shape.rounding>

export function applyRounding(value: number, rounding: Rounding | undefined): number {
  if (!rounding) return value
  const { base, method } = rounding
  const q = value / base
  const n = method === 'floor' ? Math.floor(q) : method === 'ceil' ? Math.ceil(q) : Math.round(q)
  return n * base
}

export interface RateResult {
  nationalTax: number
  localTax: number
  total: number
}

/**
 * rate / rate-with-local 계산.
 * 국세 = 지급액 × rate, 지방소득세 = 국세 × localRate(보통 10%).
 * 각 세액에 rounding(보통 10원 미만 절사) 적용. 국세·지방세는 절대 합산 계산하지 않고 분리.
 */
export function applyRateRule(rule: TaxRule, input: Record<string, number>): RateResult {
  const amount = input.grossPayment ?? input.amount ?? 0
  const rate = Number(rule.formula.params.rate ?? 0)
  const localRate = rule.formula.type === 'rate-with-local' ? Number(rule.formula.params.localRate ?? 0.1) : 0

  const nationalTax = applyRounding(amount * rate, rule.rounding)
  const localTax = applyRounding(nationalTax * localRate, rule.rounding)
  return { nationalTax, localTax, total: nationalTax + localTax }
}

export interface PenaltyResult {
  basePenalty: number   // 미납세액 × 3%
  dailyPenalty: number  // 미납세액 × 일수 × 22/100,000
  rawTotal: number      // 한도 적용 전
  capApplied: boolean   // 10% 내부한도 도달 여부
  total: number         // 한도 적용 후
  capAmount: number     // 내부한도 금액(미납세액×10%)
}

/**
 * 원천징수 등 납부지연가산세(국기법 §47조의5, 2026.6.30까지 산식):
 *   MIN( 미납세액×3% + 미납세액×일수×dailyRate, 미납세액×10% )  — 전체 50% 한도 별도.
 * 2026.7.1 이후분(월할·독촉비용)은 rule 버전(f_c40017)으로 분기하되 동일 함수에
 * 일할 근사치를 적용하고 경고 문구를 함께 표시하는 것을 전제로 한다(정밀 월할은 고지서 기준).
 */
export function withholdingLatePenalty(
  rule: TaxRule,
  input: { unpaidTax: number; daysLate: number }
): PenaltyResult {
  const { unpaidTax, daysLate } = input
  const baseRate = Number(rule.formula.params.baseRate ?? 0.03)
  const dailyRate = Number(rule.formula.params.dailyRate ?? 0.00022)
  const innerCap = Number(rule.formula.params.innerCap ?? 0.1)

  if (daysLate <= 0 || unpaidTax <= 0) {
    return { basePenalty: 0, dailyPenalty: 0, rawTotal: 0, capApplied: false, total: 0, capAmount: 0 }
  }

  const basePenalty = unpaidTax * baseRate
  const dailyPenalty = unpaidTax * daysLate * dailyRate
  const rawTotal = basePenalty + dailyPenalty
  const capAmount = unpaidTax * innerCap
  const capApplied = rawTotal > capAmount
  return {
    basePenalty: Math.round(basePenalty),
    dailyPenalty: Math.round(dailyPenalty),
    rawTotal: Math.round(rawTotal),
    capApplied,
    total: Math.round(capApplied ? capAmount : rawTotal),
    capAmount: Math.round(capAmount),
  }
}
