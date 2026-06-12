import {
  earnedIncomeDeduction,
  earnedIncomeTaxCredit,
  progressiveIncomeTax,
} from '@/lib/reverse-net-pay/calc'
import { floorToTen } from '@/lib/social-insurance/deductions'

export type YearEndSettlementSimulationInput = {
  grossAnnualPay: number
  prepaidTax: number
  additionalDependents: number
  children: number
  pensionContribution: number
  deductionTotal: number
}

export type YearEndSettlementSimulationStatus = 'refund' | 'additional' | 'even'

export type YearEndSettlementSimulationResult = {
  grossAnnualPay: number
  prepaidTax: number
  dependentCount: number
  children: number
  earnedIncomeDeduction: number
  personalDeduction: number
  pensionContribution: number
  deductionTotal: number
  taxBase: number
  calculatedTax: number
  earnedIncomeTaxCredit: number
  childTaxCredit: number
  finalIncomeTax: number
  localIncomeTax: number
  settlementTax: number
  refundAmount: number
  additionalTax: number
  status: YearEndSettlementSimulationStatus
}

function won(value: number): number {
  return Math.max(0, Math.round(value || 0))
}

export function childTaxCredit2026(children: number): number {
  const count = Math.max(0, Math.floor(children || 0))
  if (count === 0) return 0
  if (count === 1) return 20_830 * 12
  return (45_830 + Math.max(0, count - 2) * 33_330) * 12
}

export function simulateYearEndSettlement(
  input: YearEndSettlementSimulationInput,
): YearEndSettlementSimulationResult {
  const grossAnnualPay = won(input.grossAnnualPay)
  const prepaidTax = won(input.prepaidTax)
  const dependentCount = 1 + Math.max(0, Math.floor(input.additionalDependents || 0))
  const children = Math.max(0, Math.floor(input.children || 0))
  const pensionContribution = won(input.pensionContribution)
  const deductionTotal = won(input.deductionTotal)
  const earnedDeduction = Math.round(earnedIncomeDeduction(grossAnnualPay))
  const personalDeduction = dependentCount * 1_500_000
  const taxBase = Math.max(
    grossAnnualPay - earnedDeduction - personalDeduction - pensionContribution - deductionTotal,
    0,
  )
  const calculatedTax = Math.round(progressiveIncomeTax(taxBase))
  const incomeTaxCredit = Math.round(earnedIncomeTaxCredit(calculatedTax, grossAnnualPay))
  const childTaxCredit = childTaxCredit2026(children)
  const finalIncomeTax = Math.max(calculatedTax - incomeTaxCredit - childTaxCredit, 0)
  const localIncomeTax = floorToTen(finalIncomeTax * 0.1)
  const settlementTax = finalIncomeTax - prepaidTax
  const refundAmount = Math.max(-settlementTax, 0)
  const additionalTax = Math.max(settlementTax, 0)
  const status: YearEndSettlementSimulationStatus =
    settlementTax < 0 ? 'refund' : settlementTax > 0 ? 'additional' : 'even'

  return {
    grossAnnualPay,
    prepaidTax,
    dependentCount,
    children,
    earnedIncomeDeduction: earnedDeduction,
    personalDeduction,
    pensionContribution,
    deductionTotal,
    taxBase,
    calculatedTax,
    earnedIncomeTaxCredit: incomeTaxCredit,
    childTaxCredit,
    finalIncomeTax,
    localIncomeTax,
    settlementTax,
    refundAmount,
    additionalTax,
    status,
  }
}
