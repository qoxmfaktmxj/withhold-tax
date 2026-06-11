export type MonthlyWithholdingStatus = 'match' | 'under_withheld' | 'over_withheld'

export type MonthlyWithholdingInput = {
  taxableMonthlyPay: number
  familyCount: number
  childCount8To20: number
  officialSimpleTax: number
  withholdingRatePercent: 80 | 100 | 120
  actualNationalTax: number
  actualLocalTax?: number
}

export type MonthlyWithholdingCheckResult = {
  taxableMonthlyPay: number
  familyCount: number
  childCount8To20: number
  withholdingRatePercent: 80 | 100 | 120
  expectedNationalTax: number
  expectedLocalTax: number
  expectedTotalTax: number
  actualNationalTax: number
  actualLocalTax: number
  actualTotalTax: number
  nationalTaxDifference: number
  localTaxDifference: number
  totalTaxDifference: number
  status: MonthlyWithholdingStatus
}

export function floorToTen(value: number): number {
  return Math.floor(Math.max(0, value) / 10) * 10
}

function cleanWon(value: number): number {
  return Math.max(0, Math.round(value || 0))
}

export function checkMonthlyWithholding(input: MonthlyWithholdingInput): MonthlyWithholdingCheckResult {
  const officialSimpleTax = cleanWon(input.officialSimpleTax)
  const actualNationalTax = cleanWon(input.actualNationalTax)
  const expectedNationalTax = cleanWon(officialSimpleTax * (input.withholdingRatePercent / 100))
  const expectedLocalTax = floorToTen(expectedNationalTax * 0.1)
  const actualLocalTax = input.actualLocalTax === undefined ? floorToTen(actualNationalTax * 0.1) : cleanWon(input.actualLocalTax)

  const nationalTaxDifference = actualNationalTax - expectedNationalTax
  const localTaxDifference = actualLocalTax - expectedLocalTax
  const totalTaxDifference = nationalTaxDifference + localTaxDifference
  const status: MonthlyWithholdingStatus =
    totalTaxDifference === 0 ? 'match' : totalTaxDifference < 0 ? 'under_withheld' : 'over_withheld'

  return {
    taxableMonthlyPay: cleanWon(input.taxableMonthlyPay),
    familyCount: Math.max(1, Math.floor(input.familyCount || 1)),
    childCount8To20: Math.max(0, Math.floor(input.childCount8To20 || 0)),
    withholdingRatePercent: input.withholdingRatePercent,
    expectedNationalTax,
    expectedLocalTax,
    expectedTotalTax: expectedNationalTax + expectedLocalTax,
    actualNationalTax,
    actualLocalTax,
    actualTotalTax: actualNationalTax + actualLocalTax,
    nationalTaxDifference,
    localTaxDifference,
    totalTaxDifference,
    status,
  }
}
