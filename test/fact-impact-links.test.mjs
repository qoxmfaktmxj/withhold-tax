import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectFactImpactLinkIssues, collectRuleFactIds, collectScreenSpecFactIds } from '../scripts/check-fact-impact-links.mjs'

describe('fact impact link gate', () => {
  it('flags calculation impact facts that are not linked to a tax rule', () => {
    const issues = collectFactImpactLinkIssues({
      facts: [
        { id: 'f_calc1', implementationImpact: { calculation: true, reporting: false } },
        { id: 'f_calc2', implementationImpact: { calculation: true, reporting: false } },
      ],
      ruleFactIds: new Set(['f_calc1']),
      screenSpecFactIds: new Set(),
    })

    expect(issues).toEqual([
      {
        code: 'calculation_fact_missing_tax_rule',
        id: 'f_calc2',
        detail: 'calculation impact fact must be linked from content/tax-rules',
      },
    ])
  })

  it('flags reporting impact facts that are not linked to a deadline rule or screen spec', () => {
    const issues = collectFactImpactLinkIssues({
      facts: [
        { id: 'f_reporting1', implementationImpact: { calculation: false, reporting: true } },
        { id: 'f_reporting2', implementationImpact: { calculation: false, reporting: true } },
      ],
      ruleFactIds: new Set(['f_reporting1']),
      screenSpecFactIds: new Set(),
    })

    expect(issues).toEqual([
      {
        code: 'reporting_fact_missing_rule_or_screen_spec',
        id: 'f_reporting2',
        detail: 'reporting impact fact must be linked from content/tax-rules or content/screen-specs',
      },
    ])
  })

  it('keeps current repository impact facts linked to rule or screen data', () => {
    const root = process.cwd()
    const facts = JSON.parse(fs.readFileSync(path.join(root, 'content/facts.json'), 'utf8'))
    const ruleFactIds = collectRuleFactIds(path.join(root, 'content/tax-rules/2026'))
    const screenSpecFactIds = collectScreenSpecFactIds(path.join(root, 'content/screen-specs'))

    expect(collectFactImpactLinkIssues({ facts, ruleFactIds, screenSpecFactIds })).toEqual([])
  })
})
