/**
 * 세후→세전 역산 계산기 (한백택스 calcReverse 포팅, 2026 귀속 고정)
 *
 * - 간이세액표가 아닌 「연말정산 방식 연 환산 근사치」: 월 과세급여 ×12를 연봉으로 보고
 *   근로소득공제→인적공제→연금보험료공제→기본세율→근로소득세액공제 체인으로 연세액을 구한 뒤
 *   12로 나눠 월 세액을 추정한다. 실제 월 원천징수액(간이세액표)과 다를 수 있다.
 * - 현재 시각(Date) 의존 금지: 귀속연도는 TAX_YEAR(2026) 고정 상수.
 * - 사회보험 상·하한: 한백택스 원본은 2026년분에 659만/41만을 적용(타임라인 1년 빠른 오류 의심)
 *   → 2026 개정세법특강(Slide 99~100) 기준 637만/40만(2026.7.1 적용)을 채택.
 */

/** 귀속연도 고정 상수 — 현재 시각 의존 금지 */
export const TAX_YEAR = 2026 as const

/** 2026년 4대보험 근로자 부담 요율 (2026 개정세법특강 Slide 99~100, verifyStatus: 확인필요) */
export const SOCIAL_INSURANCE_2026 = {
  nationalPension: {
    /** 근로자 부담 보험료율 4.75% (합계 9.5%) */
    employeeRate: 0.0475,
    /** 기준소득월액 상한 637만원 (2026.7.1~, 한백택스 원본 659만은 미채택) */
    monthlyBaseCap: 6_370_000,
    /** 기준소득월액 하한 40만원 (2026.7.1~, 한백택스 원본 41만은 미채택) */
    monthlyBaseFloor: 400_000,
  },
  healthInsurance: {
    /** 근로자 부담 보험료율 3.595% (합계 7.19%) */
    employeeRate: 0.03595,
  },
  longTermCare: {
    /** 건강보험료 대비 13.14% */
    rateOnHealthInsurance: 0.1314,
  },
  employmentInsurance: {
    /** 실업급여 근로자 부담 0.9% (합계 1.8%, 동결) */
    employeeRate: 0.009,
  },
  /** 지방소득세 = 소득세의 10% */
  localIncomeTaxRate: 0.1,
  /** 기본공제(인적공제) 1인당 연 150만원 — 소득세법 §50 */
  personalDeductionPerPerson: 1_500_000,
} as const

/** 한백택스 고정점 반복 파라미터 (감쇠 0.85 · 오차 1원 · 최대 100회) */
export const REVERSE_ITERATION = {
  damping: 0.85,
  toleranceWon: 1,
  maxIterations: 100,
} as const

/** 10원 미만 절사 */
export function floorToTen(value: number): number {
  return Math.floor(Math.max(0, value) / 10) * 10
}

/** 종합소득 기본세율(6~45%, 누진공제 방식) — 한백택스 incomeTax 포팅 */
export function progressiveIncomeTax(taxBase: number): number {
  if (taxBase <= 0) return 0
  if (taxBase <= 14_000_000) return taxBase * 0.06
  if (taxBase <= 50_000_000) return taxBase * 0.15 - 1_260_000
  if (taxBase <= 88_000_000) return taxBase * 0.24 - 5_760_000
  if (taxBase <= 150_000_000) return taxBase * 0.35 - 15_440_000
  if (taxBase <= 300_000_000) return taxBase * 0.38 - 19_940_000
  if (taxBase <= 500_000_000) return taxBase * 0.4 - 25_940_000
  if (taxBase <= 1_000_000_000) return taxBase * 0.42 - 35_940_000
  return taxBase * 0.45 - 65_940_000
}

/** 근로소득공제(소득세법 §47, 한도 2,000만원) — 한백택스 earnedDeduction 포팅 */
export function earnedIncomeDeduction(totalSalary: number): number {
  if (totalSalary <= 0) return 0
  if (totalSalary <= 5_000_000) return totalSalary * 0.7
  if (totalSalary <= 15_000_000) return 3_500_000 + (totalSalary - 5_000_000) * 0.4
  if (totalSalary <= 45_000_000) return 7_500_000 + (totalSalary - 15_000_000) * 0.15
  if (totalSalary <= 100_000_000) return 12_000_000 + (totalSalary - 45_000_000) * 0.05
  return Math.min(14_750_000 + (totalSalary - 100_000_000) * 0.02, 20_000_000)
}

/**
 * 근로소득세액공제(소득세법 §59①, 총급여별 한도).
 * 한도 감액 기울기는 법문 그대로: 3,300만 초과분 ×0.8%(최저 66만),
 * 7,000만 초과분 ×1/2(최저 50만), 1.2억 초과분 ×1/2(최저 20만).
 * 한백택스 원본의 ×0.5% 완만 기울기는 법문과 달라 미채택.
 */
export function earnedIncomeTaxCredit(calculatedTax: number, totalSalary: number): number {
  if (calculatedTax <= 0) return 0
  const base = calculatedTax <= 1_300_000 ? calculatedTax * 0.55 : 715_000 + (calculatedTax - 1_300_000) * 0.3
  let limit: number
  if (totalSalary <= 33_000_000) limit = 740_000
  else if (totalSalary <= 70_000_000) limit = Math.max(740_000 - (totalSalary - 33_000_000) * 0.008, 660_000)
  else if (totalSalary <= 120_000_000) limit = Math.max(660_000 - (totalSalary - 70_000_000) * 0.5, 500_000)
  else limit = Math.max(500_000 - (totalSalary - 120_000_000) * 0.5, 200_000)
  return Math.min(base, limit)
}

export type AnnualTaxDetail = {
  totalSalary: number
  earnedIncomeDeduction: number
  personalDeduction: number
  pensionContributionDeduction: number
  taxBase: number
  calculatedTax: number
  earnedIncomeTaxCredit: number
  finalTax: number
}

export type DeductionBreakdown = {
  taxableMonthlyPay: number
  nonTaxableMonthlyPay: number
  grossMonthlyPay: number
  nationalPension: number
  healthInsurance: number
  longTermCare: number
  employmentInsurance: number
  socialInsuranceTotal: number
  monthlyIncomeTax: number
  monthlyLocalIncomeTax: number
  totalMonthlyDeductions: number
  netMonthlyPay: number
  annual: AnnualTaxDetail
}

function clampDependents(value: number): number {
  return Math.max(1, Math.floor(value || 1))
}

/**
 * 정방향: 월 과세급여 → 공제 내역(4대보험 + 연 환산 근사 소득세·지방세) → 실수령액.
 * 공제 체인: 4대보험 → 근로소득공제 → 인적공제(150만×인원) → 연금보험료공제 → 기본세율
 *           → 근로소득세액공제 → 지방소득세 10%. 각 월 세액·보험료는 10원 미만 절사.
 */
export function calculateMonthlyDeductions(
  taxableMonthlyPay: number,
  dependents: number,
  nonTaxableMonthlyPay = 0
): DeductionBreakdown {
  const taxable = Math.max(0, taxableMonthlyPay || 0)
  const nonTaxable = Math.max(0, nonTaxableMonthlyPay || 0)
  const persons = clampDependents(dependents)
  const si = SOCIAL_INSURANCE_2026

  // 4대보험(근로자 부담)
  const npBase = Math.min(Math.max(taxable, si.nationalPension.monthlyBaseFloor), si.nationalPension.monthlyBaseCap)
  const nationalPension = floorToTen(npBase * si.nationalPension.employeeRate)
  const healthInsurance = floorToTen(taxable * si.healthInsurance.employeeRate)
  const longTermCare = floorToTen(healthInsurance * si.longTermCare.rateOnHealthInsurance)
  const employmentInsurance = floorToTen(taxable * si.employmentInsurance.employeeRate)
  const socialInsuranceTotal = nationalPension + healthInsurance + longTermCare + employmentInsurance

  // 소득세(연말정산 방식 연 환산 근사)
  const totalSalary = taxable * 12
  const earnedDed = earnedIncomeDeduction(totalSalary)
  const personalDeduction = persons * si.personalDeductionPerPerson
  const pensionContributionDeduction = nationalPension * 12
  const taxBase = Math.max(totalSalary - earnedDed - personalDeduction - pensionContributionDeduction, 0)
  const calculatedTax = progressiveIncomeTax(taxBase)
  const taxCredit = earnedIncomeTaxCredit(calculatedTax, totalSalary)
  const finalTax = Math.max(calculatedTax - taxCredit, 0)
  const monthlyIncomeTax = floorToTen(finalTax / 12)
  const monthlyLocalIncomeTax = floorToTen(monthlyIncomeTax * si.localIncomeTaxRate)

  const totalMonthlyDeductions = socialInsuranceTotal + monthlyIncomeTax + monthlyLocalIncomeTax

  return {
    taxableMonthlyPay: taxable,
    nonTaxableMonthlyPay: nonTaxable,
    grossMonthlyPay: taxable + nonTaxable,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    socialInsuranceTotal,
    monthlyIncomeTax,
    monthlyLocalIncomeTax,
    totalMonthlyDeductions,
    netMonthlyPay: taxable + nonTaxable - totalMonthlyDeductions,
    annual: {
      totalSalary,
      earnedIncomeDeduction: earnedDed,
      personalDeduction,
      pensionContributionDeduction,
      taxBase,
      calculatedTax,
      earnedIncomeTaxCredit: taxCredit,
      finalTax,
    },
  }
}

export type ReverseNetPayInput = {
  /** 희망 월 실수령액(원) */
  targetNetMonthlyPay: number
  /** 부양가족 수(본인 포함, 최소 1) */
  dependents: number
  /** 월 비과세 합계(원) — 한도 클램핑 없이 단일 입력으로 단순화 */
  nonTaxableMonthlyPay: number
}

export type ReverseNetPayResult = {
  converged: boolean
  iterations: number
  taxableMonthlyPay: number
  grossMonthlyPay: number
  achievedNetMonthlyPay: number
  /** 계산 실수령액 - 희망 실수령액 */
  netDifference: number
  breakdown: DeductionBreakdown
}

/**
 * 역산: 희망 월 실수령액 → 세전 월급. 한백택스 고정점 반복 포팅
 * (시작값 = (목표-비과세)×1.25, 감쇠 0.85, 오차 1원 미만 수렴, 최대 100회).
 */
export function calculateReverseNetPay(input: ReverseNetPayInput): ReverseNetPayResult {
  const targetNet = Math.max(0, Math.round(input.targetNetMonthlyPay || 0))
  const dependents = clampDependents(input.dependents)
  const nonTaxable = Math.max(0, Math.round(input.nonTaxableMonthlyPay || 0))

  let taxable = Math.max(targetNet - nonTaxable, 0) * 1.25
  let converged = false
  let iterations = 0

  for (let i = 0; i < REVERSE_ITERATION.maxIterations; i++) {
    iterations = i + 1
    const deductions = calculateMonthlyDeductions(taxable, dependents, nonTaxable).totalMonthlyDeductions
    const net = taxable + nonTaxable - deductions
    const diff = targetNet - net
    if (Math.abs(diff) < REVERSE_ITERATION.toleranceWon) {
      converged = true
      break
    }
    taxable += diff * REVERSE_ITERATION.damping
    if (taxable < 0) taxable = 0
  }

  const taxableMonthlyPay = Math.round(taxable)
  const breakdown = calculateMonthlyDeductions(taxableMonthlyPay, dependents, nonTaxable)

  return {
    converged,
    iterations,
    taxableMonthlyPay,
    grossMonthlyPay: breakdown.grossMonthlyPay,
    achievedNetMonthlyPay: breakdown.netMonthlyPay,
    netDifference: breakdown.netMonthlyPay - targetNet,
    breakdown,
  }
}
