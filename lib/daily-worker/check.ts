export type DailyWorkerPaymentMethod = 'per_day' | 'lump_sum'

export type DailyWorkerTaxStatus = 'no_tax' | 'small_sum_exempt' | 'withhold'

/** 일용근로소득 일 근로소득공제 (소득세법 — 강의 슬라이드 108·145 기준) */
export const DAILY_DEDUCTION = 150_000
/** 소액부징수 기준 (소득세법 §86 — 1,000원 미만 부징수) */
export const SMALL_SUM_THRESHOLD = 1_000

export type DailyWorkerTaxInput = {
  /** 일당(원) */
  dailyWage: number
  /** 근무일수(일) */
  workDays: number
  /** 지급방식: per_day(일별 지급) | lump_sum(월 일괄 지급) */
  paymentMethod: DailyWorkerPaymentMethod
}

export type DailyWorkerTaxResult = {
  dailyWage: number
  workDays: number
  paymentMethod: DailyWorkerPaymentMethod
  /** 총지급액 = 일당 × 근무일수 */
  totalPay: number
  /** 일별 산정세액(소액부징수 판정 전, 원미만 절사) */
  dailyIncomeTax: number
  /** 일별 산정세액 × 근무일수 (소액부징수 판정 전 합계) */
  calculatedTotalIncomeTax: number
  /** 소액부징수 적용 여부 (세액이 있으나 기준 미달로 징수하지 않음) */
  smallSumApplied: boolean
  /** 실제 징수 소득세 */
  withheldIncomeTax: number
  /** 지방소득세(소득세의 10%, 10원 미만 절사) */
  withheldLocalTax: number
  /** 징수세액 합계(소득세 + 지방소득세) */
  totalWithheldTax: number
  /** 실수령액 = 총지급액 − 징수세액 합계 */
  netPay: number
  status: DailyWorkerTaxStatus
}

/** 지방소득세 10원 미만 절사 */
export function floorToTen(value: number): number {
  return Math.floor(Math.max(0, value) / 10) * 10
}

/**
 * 일세액 = MAX(0, 일당 − 150,000) × 6% × (1 − 55%) — 원미만 절사.
 * 6% × 45% = 2.7% 이므로 부동소수점 오차를 피해 정수 연산(× 27 / 1,000)으로 계산.
 * 예) 187,000원 → 999원(소액부징수), 190,000원 → 1,080원, 170,000원 → 540원
 */
export function calcDailyIncomeTax(dailyWage: number): number {
  const base = Math.max(0, Math.floor(dailyWage || 0) - DAILY_DEDUCTION)
  return Math.floor((base * 27) / 1000)
}

/**
 * 일용근로 원천징수 세액 계산.
 * 소액부징수(1,000원 미만) 판정 기준:
 * - 일별 지급: 매 지급 시점의 일별 세액 기준
 * - 월 일괄 지급: 일별 징수세액의 합계액 기준 (강의 슬라이드 110·145)
 */
export function calcDailyWorkerTax(input: DailyWorkerTaxInput): DailyWorkerTaxResult {
  const dailyWage = Math.max(0, Math.floor(input.dailyWage || 0))
  const workDays = Math.max(0, Math.floor(input.workDays || 0))
  const { paymentMethod } = input

  const dailyIncomeTax = calcDailyIncomeTax(dailyWage)
  const calculatedTotalIncomeTax = dailyIncomeTax * workDays
  const totalPay = dailyWage * workDays

  let smallSumApplied = false
  let withheldIncomeTax = 0
  let withheldLocalTax = 0

  if (paymentMethod === 'per_day') {
    // 일별 지급: 일 단위 세액으로 소액부징수 판정 (각 지급 시점별 지방소득세 절사)
    const perDayWithheld = dailyIncomeTax >= SMALL_SUM_THRESHOLD ? dailyIncomeTax : 0
    smallSumApplied = workDays > 0 && dailyIncomeTax > 0 && dailyIncomeTax < SMALL_SUM_THRESHOLD
    withheldIncomeTax = perDayWithheld * workDays
    withheldLocalTax = floorToTen(perDayWithheld * 0.1) * workDays
  } else {
    // 월 일괄 지급: 일별 세액 합계액 기준으로 소액부징수 판정
    smallSumApplied = calculatedTotalIncomeTax > 0 && calculatedTotalIncomeTax < SMALL_SUM_THRESHOLD
    withheldIncomeTax = calculatedTotalIncomeTax >= SMALL_SUM_THRESHOLD ? calculatedTotalIncomeTax : 0
    withheldLocalTax = floorToTen(withheldIncomeTax * 0.1)
  }

  const totalWithheldTax = withheldIncomeTax + withheldLocalTax
  const status: DailyWorkerTaxStatus =
    calculatedTotalIncomeTax === 0 ? 'no_tax' : smallSumApplied ? 'small_sum_exempt' : 'withhold'

  return {
    dailyWage,
    workDays,
    paymentMethod,
    totalPay,
    dailyIncomeTax,
    calculatedTotalIncomeTax,
    smallSumApplied,
    withheldIncomeTax,
    withheldLocalTax,
    totalWithheldTax,
    netPay: totalPay - totalWithheldTax,
    status,
  }
}
