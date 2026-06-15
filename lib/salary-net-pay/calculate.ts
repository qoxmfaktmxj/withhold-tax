import nonTaxableRulesRaw from '@/content/tax-rules/2026/non-taxable-income.json'
import { applyMonthlyCapRule, loadRules } from '@/lib/rules/engine'
import { calculateSocialInsuranceDeductions } from '@/lib/social-insurance/deductions'

const nonTaxableRules = loadRules(nonTaxableRulesRaw)
const mealAllowanceRule = nonTaxableRules.find((rule) => rule.ruleId === 'meal_allowance_cap')

export type SalaryNetPayInput = {
  grossMonthlyPay: number
  nonTaxablePay: number
  mealAllowancePay?: number
  incomeTax: number
  localIncomeTax: number
  nationalPension: number
  healthInsurance: number
  longTermCareInsurance: number
  employmentInsurance: number
  otherDeductions: number
  paymentMonths: number
  socialInsuranceMode?: 'manual' | 'auto'
  socialInsurancePaymentDate?: string
}

export type SalaryNetPayResult = {
  grossMonthlyPay: number
  nonTaxablePay: number
  taxableConvertedNonTaxablePay: number
  taxablePay: number
  incomeTax: number
  localIncomeTax: number
  nationalPension: number
  healthInsurance: number
  longTermCareInsurance: number
  employmentInsurance: number
  otherDeductions: number
  totalDeductions: number
  monthlyNetPay: number
  annualGrossPay: number
  annualNetPay: number
  deductionRate: number
}

function won(value: number): number {
  return Math.max(0, Math.round(value || 0))
}

export function calculateSalaryNetPay(input: SalaryNetPayInput): SalaryNetPayResult {
  const grossMonthlyPay = won(input.grossMonthlyPay)
  const mealAllowancePay = won(input.mealAllowancePay ?? 0)
  const mealAllowanceCap = mealAllowancePay > 0 && mealAllowanceRule
    ? applyMonthlyCapRule(mealAllowanceRule, { monthlyAmount: mealAllowancePay })
    : null
  const nonTaxablePay = won(input.nonTaxablePay) + (mealAllowanceCap?.nonTaxableAmount ?? 0)
  const taxableConvertedNonTaxablePay = mealAllowanceCap?.taxableAmount ?? 0
  const taxablePay = Math.max(0, grossMonthlyPay - nonTaxablePay)
  const paymentMonths = Math.max(1, Math.min(24, Math.floor(input.paymentMonths || 12)))
  const autoSocialInsurance = input.socialInsuranceMode === 'auto'
    ? calculateSocialInsuranceDeductions({
        taxableMonthlyPay: taxablePay,
        paymentDate: input.socialInsurancePaymentDate,
      })
    : null
  const incomeTax = won(input.incomeTax)
  const localIncomeTax = won(input.localIncomeTax)
  const nationalPension = autoSocialInsurance?.nationalPension ?? won(input.nationalPension)
  const healthInsurance = autoSocialInsurance?.healthInsurance ?? won(input.healthInsurance)
  const longTermCareInsurance = autoSocialInsurance?.longTermCareInsurance ?? won(input.longTermCareInsurance)
  const employmentInsurance = autoSocialInsurance?.employmentInsurance ?? won(input.employmentInsurance)
  const otherDeductions = won(input.otherDeductions)
  const totalDeductions =
    incomeTax +
    localIncomeTax +
    nationalPension +
    healthInsurance +
    longTermCareInsurance +
    employmentInsurance +
    otherDeductions
  const monthlyNetPay = Math.max(0, grossMonthlyPay - totalDeductions)
  const deductionRate = grossMonthlyPay === 0 ? 0 : Math.round((totalDeductions / grossMonthlyPay) * 1000) / 10

  return {
    grossMonthlyPay,
    nonTaxablePay,
    taxableConvertedNonTaxablePay,
    taxablePay,
    incomeTax,
    localIncomeTax,
    nationalPension,
    healthInsurance,
    longTermCareInsurance,
    employmentInsurance,
    otherDeductions,
    totalDeductions,
    monthlyNetPay,
    annualGrossPay: grossMonthlyPay * paymentMonths,
    annualNetPay: monthlyNetPay * paymentMonths,
    deductionRate,
  }
}
