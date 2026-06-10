// Fact freshness check — finds stale or soon-due facts in content/facts.json.
// Usage:
//   node scripts/fact-freshness.mjs          # table output
//   node scripts/fact-freshness.mjs --json   # JSON output

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const JSON_MODE = process.argv.includes('--json')
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

const facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/facts.json'), 'utf8'))

const STALE_DAYS = 180    // asOf 기준 경과일 초과 시 stale
const SOON_DAYS = 60      // nextReviewBy 기준 X일 이내 도래 시 soon-due

function daysBetween(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00Z')
  return Math.floor((TODAY.getTime() - d.getTime()) / 86400000)
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00Z')
  return Math.ceil((d.getTime() - TODAY.getTime()) / 86400000)
}

const flagged = []

for (const f of facts) {
  const reasons = []

  // ① asOf가 180일 초과 경과
  const asOfElapsed = daysBetween(f.asOf)
  if (asOfElapsed !== null && asOfElapsed > STALE_DAYS) {
    reasons.push(`asOf 경과 ${asOfElapsed}일 (기준 ${STALE_DAYS}일)`)
  }

  // ② nextReviewBy가 60일 이내 도래
  if (f.nextReviewBy) {
    const until = daysUntil(f.nextReviewBy)
    if (until !== null && until <= SOON_DAYS) {
      reasons.push(`검토일 ${until <= 0 ? `${Math.abs(until)}일 경과` : `${until}일 후`} (${f.nextReviewBy})`)
    }
  }

  // ③ verifyStatus '확인필요' 또는 '강의기반'
  if (f.verifyStatus === '확인필요' || f.verifyStatus === '강의기반') {
    reasons.push(`verifyStatus: ${f.verifyStatus}`)
  }

  if (reasons.length > 0) {
    flagged.push({
      id: f.id,
      title: f.title || f.slug || f.id,
      chapter: f.chapter,
      verifyStatus: f.verifyStatus,
      asOf: f.asOf || '',
      nextReviewBy: f.nextReviewBy || '',
      risk: f.risk || '',
      reasons,
    })
  }
}

// Sort: risk high first, then by nextReviewBy ascending
const riskOrder = { high: 0, medium: 1, low: 2 }
flagged.sort((a, b) => {
  const rd = (riskOrder[a.risk] ?? 3) - (riskOrder[b.risk] ?? 3)
  if (rd !== 0) return rd
  return (a.nextReviewBy || '9999').localeCompare(b.nextReviewBy || '9999')
})

if (JSON_MODE) {
  console.log(JSON.stringify({ generated: TODAY.toISOString().slice(0, 10), total: facts.length, flagged }, null, 2))
  process.exit(0)
}

// Table output
console.log(`\n원천징수 레퍼런스 — Fact 신선도 점검`)
console.log(`생성: ${TODAY.toISOString().slice(0, 10)}  |  전체 fact: ${facts.length}건  |  플래그: ${flagged.length}건\n`)
console.log(`기준: ① asOf 경과 ${STALE_DAYS}일↑  ② nextReviewBy ${SOON_DAYS}일 이내  ③ verifyStatus 확인필요·강의기반\n`)

if (flagged.length === 0) {
  console.log('플래그된 fact 없음. 모든 항목이 신선도 기준을 통과합니다.')
  process.exit(0)
}

const COL_ID = 14
const COL_TITLE = 32
const COL_CH = 6
const COL_STATUS = 10
const COL_ASOF = 11
const COL_NEXT = 11
const COL_RISK = 8

function pad(s, n) { return String(s ?? '').slice(0, n).padEnd(n) }

const header = [
  pad('ID', COL_ID),
  pad('제목', COL_TITLE),
  pad('장', COL_CH),
  pad('검증상태', COL_STATUS),
  pad('asOf', COL_ASOF),
  pad('검토일', COL_NEXT),
  pad('위험', COL_RISK),
  '플래그 사유',
].join(' ')

const divider = '-'.repeat(header.length)
console.log(header)
console.log(divider)

for (const f of flagged) {
  const row = [
    pad(f.id, COL_ID),
    pad(f.title, COL_TITLE),
    pad(f.chapter, COL_CH),
    pad(f.verifyStatus, COL_STATUS),
    pad(f.asOf, COL_ASOF),
    pad(f.nextReviewBy, COL_NEXT),
    pad(f.risk, COL_RISK),
    f.reasons.join(' / '),
  ].join(' ')
  console.log(row)
}

console.log(divider)
console.log(`\n합계: ${flagged.length}건 플래그 (전체 ${facts.length}건 중)\n`)

process.exit(0)
