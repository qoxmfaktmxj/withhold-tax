import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const strictMode = args.includes('--strict')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function collectRuleFactIds(ruleDir) {
  const ids = new Set()
  for (const file of fs.readdirSync(ruleDir).filter((name) => name.endsWith('.json'))) {
    const rules = readJson(path.join(ruleDir, file))
    if (!Array.isArray(rules)) continue
    for (const rule of rules) {
      for (const factId of rule.factIds ?? []) ids.add(factId)
    }
  }
  return ids
}

export function collectScreenSpecFactIds(screenSpecDir) {
  const ids = new Set()
  for (const file of fs.readdirSync(screenSpecDir).filter((name) => name.endsWith('.json'))) {
    const spec = readJson(path.join(screenSpecDir, file))
    for (const factId of spec.factIds ?? []) ids.add(factId)
  }
  return ids
}

export function collectFactImpactLinkIssues({ facts, ruleFactIds, screenSpecFactIds }) {
  const issues = []
  for (const fact of facts) {
    const impact = fact.implementationImpact ?? {}
    if (impact.calculation === true && !ruleFactIds.has(fact.id)) {
      issues.push({
        code: 'calculation_fact_missing_tax_rule',
        id: fact.id,
        detail: 'calculation impact fact must be linked from content/tax-rules',
      })
    }
    if (impact.reporting === true && !ruleFactIds.has(fact.id) && !screenSpecFactIds.has(fact.id)) {
      issues.push({
        code: 'reporting_fact_missing_rule_or_screen_spec',
        id: fact.id,
        detail: 'reporting impact fact must be linked from content/tax-rules or content/screen-specs',
      })
    }
  }
  return issues
}

function main() {
  const root = process.cwd()
  const facts = readJson(path.join(root, 'content/facts.json'))
  const ruleFactIds = collectRuleFactIds(path.join(root, 'content/tax-rules/2026'))
  const screenSpecFactIds = collectScreenSpecFactIds(path.join(root, 'content/screen-specs'))
  const issues = collectFactImpactLinkIssues({ facts, ruleFactIds, screenSpecFactIds })
  const report = { total: facts.length, flagged: issues }

  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(`Fact impact link check: ${issues.length}/${facts.length} flagged`)
    for (const issue of issues) {
      console.log(`- ${issue.id} ${issue.code}: ${issue.detail}`)
    }
  }

  if (strictMode && issues.length > 0) process.exit(1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
