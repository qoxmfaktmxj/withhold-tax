export type RetirementTaxStatus = 'match' | 'under_withheld' | 'over_withheld'

export type RetirementTaxInput = {
  retirementPay: number
  officialRetirementIncomeTax: number
  actualNationalTax: number
  actualLocalTax?: number
}

export type RetirementTaxCheckResult = {
  retirementPay: number
  expectedNationalTax: number
  expectedLocalTax: number
  expectedTotalTax: number
  actualNationalTax: number
  actualLocalTax: number
  actualTotalTax: number
  nationalTaxDifference: number
  localTaxDifference: number
  totalTaxDifference: number
  effectiveTaxRate: number
  status: RetirementTaxStatus
}

function won(value: number): number {
  return Math.max(0, Math.round(value || 0))
}

function floorToTen(value: number): number {
  return Math.floor(Math.max(0, value) / 10) * 10
}

export function checkRetirementTax(input: RetirementTaxInput): RetirementTaxCheckResult {
  const retirementPay = won(input.retirementPay)
  const expectedNationalTax = won(input.officialRetirementIncomeTax)
  const expectedLocalTax = floorToTen(expectedNationalTax * 0.1)
  const actualNationalTax = won(input.actualNationalTax)
  const actualLocalTax = input.actualLocalTax === undefined ? floorToTen(actualNationalTax * 0.1) : won(input.actualLocalTax)
  const nationalTaxDifference = actualNationalTax - expectedNationalTax
  const localTaxDifference = actualLocalTax - expectedLocalTax
  const totalTaxDifference = nationalTaxDifference + localTaxDifference
  const status: RetirementTaxStatus =
    totalTaxDifference === 0 ? 'match' : totalTaxDifference < 0 ? 'under_withheld' : 'over_withheld'

  return {
    retirementPay,
    expectedNationalTax,
    expectedLocalTax,
    expectedTotalTax: expectedNationalTax + expectedLocalTax,
    actualNationalTax,
    actualLocalTax,
    actualTotalTax: actualNationalTax + actualLocalTax,
    nationalTaxDifference,
    localTaxDifference,
    totalTaxDifference,
    effectiveTaxRate: retirementPay === 0 ? 0 : Math.round(((expectedNationalTax + expectedLocalTax) / retirementPay) * 1000) / 10,
    status,
  }
}
