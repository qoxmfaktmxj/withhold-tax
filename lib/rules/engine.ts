import { RulesFileSchema, type TaxRule, type TaxRuleSchema } from './schema'
import type { z } from 'zod'
import {
  calculateYearEndInstallmentSchedule,
  type YearEndInstallmentSchedule,
  type YearEndSettlementIncomeType,
} from '../year-end/installment'

export function loadRules(raw: unknown): TaxRule[] {
  const rules = RulesFileSchema.parse(raw)
  for (const rule of rules) {
    if (rule.formula.type === 'custom' && rule.calculationMode !== 'manual-review') {
      throw new Error(`custom rule ${rule.ruleId} must use calculationMode=manual-review`)
    }
    if (rule.calculationMode !== 'manual-review' && rule.examples.length === 0) {
      throw new Error(`automatic rule ${rule.ruleId} must include at least one example`)
    }
  }
  return rules
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

export function canAutoCalculate(rule: TaxRule): boolean {
  return rule.calculationMode !== 'manual-review'
}

export interface RateResult {
  nationalTax: number
  localTax: number
  total: number
}

export interface LocalIncomeTaxResult {
  localTax: number
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

export function applyLocalIncomeTaxRule(rule: TaxRule, input: Record<string, number>): LocalIncomeTaxResult {
  const nationalTax = input.nationalTax ?? 0
  const rate = Number(rule.formula.params.rate ?? 0.1)
  return { localTax: applyRounding(nationalTax * rate, rule.rounding) }
}

export interface PenaltyResult {
  basePenalty: number   // 미납세액 × 3%
  dailyPenalty: number  // preNoticeDailyPenalty alias
  preNoticeDailyPenalty: number
  postDesignatedMonthlyPenalty: number
  demandCost: number
  rawTotal: number      // 한도 적용 전
  capApplied: boolean   // 10% 내부한도 도달 여부
  total: number         // 한도 적용 후
  capAmount: number     // 내부한도 금액(미납세액×10%)
  innerCapAmount: number
  outerCapAmount: number
  manualReviewRequired: boolean
}

export interface WithholdingLatePenaltyInput {
  unpaidTax: number
  daysLate?: number
  legalDueDate?: string
  noticeDate?: string
  designatedDueDate?: string
  paymentDate?: string
  postDesignatedMonths?: number
  demandCost?: number
}

export interface MonthlyCapResult {
  monthlyCap: number
  periodCap: number
  grossAmount: number
  nonTaxableAmount: number
  taxableAmount: number
  excessAmount: number
}

export type DeadlineAdjustmentReason = 'weekend' | 'holiday' | 'none'

export interface ReminderDates {
  d30: string
  d7: string
  d1: string
}

export interface DeadlineResult {
  ruleId: string
  ruleVersion: string
  dueDate: string
  adjustedDueDate: string
  adjustmentReason: DeadlineAdjustmentReason
  reminderDates: ReminderDates
  basis: string
  periodLabel?: string
  warnings: string[]
}

export type PaymentStatementType = 'annual' | 'simplified'
export type PaymentStatementSubmissionStatus = 'missing' | 'late'
export type CompanySize = 'general' | 'sme'

export interface PaymentStatementPenaltyInput {
  amount: number
  statementType: PaymentStatementType
  submissionStatus: PaymentStatementSubmissionStatus
  companySize: CompanySize
}

export interface PaymentStatementPenaltyResult {
  ruleId: string
  ruleVersion: string
  statementType: PaymentStatementType
  submissionStatus: PaymentStatementSubmissionStatus
  companySize: CompanySize
  rate: number
  rawPenalty: number
  capAmount: number
  capApplied: boolean
  total: number
  factIds: string[]
}

export type RuleCalculationResult =
  | ({ type: 'rate'; ruleId: string; version: string } & RateResult)
  | ({ type: 'local-income-tax'; ruleId: string; version: string } & LocalIncomeTaxResult)
  | ({
      type: 'monthly-cap'
      ruleId: string
      version: string
      capAmount: number
    } & MonthlyCapResult)
  | ({
      type: 'date-rule'
      ruleId: string
      version: string
      dueDate: string
      adjustedDueDate: string
      isHolidayAdjusted: boolean
      warnings: string[]
    })
  | ({
      type: 'year-end-installment-amount'
      ruleId: string
      version: string
    } & YearEndInstallmentSchedule)
  | { type: 'manual-review'; ruleId: string; version: string; message: string }
  | ({ type: 'custom'; customType: 'payment-statement-penalty'; ruleId: string; version: string } & PaymentStatementPenaltyResult)

function parseYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) throw new Error(`Invalid date: ${value}`)
  return { year, month, day }
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function toUtcDate(value: string): Date {
  const { year, month, day } = parseYmd(value)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatUtcDate(date: Date): string {
  return formatYmd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

function addDays(value: string, offsetDays: number): string {
  const date = toUtcDate(value)
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return formatUtcDate(date)
}

function daysBetweenYmd(start: string, end: string): number {
  const ms = toUtcDate(end).getTime() - toUtcDate(start).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

function elapsedWholeMonths(start: string, end: string): number {
  const a = parseYmd(start)
  const b = parseYmd(end)
  let months = (b.year - a.year) * 12 + b.month - a.month
  if (b.day < a.day) months -= 1
  return Math.max(0, months)
}

function addMonths(year: number, month: number, offsetMonths: number) {
  const index = year * 12 + (month - 1) + offsetMonths
  return {
    year: Math.floor(index / 12),
    month: (index % 12) + 1,
  }
}

function resolveDay(year: number, month: number, day: number): number {
  return day === 99 ? lastDayOfMonth(year, month) : day
}

function adjustWeekend(dueDate: string): Pick<DeadlineResult, 'adjustedDueDate' | 'adjustmentReason'> {
  const day = toUtcDate(dueDate).getUTCDay()
  if (day === 6) return { adjustedDueDate: addDays(dueDate, 2), adjustmentReason: 'weekend' }
  if (day === 0) return { adjustedDueDate: addDays(dueDate, 1), adjustmentReason: 'weekend' }
  return { adjustedDueDate: dueDate, adjustmentReason: 'none' }
}

function withDeadlineSchedule(result: Omit<DeadlineResult, 'adjustedDueDate' | 'adjustmentReason' | 'reminderDates'>): DeadlineResult {
  const adjusted = adjustWeekend(result.dueDate)
  return {
    ...result,
    ...adjusted,
    reminderDates: {
      d30: addDays(adjusted.adjustedDueDate, -30),
      d7: addDays(adjusted.adjustedDueDate, -7),
      d1: addDays(adjusted.adjustedDueDate, -1),
    },
  }
}

export function calculateDeadline(rule: TaxRule, input: Record<string, unknown>): DeadlineResult {
  if (rule.formula.type !== 'date-rule') {
    throw new Error(`Rule ${rule.ruleId} is not a date-rule`)
  }

  const params = rule.formula.params
  const basis = String(params.basis)
  const paymentDate = String(input.paymentDate ?? input.baseDate ?? '')
  const parsedPaymentDate = paymentDate ? parseYmd(paymentDate) : undefined
  const half = input.half === 'H1' || input.half === 'H2' ? input.half : undefined
  const taxYear = Number(input.taxYear ?? parsedPaymentDate?.year)
  if (!taxYear) throw new Error(`Rule ${rule.ruleId} requires paymentDate or taxYear`)

  if (basis === 'payment_month') {
    if (!parsedPaymentDate) throw new Error(`Rule ${rule.ruleId} requires paymentDate`)
    const target = addMonths(parsedPaymentDate.year, parsedPaymentDate.month, Number(params.offsetMonths ?? 0))
    const day = resolveDay(target.year, target.month, Number(params.day ?? 1))
    return withDeadlineSchedule({
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      dueDate: formatYmd(target.year, target.month, day),
      basis,
      warnings: rule.warnings,
    })
  }

  if (basis === 'tax_year') {
    const month = Number(params.month)
    const day = resolveDay(taxYear + 1, month, Number(params.day ?? 1))
    return withDeadlineSchedule({
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      dueDate: formatYmd(taxYear + 1, month, day),
      basis,
      warnings: rule.warnings,
    })
  }

  if (basis === 'half_year') {
    if (!parsedPaymentDate && !half) throw new Error(`Rule ${rule.ruleId} requires paymentDate or half`)
    const isFirstHalf = half ? half === 'H1' : parsedPaymentDate!.month <= 6
    return withDeadlineSchedule({
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      dueDate: isFirstHalf ? formatYmd(taxYear, 7, 31) : formatYmd(taxYear + 1, 1, 31),
      basis,
      periodLabel: isFirstHalf ? '상반기 1~6월 지급분' : '하반기 7~12월 지급분',
      warnings: rule.warnings,
    })
  }

  if (basis === 'next_year_months') {
    const toMonth = Number(params.toMonth)
    return withDeadlineSchedule({
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      dueDate: formatYmd(taxYear + 1, toMonth, lastDayOfMonth(taxYear + 1, toMonth)),
      basis,
      periodLabel: `다음 연도 ${params.fromMonth}~${params.toMonth}월`,
      warnings: rule.warnings,
    })
  }

  throw new Error(`Unsupported date-rule basis: ${basis}`)
}

export function applyMonthlyCapRule(rule: TaxRule, input: Record<string, unknown>): MonthlyCapResult {
  if (rule.formula.type !== 'monthly-cap') {
    throw new Error(`Rule ${rule.ruleId} is not a monthly-cap rule`)
  }

  const monthlyAmount = Number(input.monthlyAmount ?? 0)
  const months = Math.max(1, Number(input.months ?? 1) || 1)
  const childrenUnder6 = Math.max(0, Number(input.childrenUnder6 ?? 0) || 0)
  const params = rule.formula.params

  let monthlyCap = Number(params.cap ?? 0)
  if (params.capPerChild !== undefined) {
    monthlyCap = Number(params.capPerChild) * childrenUnder6
  }
  if (params.capSpecial !== undefined && input.isSpecialSite === true) {
    monthlyCap = Number(params.capSpecial)
  }

  const grossAmount = Math.max(0, monthlyAmount * months)
  const periodCap = Math.max(0, monthlyCap * months)
  const nonTaxableAmount = Math.min(grossAmount, periodCap)
  const taxableAmount = Math.max(0, grossAmount - periodCap)

  return {
    monthlyCap,
    periodCap,
    grossAmount,
    nonTaxableAmount,
    taxableAmount,
    excessAmount: taxableAmount,
  }
}

export function applyPaymentStatementPenalty(
  rule: TaxRule,
  input: PaymentStatementPenaltyInput
): PaymentStatementPenaltyResult {
  if (rule.ruleId !== 'payment_statement_penalty') {
    throw new Error(`Rule ${rule.ruleId} is not a payment statement penalty rule`)
  }

  const params = rule.formula.params
  const rate =
    input.statementType === 'simplified'
      ? Number(input.submissionStatus === 'late' ? params.simpleLateRate ?? 0.00125 : params.simpleMissRate ?? 0.0025)
      : Number(input.submissionStatus === 'late' ? params.lateRate ?? 0.005 : params.missRate ?? 0.01)
  const capAmount = Number(input.companySize === 'sme' ? params.smeCap ?? 50_000_000 : params.generalCap ?? 100_000_000)
  const rawPenalty = Math.floor(Math.max(0, input.amount) * rate)
  const capApplied = rawPenalty > capAmount
  const factIds = new Set<string>()

  if (input.statementType === 'simplified') {
    factIds.add('f_c40006')
  } else {
    factIds.add(input.submissionStatus === 'late' ? 'f_c40005' : 'f_c40004')
  }
  factIds.add('f_c40008')

  return {
    ruleId: rule.ruleId,
    ruleVersion: rule.version,
    statementType: input.statementType,
    submissionStatus: input.submissionStatus,
    companySize: input.companySize,
    rate,
    rawPenalty,
    capAmount,
    capApplied,
    total: capApplied ? capAmount : rawPenalty,
    factIds: [...factIds].filter((id) => rule.factIds.includes(id)),
  }
}

function toYearEndSettlementIncomeType(value: unknown): YearEndSettlementIncomeType {
  if (value === 'business' || value === 'earned' || value === 'religious') {
    return value
  }
  return 'religious'
}

export function applyYearEndInstallmentAmountRule(
  rule: TaxRule,
  input: Record<string, unknown>
): YearEndInstallmentSchedule {
  if (rule.formula.type !== 'year-end-installment-amount') {
    throw new Error(`Rule ${rule.ruleId} is not a year-end installment amount rule`)
  }

  const params = rule.formula.params
  return calculateYearEndInstallmentSchedule(
    {
      incomeType: toYearEndSettlementIncomeType(input.incomeType ?? rule.incomeType),
      settlementYear: Number(input.settlementYear ?? input.taxYear),
      additionalTax: Number(input.additionalTax ?? 0),
    },
    {
      threshold: Number(params.threshold ?? 100_000),
      startMonth: Number(params.startMonth ?? 2),
      installmentCount: Number(params.installmentCount ?? 3),
    }
  )
}

/**
 * 원천징수 등 납부지연가산세(국기법 §47조의5, 2026.6.30까지 산식):
 *   MIN( 미납세액×3% + 미납세액×일수×dailyRate, 미납세액×10% )  — 전체 50% 한도 별도.
 * 2026.7.1 이후분(월할·독촉비용)은 rule 버전(f_c40017)으로 분기하되 동일 함수에
 * 일할 근사치를 적용하고 경고 문구를 함께 표시하는 것을 전제로 한다(정밀 월할은 고지서 기준).
 */
export function withholdingLatePenalty(
  rule: TaxRule,
  input: WithholdingLatePenaltyInput
): PenaltyResult {
  const { unpaidTax } = input
  const baseRate = Number(rule.formula.params.baseRate ?? 0.03)
  const dailyRate = Number(rule.formula.params.dailyRate ?? 0.00022)
  const monthlyRate = Number(rule.formula.params.monthlyRate ?? 0.0067)
  const innerCap = Number(rule.formula.params.innerCap ?? 0.1)
  const outerCap = Number(rule.formula.params.outerCap ?? 0.5)
  const smallTaxExemption = Number(rule.formula.params.smallTaxExemption ?? 1_500_000)
  const maxPostDesignatedMonths = Number(rule.formula.params.maxPostDesignatedMonths ?? 60)
  const revisedRule = rule.effectiveFrom >= '2026-07-01' || rule.version >= '2026.7.0'
  const noticeEndDate = input.noticeDate && input.paymentDate && input.noticeDate > input.paymentDate ? input.paymentDate : input.noticeDate
  const daysLate =
    input.legalDueDate && noticeEndDate
      ? daysBetweenYmd(input.legalDueDate, noticeEndDate)
      : input.legalDueDate && input.paymentDate
        ? daysBetweenYmd(input.legalDueDate, input.paymentDate)
        : Math.max(0, Number(input.daysLate ?? 0) || 0)

  if (daysLate <= 0 || unpaidTax <= 0) {
    return {
      basePenalty: 0,
      dailyPenalty: 0,
      preNoticeDailyPenalty: 0,
      postDesignatedMonthlyPenalty: 0,
      demandCost: 0,
      rawTotal: 0,
      capApplied: false,
      total: 0,
      capAmount: 0,
      innerCapAmount: 0,
      outerCapAmount: 0,
      manualReviewRequired: false,
    }
  }

  const basePenalty = Math.round(unpaidTax * baseRate)
  const preNoticeDailyPenalty = Math.round(unpaidTax * daysLate * dailyRate)
  const innerCapAmount = Math.round(unpaidTax * innerCap)
  const outerCapAmount = Math.round(unpaidTax * outerCap)
  const preNoticeSubtotal = basePenalty + preNoticeDailyPenalty
  const innerCappedSubtotal = Math.min(preNoticeSubtotal, innerCapAmount)
  const exemptPostDesignated = unpaidTax < smallTaxExemption
  const postDesignatedMonths =
    revisedRule && input.designatedDueDate && input.paymentDate && input.paymentDate > input.designatedDueDate
      ? Math.min(
          maxPostDesignatedMonths,
          Math.max(0, Number(input.postDesignatedMonths ?? elapsedWholeMonths(input.designatedDueDate, input.paymentDate)) || 0)
        )
      : 0
  const postDesignatedMonthlyPenalty = exemptPostDesignated ? 0 : Math.round(unpaidTax * monthlyRate * postDesignatedMonths)
  const demandCost = revisedRule && !exemptPostDesignated ? Math.max(0, Math.round(Number(input.demandCost ?? 0) || 0)) : 0
  const rawTotal = innerCappedSubtotal + postDesignatedMonthlyPenalty + demandCost
  const total = Math.min(rawTotal, outerCapAmount)
  const capApplied = preNoticeSubtotal > innerCapAmount || rawTotal > outerCapAmount
  return {
    basePenalty,
    dailyPenalty: preNoticeDailyPenalty,
    preNoticeDailyPenalty,
    postDesignatedMonthlyPenalty,
    demandCost,
    rawTotal,
    capApplied,
    total,
    capAmount: innerCapAmount,
    innerCapAmount,
    outerCapAmount,
    manualReviewRequired: revisedRule && Boolean(input.noticeDate || input.designatedDueDate || postDesignatedMonths > 0),
  }
}

function calculateCustomRule(rule: TaxRule, input: Record<string, unknown>): RuleCalculationResult {
  if (rule.ruleId === 'payment_statement_penalty') {
    return {
      type: 'custom',
      customType: 'payment-statement-penalty',
      ...applyPaymentStatementPenalty(rule, input as unknown as PaymentStatementPenaltyInput),
      ruleId: rule.ruleId,
      version: rule.version,
    }
  }

  return {
    type: 'manual-review',
    message: '이 custom rule은 자동 계산 대상이 아닙니다.',
    ruleId: rule.ruleId,
    version: rule.version,
  }
}

export function calculateRule(rule: TaxRule, input: Record<string, unknown>): RuleCalculationResult {
  if (!canAutoCalculate(rule)) {
    return {
      type: 'manual-review',
      message: '이 rule은 자동 계산 대상이 아닙니다.',
      ruleId: rule.ruleId,
      version: rule.version,
    }
  }

  if (rule.domain === 'local-income-tax') {
    return {
      type: 'local-income-tax',
      ...applyLocalIncomeTaxRule(rule, input as Record<string, number>),
      ruleId: rule.ruleId,
      version: rule.version,
    }
  }

  switch (rule.formula.type) {
    case 'rate':
    case 'rate-with-local':
      return {
        type: 'rate',
        ...applyRateRule(rule, input as Record<string, number>),
        ruleId: rule.ruleId,
        version: rule.version,
      }
    case 'monthly-cap': {
      const result = applyMonthlyCapRule(rule, input)
      return {
        type: 'monthly-cap',
        ...result,
        capAmount: result.periodCap,
        ruleId: rule.ruleId,
        version: rule.version,
      }
    }
    case 'date-rule': {
      const result = calculateDeadline(rule, input)
      return {
        type: 'date-rule',
        ruleId: rule.ruleId,
        version: rule.version,
        dueDate: result.dueDate,
        adjustedDueDate: result.adjustedDueDate,
        isHolidayAdjusted: result.adjustmentReason !== 'none',
        warnings: result.warnings,
      }
    }
    case 'year-end-installment-amount':
      return {
        type: 'year-end-installment-amount',
        ...applyYearEndInstallmentAmountRule(rule, input),
        ruleId: rule.ruleId,
        version: rule.version,
      }
    case 'penalty-late-wht':
      return {
        type: 'manual-review',
        message: '납부지연가산세는 전용 계산기를 사용하세요.',
        ruleId: rule.ruleId,
        version: rule.version,
      }
    case 'composite-rates':
      return {
        type: 'manual-review',
        message: '복합 요율 체인(4대보험+소득세 근사)은 전용 계산기(lib/reverse-net-pay)를 사용하세요.',
        ruleId: rule.ruleId,
        version: rule.version,
      }
    case 'custom':
      return calculateCustomRule(rule, input)
    default: {
      const unsupported: never = rule.formula.type
      throw new Error(`Unsupported formula type: ${unsupported}`)
    }
  }
}
