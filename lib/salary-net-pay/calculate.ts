export type SalaryNetPayInput = {
  grossMonthlyPay: number
  nonTaxablePay: number
  incomeTax: number
  localIncomeTax: number
  nationalPension: number
  healthInsurance: number
  longTermCareInsurance: number
  employmentInsurance: number
  otherDeductions: number
  paymentMonths: number
}

export type SalaryNetPayResult = {
  grossMonthlyPay: number
  nonTaxablePay: number
  taxablePay: number
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
  const nonTaxablePay = won(input.nonTaxablePay)
  const paymentMonths = Math.max(1, Math.min(24, Math.floor(input.paymentMonths || 12)))
  const totalDeductions =
    won(input.incomeTax) +
    won(input.localIncomeTax) +
    won(input.nationalPension) +
    won(input.healthInsurance) +
    won(input.longTermCareInsurance) +
    won(input.employmentInsurance) +
    won(input.otherDeductions)
  const monthlyNetPay = Math.max(0, grossMonthlyPay - totalDeductions)
  const deductionRate = grossMonthlyPay === 0 ? 0 : Math.round((totalDeductions / grossMonthlyPay) * 1000) / 10

  return {
    grossMonthlyPay,
    nonTaxablePay,
    taxablePay: Math.max(0, grossMonthlyPay - nonTaxablePay),
    totalDeductions,
    monthlyNetPay,
    annualGrossPay: grossMonthlyPay * paymentMonths,
    annualNetPay: monthlyNetPay * paymentMonths,
    deductionRate,
  }
}
