export type YearEndSettlementIncomeType = 'business' | 'earned' | 'religious'

export type YearEndInstallmentStatus = 'available' | 'not_available' | 'manual_review'

export type YearEndInstallmentReason =
  | 'threshold_not_exceeded'
  | 'unsupported_income_type'

export type YearEndInstallmentInput = {
  incomeType: YearEndSettlementIncomeType
  settlementYear: number
  additionalTax: number
}

export type YearEndInstallmentConfig = {
  threshold?: number
  startMonth?: number
  installmentCount?: number
}

export type YearEndInstallment = {
  year: number
  month: number
  amount: number
}

export type YearEndInstallmentSchedule = {
  status: YearEndInstallmentStatus
  threshold: number
  reason?: YearEndInstallmentReason
  factIds: string[]
  installments: YearEndInstallment[]
  reportMemo?: string
  reviewNote?: string
}

const THRESHOLD = 100_000
const BUSINESS_INSTALLMENT_FACT_ID = 'f_ca0007'
const EARNED_INSTALLMENT_FACT_ID = 'f_yas001'
const INSTALLMENT_MONTHS = [2, 3, 4] as const

function resolveInstallmentMonths(config: YearEndInstallmentConfig = {}): number[] {
  const startMonth = Math.trunc(config.startMonth ?? INSTALLMENT_MONTHS[0])
  const installmentCount = Math.trunc(config.installmentCount ?? INSTALLMENT_MONTHS.length)
  const monthCount = Math.max(1, installmentCount)

  return Array.from({ length: monthCount }, (_, index) => startMonth + index)
}

function splitIntoInstallments(total: number, year: number, months: number[]): YearEndInstallment[] {
  const baseAmount = Math.floor(total / months.length)
  const remainder = total - baseAmount * months.length

  return months.map((month, index) => ({
    year,
    month,
    amount: index === months.length - 1 ? baseAmount + remainder : baseAmount,
  }))
}

export function calculateYearEndInstallmentSchedule(
  input: YearEndInstallmentInput,
  config: YearEndInstallmentConfig = {}
): YearEndInstallmentSchedule {
  const threshold = Number(config.threshold ?? THRESHOLD)
  const installmentMonths = resolveInstallmentMonths(config)
  const thresholdResult = {
    threshold,
    factIds:
      input.incomeType === 'business'
        ? [BUSINESS_INSTALLMENT_FACT_ID]
        : input.incomeType === 'earned'
          ? [EARNED_INSTALLMENT_FACT_ID]
          : [],
    installments: [],
  }

  if (input.additionalTax <= threshold) {
    return {
      ...thresholdResult,
      status: 'not_available',
      reason: 'threshold_not_exceeded',
    }
  }

  if (input.incomeType !== 'business' && input.incomeType !== 'earned') {
    return {
      ...thresholdResult,
      status: 'manual_review',
      reason: 'unsupported_income_type',
      reviewNote: '해당 소득 유형의 분납 근거 fact와 신고 반영 방식을 먼저 확인하세요.',
    }
  }

  return {
    threshold,
    status: 'available',
    factIds: thresholdResult.factIds,
    installments: splitIntoInstallments(input.additionalTax, input.settlementYear + 1, installmentMonths),
    reportMemo:
      input.incomeType === 'earned'
        ? '2월부터 4월까지 월 급여 지급 시 추가 원천징수액으로 반영하고, 원천징수이행상황신고서 표시는 서식 확인 후 확정하세요.'
        : '2월부터 4월까지 지급월별 추가 원천징수액으로 반영하고, 원천징수이행상황신고서 표시는 서식 확인 후 확정하세요.',
  }
}
