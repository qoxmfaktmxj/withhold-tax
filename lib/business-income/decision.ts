import ratesRaw from '@/content/tax-rules/2026/withholding-rates.json'
import { applyRateRule, loadRules, pickRule } from '@/lib/rules/engine'
import { calculateYearEndInstallmentSchedule } from '@/lib/year-end/installment'

export type BusinessIncomeResidency = 'resident' | 'nonresident'

export type BusinessIncomeClassification =
  | 'personal_service_resident'
  | 'registered_business'
  | 'employee'
  | 'nonresident'
  | 'corporation'

export type BusinessIncomeReviewFlag =
  | 'personal_service_required'
  | 'nonresident_rule_required'
  | 'business_registration_review'

export type BusinessIncomeAction =
  | { type: 'calculate'; ruleId: 'resident_business_income_wht' }
  | { type: 'manual-review'; message: string }
  | { type: 'redirect-rule'; ruleId: 'nonresident_general_wht' }

export type BusinessIncomePaymentInput = {
  grossPayment: number
  paymentDate: string
  residency: BusinessIncomeResidency
  incomeClass?: BusinessIncomeClassification
  isPersonalService: boolean
  hasBusinessRegistration: boolean
  isContinuingService?: boolean
  additionalTaxAfterSettlement?: number | null
}

export type BusinessIncomeInstallmentPlan = {
  enabled: boolean
  threshold: number
  installments: Array<{ month: number; amount: number }>
}

export type BusinessIncomeDecision = {
  classification: BusinessIncomeClassification
  appliesThreePointThree: boolean
  ruleId?: 'resident_business_income_wht'
  action: BusinessIncomeAction
  reviewFlags: BusinessIncomeReviewFlag[]
  factIds: string[]
  withholding?: {
    nationalTax: number
    localTax: number
    total: number
  }
  smallTaxWithholdingRequired: boolean
  smallTaxExemptionApplied: boolean
  simpleStatementDueDate?: string
  isYearEndTarget: boolean
  installmentPlan: BusinessIncomeInstallmentPlan
}

const RULES = loadRules(ratesRaw)
const BUSINESS_RULE_ID = 'resident_business_income_wht'
const SMALL_TAX_EXCEPTION_START = '2024-07-01'
const MANUAL_PERSONAL_SERVICE = '인적용역 사업소득인지 확인 필요'
const MANUAL_BUSINESS_REGISTRATION = '세금계산서/사업자 거래 여부 확인 필요'

function manualReview(message: string): BusinessIncomeAction {
  return { type: 'manual-review', message }
}

function redirectRule(ruleId: 'nonresident_general_wht'): BusinessIncomeAction {
  return { type: 'redirect-rule', ruleId }
}

function classifyBusinessIncome(input: BusinessIncomePaymentInput): BusinessIncomeClassification {
  if (input.incomeClass) return input.incomeClass
  if (input.residency === 'nonresident') return 'nonresident'
  if (input.hasBusinessRegistration) return 'registered_business'
  if (!input.isPersonalService) return 'employee'
  return 'personal_service_resident'
}

function nextMonthLastDay(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year, month + 1, 0))
  return lastDay.toISOString().slice(0, 10)
}

function buildInstallmentPlan(
  paymentDate: string,
  additionalTax: number | null | undefined
): BusinessIncomeInstallmentPlan {
  const schedule = calculateYearEndInstallmentSchedule({
    incomeType: 'business',
    settlementYear: Number(paymentDate.slice(0, 4)),
    additionalTax: additionalTax ?? 0,
  })

  return {
    enabled: schedule.status === 'available',
    threshold: schedule.threshold,
    installments: schedule.installments.map(({ month, amount }) => ({ month, amount })),
  }
}

export function evaluateBusinessIncomePayment(input: BusinessIncomePaymentInput): BusinessIncomeDecision {
  const factIds = ['f_ca0001', 'f_a00001', 'f_ca0006']
  const reviewFlags: BusinessIncomeReviewFlag[] = []
  const isYearEndTarget = input.isContinuingService === true
  const installmentPlan = buildInstallmentPlan(input.paymentDate, input.additionalTaxAfterSettlement)
  const classification = classifyBusinessIncome(input)
  const base = {
    classification,
    reviewFlags,
    factIds,
    smallTaxWithholdingRequired: false,
    smallTaxExemptionApplied: false,
    simpleStatementDueDate: nextMonthLastDay(input.paymentDate),
    isYearEndTarget,
    installmentPlan,
  }

  if (classification === 'nonresident') {
    reviewFlags.push('nonresident_rule_required')
    return {
      ...base,
      appliesThreePointThree: false,
      action: redirectRule('nonresident_general_wht'),
    }
  }

  if (classification === 'employee') {
    reviewFlags.push('personal_service_required')
    return {
      ...base,
      appliesThreePointThree: false,
      action: manualReview(MANUAL_PERSONAL_SERVICE),
    }
  }

  if (classification === 'registered_business' || classification === 'corporation') {
    reviewFlags.push('business_registration_review')
    return {
      ...base,
      appliesThreePointThree: false,
      action: manualReview(MANUAL_BUSINESS_REGISTRATION),
    }
  }

  const rule = pickRule(RULES, BUSINESS_RULE_ID, input.paymentDate)
  const withholding = rule
    ? applyRateRule(rule, { grossPayment: input.grossPayment })
    : undefined
  const smallTaxWithholdingRequired =
    input.paymentDate >= SMALL_TAX_EXCEPTION_START && (withholding?.total ?? 0) < 1_000

  return {
    ...base,
    appliesThreePointThree: true,
    ruleId: BUSINESS_RULE_ID,
    action: { type: 'calculate', ruleId: BUSINESS_RULE_ID },
    withholding,
    smallTaxWithholdingRequired,
    smallTaxExemptionApplied: false,
  }
}
