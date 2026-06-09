// Replace casenote.kr (2차 미러) lawUrl with official 국가 사이트 law.go.kr public links.
// Public URL pattern (no OC key): https://www.law.go.kr/법령/{법령명}/{제N조}
// Dry run:  node scripts/migrate-casenote-urls.mjs
// Apply:    node scripts/migrate-casenote-urls.mjs --apply
import fs from 'node:fs'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const FILE = path.join(process.cwd(), 'content', 'facts.json')
const facts = JSON.parse(fs.readFileSync(FILE, 'utf8'))

// lawRef → { lawName, article }. Robust to parentheticals/semicolons/lists.
function parseRef(ref) {
  if (!ref) return null
  const head = ref.split(/[(;]/)[0].trim() // drop parenthetical & secondary clauses
  const m = head.match(/^(.+?)\s*(제\d+조(?:의\d+)?)/)
  if (m) return { lawName: m[1].trim(), article: m[2].trim() }
  // no article token — law name only (strip trailing 제N항/호 noise just in case)
  const nameOnly = head.replace(/\s*제\d+(항|호|목).*$/, '').trim()
  return nameOnly ? { lawName: nameOnly, article: '' } : null
}

function officialUrl(lawName, article) {
  const base = `https://www.law.go.kr/법령/${encodeURIComponent(lawName)}`
  return article ? `${base}/${encodeURIComponent(article)}` : base
}

let changed = 0
const skipped = []
const lawCount = {}

for (const f of facts) {
  if (!f.lawUrl || !f.lawUrl.includes('casenote.kr')) continue
  const ref = parseRef(f.lawRef) || parseRef(f.subordinateLawRef)
  if (!ref || /부칙|별지|서식/.test(ref.lawName)) {
    skipped.push({ id: f.id, lawRef: f.lawRef, lawUrl: f.lawUrl, reason: ref ? 'non-canonical(부칙/별지/서식)' : 'unparseable' })
    continue
  }
  const url = officialUrl(ref.lawName, ref.article)
  lawCount[ref.lawName] = (lawCount[ref.lawName] || 0) + 1
  if (APPLY) {
    f.lawUrl = url
    f.history = f.history || []
    f.history.push({
      date: '2026-06-09',
      author: 'kms',
      note: 'casenote 미러 → 국가법령정보(law.go.kr) 공식 링크 전환 (OPEN API로 법령 검증)',
    })
  }
  changed++
}

console.log(APPLY ? '=== APPLIED ===' : '=== DRY RUN ===')
console.log('casenote facts to convert:', changed)
console.log('unique laws:', Object.keys(lawCount).length)
console.log(Object.entries(lawCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${v}× ${k}`).join('\n'))
if (skipped.length) {
  console.log('\nSKIPPED (no parseable lawRef):', skipped.length)
  for (const s of skipped) console.log('  ', s.id, '| ref:', JSON.stringify(s.lawRef), '| url:', s.lawUrl)
}

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(facts, null, 2) + '\n', 'utf8')
  console.log('\nwrote', path.relative(process.cwd(), FILE))
}
