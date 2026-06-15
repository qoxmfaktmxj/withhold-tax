import socialInsuranceRules from '@/content/tax-rules/2026/social-insurance-2026.json'

type RuleParams = Record<string, number | string>

const rule = socialInsuranceRules.find((entry) => entry.ruleId === 'social_insurance_rates_2026')
const params = (rule?.formula.params ?? {}) as RuleParams

function numberParam(key: string): number {
  const value = params[key]
  return typeof value === 'number' ? value : Number(value || 0)
}

function stringParam(key: string): string {
  const value = params[key]
  return typeof value === 'string' ? value : String(value || '')
}

export const TAX_YEAR = 2026 as const

export const SOCIAL_INSURANCE_2026 = {
  nationalPension: {
    employeeRate: numberParam('nationalPensionEmployeeRate'),
    monthlyBaseCap: numberParam('nationalPensionMonthlyBaseCap'),
    monthlyBaseFloor: numberParam('nationalPensionMonthlyBaseFloor'),
    changeDate: stringParam('nationalPensionChangeDate'),
    beforeJuly: {
      monthlyBaseCap: numberParam('nationalPensionMonthlyBaseCapBeforeJuly'),
      monthlyBaseFloor: numberParam('nationalPensionMonthlyBaseFloorBeforeJuly'),
    },
    fromJuly: {
      monthlyBaseCap: numberParam('nationalPensionMonthlyBaseCapFromJuly'),
      monthlyBaseFloor: numberParam('nationalPensionMonthlyBaseFloorFromJuly'),
    },
  },
  healthInsurance: {
    employeeRate: numberParam('healthInsuranceEmployeeRate'),
  },
  longTermCare: {
    rateOnHealthInsurance: numberParam('longTermCareRateOnHealthInsurance'),
  },
  employmentInsurance: {
    employeeRate: numberParam('employmentInsuranceEmployeeRate'),
  },
  localIncomeTaxRate: numberParam('localIncomeTaxRate'),
  personalDeductionPerPerson: numberParam('personalDeductionPerPerson'),
} as const

export type SocialInsuranceDeductionsInput = {
  taxableMonthlyPay: number
  paymentDate?: string
}

export type SocialInsuranceDeductions = {
  taxableMonthlyPay: number
  nationalPension: number
  healthInsurance: number
  longTermCareInsurance: number
  employmentInsurance: number
  total: number
}

export function floorToTen(value: number): number {
  return Math.floor(Math.max(0, value) / 10) * 10
}

export function nationalPensionBounds(paymentDate = SOCIAL_INSURANCE_2026.nationalPension.changeDate) {
  const pension = SOCIAL_INSURANCE_2026.nationalPension
  if (paymentDate < pension.changeDate) {
    return pension.beforeJuly
  }
  return pension.fromJuly
}

export function calculateSocialInsuranceDeductions(input: SocialInsuranceDeductionsInput): SocialInsuranceDeductions {
  const taxableMonthlyPay = Math.max(0, Math.round(input.taxableMonthlyPay || 0))
  const bounds = nationalPensionBounds(input.paymentDate)
  const si = SOCIAL_INSURANCE_2026
  const nationalPensionBase = Math.min(Math.max(taxableMonthlyPay, bounds.monthlyBaseFloor), bounds.monthlyBaseCap)
  const nationalPension = floorToTen(nationalPensionBase * si.nationalPension.employeeRate)
  const healthInsurance = floorToTen(taxableMonthlyPay * si.healthInsurance.employeeRate)
  const longTermCareInsurance = floorToTen(healthInsurance * si.longTermCare.rateOnHealthInsurance)
  const employmentInsurance = floorToTen(taxableMonthlyPay * si.employmentInsurance.employeeRate)

  return {
    taxableMonthlyPay,
    nationalPension,
    healthInsurance,
    longTermCareInsurance,
    employmentInsurance,
    total: nationalPension + healthInsurance + longTermCareInsurance + employmentInsurance,
  }
}
