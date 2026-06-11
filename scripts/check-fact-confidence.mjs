import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const strictMode = args.includes('--strict')
const factsArgIndex = args.indexOf('--facts')
const factsPath = factsArgIndex >= 0 && args[factsArgIndex + 1]
  ? path.resolve(args[factsArgIndex + 1])
  : path.join(process.cwd(), 'content/facts.json')

const facts = JSON.parse(fs.readFileSync(factsPath, 'utf8'))

function implementationImpactOf(fact) {
  return fact.implementationImpact ?? {}
}

function requiresStrictEvidence(fact) {
  const impact = implementationImpactOf(fact)
  return (
    ['critical', 'high'].includes(fact.risk) ||
    impact.calculation === true ||
    impact.reporting === true
  )
}

function reasonsFor(fact) {
  const reasons = []
  const confirmed = fact.verifyStatus === '확정'
  const primary = fact.primarySourceVerified === true
  const impact = implementationImpactOf(fact)
  const strictEvidence = requiresStrictEvidence(fact)

  if (strictEvidence) {
    if (!primary) {
      if (confirmed && ['critical', 'high'].includes(fact.risk)) {
        reasons.push('고위험 확정 fact는 primarySourceVerified=true 여야 함')
      } else if (confirmed && impact.calculation === true) {
        reasons.push('계산 영향 확정 fact는 primarySourceVerified=true 여야 함')
      } else if (confirmed && impact.reporting === true) {
        reasons.push('신고 영향 확정 fact는 primarySourceVerified=true 여야 함')
      } else {
        reasons.push('고위험 또는 계산/신고 영향 fact는 primarySourceVerified=true 여야 함')
      }
    }
    if (!Array.isArray(fact.sourceIds) || fact.sourceIds.length === 0) {
      reasons.push('고위험 또는 계산/신고 영향 fact는 sourceIds 1개 이상이 필요함')
    }
    if (!String(fact.lawRef ?? '').trim()) {
      reasons.push('고위험 또는 계산/신고 영향 fact는 lawRef가 필요함')
    }
    if (!String(fact.lawUrl ?? '').trim()) {
      reasons.push('고위험 또는 계산/신고 영향 fact는 lawUrl이 필요함')
    }
  }

  return reasons
}

const flagged = facts
  .map((fact) => ({ fact, reasons: reasonsFor(fact) }))
  .filter((item) => item.reasons.length > 0)
  .map(({ fact, reasons }) => ({
    id: fact.id,
    title: fact.title || fact.slug || fact.id,
    verifyStatus: fact.verifyStatus,
    primarySourceVerified: fact.primarySourceVerified === true,
    risk: fact.risk || '',
    implementationImpact: implementationImpactOf(fact),
    reasons,
  }))

const report = {
  total: facts.length,
  flagged,
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`Fact confidence check: ${flagged.length}/${facts.length} flagged`)
  for (const item of flagged) {
    console.log(`- ${item.id} ${item.title}: ${item.reasons.join(' / ')}`)
  }
}

if (strictMode && flagged.length > 0) {
  process.exit(1)
}

process.exit(0)
