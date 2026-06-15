import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import factsRaw from '@/content/facts.json'
import sourcesRaw from '@/content/sources.json'
import socialInsuranceRaw from '@/content/tax-rules/2026/social-insurance-2026.json'
import { CHAPTERS } from '@/lib/chapter-meta'
import { loadFacts } from '@/lib/facts/store'
import { loadRules } from '@/lib/rules/engine'
import { loadSources, sourceById } from '@/lib/sources/store'

const rule = loadRules(socialInsuranceRaw).find((entry) => entry.ruleId === 'social_insurance_rates_2026')!
const params = rule.formula.params as Record<string, number | string>

function percent(value: number | string): string {
  return `${Math.round(Number(value) * 100_000) / 1000}%`
}

function manwon(value: number | string): string {
  return `${Number(value) / 10_000}만원`
}

describe('social insurance chapter', () => {
  const mdx = readFileSync(join(process.cwd(), 'content/chapters/social-insurance.mdx'), 'utf8')
  const facts = loadFacts(factsRaw)
  const sources = loadSources(sourcesRaw)

  it('is registered in chapter metadata', () => {
    expect(CHAPTERS.find((chapter) => chapter.slug === 'social-insurance')).toMatchObject({
      title: '4대보험·실수령 계산',
      cat: 'payroll',
    })
  })

  it('keeps rate and national pension cap values aligned with rule JSON', () => {
    expect(mdx).toContain(percent(params.nationalPensionEmployeeRate))
    expect(mdx).toContain(percent(params.healthInsuranceEmployeeRate))
    expect(mdx).toContain(percent(params.employmentInsuranceEmployeeRate))
    expect(mdx).toContain(percent(params.longTermCareRateOnHealthInsurance))
    expect(mdx).toContain(manwon(params.nationalPensionMonthlyBaseCapBeforeJuly))
    expect(mdx).toContain(manwon(params.nationalPensionMonthlyBaseFloorBeforeJuly))
    expect(mdx).toContain(manwon(params.nationalPensionMonthlyBaseCapFromJuly))
    expect(mdx).toContain(manwon(params.nationalPensionMonthlyBaseFloorFromJuly))
  })

  it('documents the 2026 minimum wage from an official MOEL source', () => {
    const fact = facts.find((entry) => entry.id === 'f_si0009')

    expect(fact).toMatchObject({
      verifyStatus: '확정',
      primarySourceVerified: true,
      sourceIds: ['src_moel_minimum_wage_2026'],
    })
    expect(fact?.claim).toContain('10,320원')
    expect(fact?.claim).toContain('2,156,880원')
    expect(fact?.claim).toContain('209시간')
    expect(sourceById(sources, 'src_moel_minimum_wage_2026')).toMatchObject({
      type: 'MOEL_GUIDE',
      publisher: '고용노동부',
      reliability: 'official-guide',
    })
    expect(mdx).toContain('<F id="f_si0009">')
    expect(mdx).toContain('10,320원')
    expect(mdx).toContain('2,156,880원')
  })

  it('links to salary and reverse net-pay calculators', () => {
    expect(mdx).toContain('[급여 실수령 계산기](/tools/salary-net-pay)')
    expect(mdx).toContain('[세후→세전 역산 계산기](/tools/reverse-net-pay)')
  })
})
