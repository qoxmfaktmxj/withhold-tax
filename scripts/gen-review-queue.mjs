// Generate docs/REVIEW-QUEUE.md from content/facts.json — human tax-review queue.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/facts.json'), 'utf8'))

const NEW_CH = new Set(['nonresident', 'interest-dividend'])
const chTitle = {
  ch1: '소득세 기본구조', ch2: '법체계·세금분류', ch3: '원천징수 핵심', ch4: '가산세·신고실무',
  ch5: '거주자·해외파견', ch6: '근로소득 비과세 I', ch7: '신고서 작성·검증', ch8: '근로소득 비과세 II',
  ch9: '간이세액·퇴직소득', ch10: '사업·기타소득',
  nonresident: '비거주자·외국법인 원천징수 (신규)', 'interest-dividend': '이자·배당 원천징수 (신규)',
}
const chOrder = ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8','ch9','ch10','nonresident','interest-dividend']

function reason(f) {
  if (f.verifyStatus === '강의기반') return '강의기반 — 공식 1차 출처 미확정'
  if (NEW_CH.has(f.chapter)) return '신규 작성 장 — 원본 없이 1차출처 조사로 작성'
  if (f.verifyStatus === '확인필요') return '확인필요 — 해석여지/시행시점/하위법령'
  if (f.verifyStatus === '확정' && !f.primarySourceVerified) return '확정(2차 교차확인) — 1차 원문 직접확인 미완'
  return ''
}
function priority(f) {
  if (f.verifyStatus === '강의기반') return 0
  if (NEW_CH.has(f.chapter)) return 0
  if (f.verifyStatus === '확인필요' && f.risk === 'high') return 0
  if (f.verifyStatus === '확인필요') return 1
  if (f.verifyStatus === '확정' && !f.primarySourceVerified) return 2
  return 3 // 확정 + primarySourceVerified=true : no review needed
}

const buckets = { 0: [], 1: [], 2: [] }
for (const f of facts) {
  const p = priority(f)
  if (p <= 2) buckets[p].push(f)
}

const total = facts.length
const byStatus = facts.reduce((a, f) => ((a[f.verifyStatus] = (a[f.verifyStatus] || 0) + 1), a), {})
const p1cVerified = facts.filter((f) => f.verifyStatus === '확정' && f.primarySourceVerified).length

function row(f) {
  const law = f.lawRef || f.subordinateLawRef || '—'
  const note = (f.scopeLimitations || '').replace(/\n+/g, ' ').slice(0, 220)
  const url = f.lawUrl ? `[출처](${f.lawUrl})` : ''
  const claim = (f.claim || '').replace(/\n+/g, ' ').slice(0, 160)
  return `- **${f.title}** \`${f.verifyStatus}\`${f.primarySourceVerified ? '' : ' ·1차미확인'} · conf ${f.confidenceScore} · risk ${f.risk} ${url}\n  - 주장: ${claim}\n  - 근거: ${law}${f.subordinateLawRef ? ` / 시행령: ${f.subordinateLawRef}` : ''}\n  - 검토포인트: ${note || '—'}`
}

function section(title, list) {
  if (!list.length) return ''
  let s = `\n## ${title} (${list.length}건)\n`
  for (const c of chOrder) {
    const cf = list.filter((f) => f.chapter === c)
    if (!cf.length) continue
    s += `\n### ${chTitle[c] || c} \`${c}\` — ${cf.length}건\n`
    s += cf.map(row).join('\n') + '\n'
  }
  return s
}

let md = `# 원천징수 레퍼런스 — 세무 검토 큐

> 생성: facts.json(${total}건) 기준. 검토자: 세무 담당. 1차 출처(국가법령정보센터·국세청·홈택스·예규)와 대조해 \`확정\` 승격 또는 수정.
> 우선순위: **P0**(강의기반 + 신규 2장 + 고위험 확인필요) → **P1**(나머지 확인필요) → **P2**(확정이나 1차 원문 미확인 — 스팟체크).
> \`확정 + 1차원문확인(primarySourceVerified)\` ${p1cVerified}건은 검토 불요(참고).

## 요약
- 전체 fact: **${total}**
- 검증상태: 확정 ${byStatus['확정'] || 0} / 확인필요 ${byStatus['확인필요'] || 0} / 강의기반 ${byStatus['강의기반'] || 0}
- 검토 대상: **P0 ${buckets[0].length} · P1 ${buckets[1].length} · P2 ${buckets[2].length}** (합 ${buckets[0].length + buckets[1].length + buckets[2].length})

> 검토 후: facts.json의 해당 항목에서 verifyStatus를 \`확정\`으로, primarySourceVerified를 true로 갱신하고 history에 검토 기록 추가. 틀린 값은 claim 교정 + previousValue 기재.
`

md += section('P0 — 최우선 검토 (강의기반·신규장·고위험)', buckets[0])
md += section('P1 — 확인필요', buckets[1])
md += section('P2 — 확정·1차원문 미확인 (스팟체크)', buckets[2])

const out = path.join(ROOT, 'docs/REVIEW-QUEUE.md')
fs.writeFileSync(out, md, 'utf8')
console.log('wrote', out)
console.log('P0', buckets[0].length, 'P1', buckets[1].length, 'P2', buckets[2].length)
