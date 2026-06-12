/**
 * 종업원분 주민세 계산 (지방세법 §74, §84의2~§84의6 — 2026 신설 공제 반영).
 *
 * 산식(강의 PPT Slide 46·47·50·51·54 기준):
 * ① 면세점: 신고 대상 월 포함 직전 12개월 월평균 급여총액 ≤ 1억 5천만원 → 면세(신고의무 없음)
 * ② 과세표준 = 당월 급여총액
 *      − 장기근속수당 공제 Σ MIN(1인당 지급액, 1인당 월급여 × 10%, 360,000원)  [2026 신설]
 *      − 육아휴직 대체인력 급여 전액                                            [2026 신설]
 *      − 기타 공제(중소기업 고용지원 공제 등 별도 계산값 직접 입력)
 * ③ 세액 = 과세표준 × 0.5% (표준세율 — 조례로 0.25%~0.75% 가감 가능)
 * ④ 신고기한 = 급여를 지급한 달의 다음 달 10일
 *
 * ⚠ 실무 참조용 추정치. 최종 수치는 법령·위택스·관할 지자체 조례 확인이 우선.
 */

export const EXEMPTION_THRESHOLD = 150_000_000 // 면세점: 월평균 급여총액 1억 5천만원
export const STANDARD_RATE = 0.005 // 표준세율 0.5% (1천분의 5)
export const LONG_SERVICE_RATE = 0.1 // 장기근속수당 공제: 1인당 월 급여액의 10% 범위
export const LONG_SERVICE_CAP_PER_PERSON = 360_000 // 장기근속수당 공제: 1인당 월 최대 36만원

export type EmployeeLocalTaxInput = {
  /** 신고 대상 월 포함 직전 12개월 월평균 급여총액(원) — 면세점 판정용 */
  avgMonthlyPayroll: number
  /** 당월 종업원 급여총액(원) — 비과세 급여(소득세법 §12 제3호) 제외 금액 */
  monthlyPayrollTotal: number
  /** 장기근속수당 지급 인원 수(명) */
  longServiceEmployeeCount?: number
  /** 1인당 장기근속수당 지급액(원/월) */
  longServiceAllowancePerEmployee?: number
  /** 장기근속수당 지급 직원의 1인당 월급여(원) — 공제한도(10%) 산정용 */
  longServiceMonthlyPayPerEmployee?: number
  /** 육아휴직 대체인력 급여 합계(원) — 전액 공제 */
  childcareReplacementPay?: number
  /** 기타 과세표준 공제(원) — 중소기업 고용지원 공제(§84의5) 등 별도 계산값 */
  otherDeduction?: number
  /** 급여 지급월 'YYYY-MM' — 신고기한(다음 달 10일) 계산용 */
  paymentMonth?: string
}

export type EmployeeLocalTaxResult = {
  exempt: boolean
  exemptionThreshold: number
  avgMonthlyPayroll: number
  monthlyPayrollTotal: number
  /** 1인당 장기근속수당 공제액 = MIN(지급액, 월급여×10%, 360,000) */
  longServiceDeductionPerEmployee: number
  longServiceDeduction: number
  childcareDeduction: number
  otherDeduction: number
  totalDeduction: number
  taxBase: number
  taxRatePercent: number
  /** 산출세액(10원 미만 절사) — 면세점 이하이면 0 */
  tax: number
  /** paymentMonth 입력 시 'YYYY-MM-DD'(다음 달 10일), 아니면 null */
  filingDeadline: string | null
  filingDeadlineNote: string
}

export function floorToTen(value: number): number {
  return Math.floor(Math.max(0, value) / 10) * 10
}

function cleanWon(value: number | undefined): number {
  return Math.max(0, Math.round(value || 0))
}

function cleanCount(value: number | undefined): number {
  return Math.max(0, Math.floor(value || 0))
}

/** 'YYYY-MM' → 다음 달 10일 'YYYY-MM-DD'. 형식이 아니면 null */
export function filingDeadlineFor(paymentMonth: string | undefined): string | null {
  if (!paymentMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(paymentMonth)) return null
  const [year, month] = paymentMonth.split('-').map(Number)
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-10`
}

export function checkEmployeeLocalTax(input: EmployeeLocalTaxInput): EmployeeLocalTaxResult {
  const avgMonthlyPayroll = cleanWon(input.avgMonthlyPayroll)
  const monthlyPayrollTotal = cleanWon(input.monthlyPayrollTotal)
  const exempt = avgMonthlyPayroll <= EXEMPTION_THRESHOLD

  const count = cleanCount(input.longServiceEmployeeCount)
  const allowance = cleanWon(input.longServiceAllowancePerEmployee)
  const monthlyPay = cleanWon(input.longServiceMonthlyPayPerEmployee)
  const longServiceDeductionPerEmployee =
    count > 0
      ? Math.min(allowance, Math.floor(monthlyPay * LONG_SERVICE_RATE), LONG_SERVICE_CAP_PER_PERSON)
      : 0
  const longServiceDeduction = longServiceDeductionPerEmployee * count

  const childcareDeduction = cleanWon(input.childcareReplacementPay)
  const otherDeduction = cleanWon(input.otherDeduction)
  const totalDeduction = longServiceDeduction + childcareDeduction + otherDeduction

  const taxBase = Math.max(0, monthlyPayrollTotal - totalDeduction)
  const tax = exempt ? 0 : floorToTen(taxBase * STANDARD_RATE)

  const filingDeadline = exempt ? null : filingDeadlineFor(input.paymentMonth)
  const filingDeadlineNote = exempt
    ? '면세점 이하 — 신고의무 없음(다만 매월 면세점 판단은 필요)'
    : '급여를 지급한 달의 다음 달 10일까지 사업소 소재지 관할 시·군·구에 신고·납부'

  return {
    exempt,
    exemptionThreshold: EXEMPTION_THRESHOLD,
    avgMonthlyPayroll,
    monthlyPayrollTotal,
    longServiceDeductionPerEmployee,
    longServiceDeduction,
    childcareDeduction,
    otherDeduction,
    totalDeduction,
    taxBase,
    taxRatePercent: STANDARD_RATE * 100,
    tax,
    filingDeadline,
    filingDeadlineNote,
  }
}
