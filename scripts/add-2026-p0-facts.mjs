// 2026 P0 개정 fact 7건 추가 + f_id0009 1차검증 승격.
// 근거: docs/superpowers/plans/2026-06-10-p0-verification-dossier.md (law.go.kr OPEN API 원문 확인)
// Run: node scripts/add-2026-p0-facts.mjs
import fs from 'node:fs'
import path from 'node:path'

const FILE = path.join(process.cwd(), 'content', 'facts.json')
const facts = JSON.parse(fs.readFileSync(FILE, 'utf8'))
const TODAY = '2026-06-10'
const H = (note) => ({ date: TODAY, author: 'kms', note })

const KACTA = 'src_kacta_2026_tax_changes'
const KPMG = 'src_kpmg_2025_tax_reform'
const LAWAPI = 'src_law_open_api'

const base = {
  asOf: TODAY,
  verifyStatus: '확정',
  primarySourceVerified: true,
  reviewerId: 'kms',
  nextReviewBy: '2027-03-31',
  localTaxRef: '',
  supersededRefs: '',
  sunsetDate: '',
  subordinateLawRef: '',
  implementationStatus: 'content_done',
}

const NEW_FACTS = [
  {
    ...base,
    id: 'f_ca0007',
    slug: 'ch10.business-income.year-end.installment',
    chapter: 'ch10',
    title: '사업소득 연말정산 추가납부세액 분납(신설)',
    claim: '연말정산 대상 사업소득의 원천징수의무자는 연말정산으로 추가 징수하여야 하는 세액(추가 납부세액)이 10만원을 초과하는 경우, 해당 과세기간의 다음 연도 2월분부터 4월분의 사업소득을 지급할 때까지 추가 납부세액을 나누어 원천징수할 수 있다(소득세법 제144조의2 제2항, 신설 2025.12.23). 거래계약 해지 등의 경우는 예외.',
    sourceType: 'LAW',
    sourceTitle: '소득세법 제144조의2(과세표준확정신고 예외 사업소득세액의 연말정산) 제2항 — OPEN API 현행본(시행 2026.04.21) 원문 확인',
    sourceIds: [LAWAPI, KACTA],
    lawRef: '소득세법 제144조의2 제2항',
    lawUrl: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%86%8C%EB%93%9D%EC%84%B8%EB%B2%95/%EC%A0%9C144%EC%A1%B0%EC%9D%982',
    effectiveDate: '2026-01-01',
    appliesFrom: '2026-01-01',
    appliesTo: '2026.1.1 이후 연말정산하는 분(보험모집인·방문판매원 등 연말정산 대상 사업소득)',
    incomeType: 'business',
    risk: 'high',
    changeType: '신설',
    previousValue: '분납 규정 없음(일시 원천징수)',
    confidenceScore: 90,
    scopeLimitations: '조문 내용은 OPEN API 현행본 원문 확인. 적용시기(2026.1.1 이후 연말정산분)는 한국세무사회 자료 기준 — 부칙 적용례 직접 확인 권장. 분납 신청 절차·원천징수이행상황신고서 표시 방식·홈택스 입력 항목은 서식 확인 필요.',
    implementationImpact: { content: true, ui: true, calculation: true, reporting: true, migration: false },
    history: [H('2026 P0: OPEN API로 §144조의2② 신설(2025.12.23) 원문 확인 후 등록')],
  },
  {
    ...base,
    id: 'f_nr0018',
    slug: 'nonresident.treaty.reduced-rate-application-filing',
    chapter: 'nonresident',
    title: '제한세율 적용신청서 세무서 제출의무(신설)',
    claim: '원천징수의무자는 비거주자(실질귀속자) 또는 국외투자기구로부터 제출받은 조세조약 제한세율 적용신청서등과 국외투자기구 신고서를 해당 국내원천소득 지급일이 속하는 연도의 다음 연도 2월 말일까지 납세지 관할 세무서장에게 제출하여야 한다(소득세법 제156조의6 제4항, 신설 2025.12.23). 종전에는 원천징수의무자 보관 의무 중심이었다.',
    sourceType: 'LAW',
    sourceTitle: '소득세법 제156조의6(비거주자 조세조약 제한세율 적용 신청) 제4항 — OPEN API 현행본 원문 확인',
    sourceIds: [LAWAPI, KPMG],
    lawRef: '소득세법 제156조의6 제4항',
    lawUrl: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%86%8C%EB%93%9D%EC%84%B8%EB%B2%95/%EC%A0%9C156%EC%A1%B0%EC%9D%986',
    effectiveDate: '2026-01-01',
    appliesFrom: '2026-01-01',
    appliesTo: '2026.1.1 이후 지급분 관련 제한세율 적용신청서(원천징수의무자)',
    incomeType: 'nonresident',
    risk: 'critical',
    changeType: '신설',
    previousValue: '원천징수의무자가 신청서를 제출받아 보관(세무서 제출의무 없음)',
    confidenceScore: 88,
    scopeLimitations: '소득세법(비거주자 개인) 측은 §156조의6④ 원문 확인. 외국법인(법인세법 제98조의6) 측은 현행본(시행 2026.01.02)에 동일 제출의무 조항 미확인 — KPMG 보고서만 근거이므로 법인세법 차기 시행본·부칙 확인 필요. 제출 서식·홈택스 경로 미확인. 적용시기는 KPMG 기준.',
    implementationImpact: { content: true, ui: true, calculation: false, reporting: true, migration: true },
    history: [H('2026 P0: OPEN API로 §156조의6④ 신설(2025.12.23) 원문 확인 후 등록. 법인세법 측은 확인필요로 유보')],
  },
  {
    ...base,
    id: 'f_c40017',
    slug: 'ch04.late-payment-penalty.2026-07-revision',
    chapter: 'ch4',
    title: '납부지연가산세 산정방법 개정(2026.7.1)',
    claim: '2025.12.23 개정 국세기본법은 납부지연가산세 산정에 ① 지정납부기한 다음 날부터 납부일까지 경과한 개월 수 기준의 월할 이자 가산(제47조의4 제1항 제1호의2 신설), ② 지정납부기한 미납세액의 3% 고정 가산(같은 항 제3호 신설), ③ 국세징수법 제10조에 따른 독촉 비용 포함(제4호), ④ 체납 국세가 납부고지서별·세목별 150만원 미만이면 월할·독촉비용 가산 면제(제8항), ⑤ 기간 5년 상한(제7항)을 도입했다. 원천징수 등 납부지연가산세(제47조의5)에도 월할 이자·독촉비용 요소가 추가되었으며 기존 한도(미납세액의 3%+일할이자 합계 10%, 전체 50%)는 유지된다. 2026.7.1 이후 지정납부기한이 도래하는 분부터 적용된다.',
    sourceType: 'LAW',
    sourceTitle: '국세기본법 제47조의4·제47조의5(개정 2025.12.23) — OPEN API 현행본(시행 2026.06.02) 원문 확인',
    sourceIds: [LAWAPI, KACTA],
    lawRef: '국세기본법 제47조의4 ; 국세기본법 제47조의5',
    lawUrl: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%AD%EC%84%B8%EA%B8%B0%EB%B3%B8%EB%B2%95/%EC%A0%9C47%EC%A1%B0%EC%9D%984',
    effectiveDate: '2026-07-01',
    appliesFrom: '2026-07-01',
    appliesTo: '2026.7.1 이후 지정납부기한이 도래하는 분(경과조치 있음)',
    incomeType: 'all',
    risk: 'high',
    changeType: '개정',
    previousValue: '일할 이자(22/100,000) 중심 산정, 독촉비용 미포함, 면제기준 150만원 미만 조항 이전 체계',
    confidenceScore: 88,
    scopeLimitations: '조문 내용은 OPEN API 원문 확인. 적용시기(2026.7.1)와 경과조치는 한국세무사회 자료 기준 — 부칙 직접 확인 권장. 가산세 계산기는 2026.7.1 전후 분기 처리 필요. 지방소득세 특별징수 가산세(지방세기본법)는 별도 체계.',
    implementationImpact: { content: true, ui: true, calculation: true, reporting: false, migration: false },
    history: [H('2026 P0: OPEN API로 §47조의4·47조의5 개정(2025.12.23) 원문 확인 후 등록')],
  },
  {
    ...base,
    id: 'f_c90012',
    slug: 'ch09.pension.lifetime-annuity-rate-3pct',
    chapter: 'ch9',
    title: '사적연금 종신수령 원천징수세율 3%(인하)',
    claim: '연금계좌 납입액 등을 원천으로 사망할 때까지 연금수령하는 대통령령으로 정하는 종신계약에 따라 받는 연금소득에 대한 원천징수세율은 100분의 3이다(소득세법 제129조 제1항 제5호의2 다목, 개정 2025.12.23). 종전 4%에서 인하되었다. 나이 기준 세율(70세 미만 5%, 70~80세 미만 4%, 80세 이상 3%)과 경합 시 낮은 세율을 적용한다.',
    sourceType: 'LAW',
    sourceTitle: '소득세법 제129조(원천징수세율) 제1항 제5호의2 — OPEN API 현행본 원문 확인(종신계약 100분의 3)',
    sourceIds: [LAWAPI, KACTA],
    lawRef: '소득세법 제129조 제1항 제5호의2',
    lawUrl: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%86%8C%EB%93%9D%EC%84%B8%EB%B2%95/%EC%A0%9C129%EC%A1%B0',
    effectiveDate: '2026-01-01',
    appliesFrom: '2026-01-01',
    appliesTo: '2026.1.1 이후 지급받는 사적연금(연금계좌) 종신계약 연금소득',
    incomeType: 'pension',
    risk: 'medium',
    changeType: '개정',
    previousValue: '종신계약 연금소득 원천징수세율 4%',
    confidenceScore: 88,
    scopeLimitations: '종신계약 3%는 원문 확인. 나이 기준 세율표(5/4/3%)의 세부 문구는 API 응답에서 위임 표현으로 요약되어 직접 인용 미완 — 통설·국세청 안내와 일치하나 정밀 재확인 권장. 적용시기는 한국세무사회 자료 기준.',
    implementationImpact: { content: true, ui: false, calculation: true, reporting: false, migration: false },
    history: [H('2026 P0: OPEN API로 §129①5의2 다목(종신 3%, 개정 2025.12.23) 원문 확인 후 등록')],
  },
  {
    ...base,
    id: 'f_c90013',
    slug: 'ch09.pension.deferred-retirement-tier-50pct',
    chapter: 'ch9',
    title: '이연퇴직소득 연금수령 감면 3단계(70/60/50%)',
    claim: '이연퇴직소득을 연금수령하는 경우 원천징수세율은 연금외수령 원천징수세율의 ① 연금 실제 수령연차 10년 이하분 70%, ② 10년 초과 20년 이하분 60%, ③ 20년 초과분 50%이다(소득세법 제129조 제1항 제5호의3, 개정 2025.12.23). 20년 초과 50% 구간이 신설되어 장기 연금수령 유인이 강화되었다.',
    sourceType: 'LAW',
    sourceTitle: '소득세법 제129조(원천징수세율) 제1항 제5호의3 — OPEN API 현행본 원문 확인',
    sourceIds: [LAWAPI, KACTA],
    lawRef: '소득세법 제129조 제1항 제5호의3',
    lawUrl: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%86%8C%EB%93%9D%EC%84%B8%EB%B2%95/%EC%A0%9C129%EC%A1%B0',
    effectiveDate: '2026-01-01',
    appliesFrom: '2026-01-01',
    appliesTo: '2026.1.1 이후 연금수령하는 이연퇴직소득(추정 — 부칙 확인 필요)',
    incomeType: 'retirement',
    risk: 'medium',
    changeType: '개정',
    previousValue: '10년 이하 70% / 10년 초과 60% (2단계)',
    confidenceScore: 85,
    scopeLimitations: '3단계 세율(70/60/50%)은 원문 확인. 50% 구간의 신설 시점·적용시기 부칙은 한국세무사회 자료 기준으로 2026.1.1 추정 — 직접 확인 권장. 참고: 외부 가이드의 "20년 이상 수령 시 3%" 주장은 오류(정확히는 연금외수령 세율의 50%).',
    implementationImpact: { content: true, ui: false, calculation: true, reporting: false, migration: false },
    history: [H('2026 P0: OPEN API로 §129①5의3(70/60/50%) 원문 확인 후 등록. 외부 가이드의 3% 주장 정정')],
  },
  {
    ...base,
    id: 'f_id0012',
    slug: 'interest-dividend.gross-up.11pct-2027',
    chapter: 'interest-dividend',
    title: '배당가산율(Gross-up) 10% → 11%(2027 적용)',
    claim: '배당소득 이중과세 조정을 위한 배당가산율이 100분의 10에서 100분의 11로 조정되었다(소득세법 제17조 제3항, 개정 2025.12.23 — 현행 조문 원문은 이미 100분의 11). 2027.1.1 이후 지급받는 소득분부터 적용된다(한국세무사회 자료 기준). 종합과세되는 내국법인 배당의 Gross-up 및 배당세액공제 계산에 영향.',
    sourceType: 'LAW',
    sourceTitle: '소득세법 제17조(배당소득) 제3항 — OPEN API 현행본 원문 "100분의 11" 확인',
    sourceIds: [LAWAPI, KACTA],
    lawRef: '소득세법 제17조 제3항',
    lawUrl: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%86%8C%EB%93%9D%EC%84%B8%EB%B2%95/%EC%A0%9C17%EC%A1%B0',
    effectiveDate: '2027-01-01',
    appliesFrom: '2027-01-01',
    appliesTo: '2027.1.1 이후 지급받는 배당소득(연말정산·종합소득 신고 반영은 2028)',
    incomeType: 'dividend',
    risk: 'medium',
    changeType: '개정',
    previousValue: '배당가산율 100분의 10',
    confidenceScore: 88,
    scopeLimitations: '조문 원문(100분의 11) 확인. 적용시기 2027.1.1은 한국세무사회 자료 기준 — 부칙 적용례 직접 확인 권장. 2027 watchlist 항목.',
    implementationImpact: { content: true, ui: false, calculation: true, reporting: true, migration: false },
    history: [H('2026 P0: OPEN API로 §17③ 11% 원문 확인. 2027 적용 — watchlist 등록')],
  },
  {
    ...base,
    id: 'f_c70014',
    slug: 'ch07.year-end.education-credit-expansion',
    chapter: 'ch7',
    title: '교육비 세액공제 확대(소득요건 폐지·예능학원)',
    claim: '교육비 특별세액공제의 기본공제대상자 요건이 "나이 및 소득의 제한을 받지 아니하되"로 개정되어 대상자 소득요건이 폐지되었고, 과세기간 종료일 현재 9세 미만 또는 초등학교 2학년 이하인 사람을 위해 예능을 교습하는 학원(학원법 제2조 제1호) 또는 대통령령으로 정하는 체육시설에 지급한 교육비가 공제대상에 추가되었다(소득세법 제59조의4 제3항, 개정 2025.12.23).',
    sourceType: 'LAW',
    sourceTitle: '소득세법 제59조의4(특별세액공제) 제3항 — OPEN API 현행본 원문 확인',
    sourceIds: [LAWAPI, KACTA],
    lawRef: '소득세법 제59조의4 제3항',
    lawUrl: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%86%8C%EB%93%9D%EC%84%B8%EB%B2%95/%EC%A0%9C59%EC%A1%B0%EC%9D%984',
    effectiveDate: '2026-01-01',
    appliesFrom: '2026-01-01',
    appliesTo: '2026.1.1 이후 지출분(2026년 귀속 연말정산부터)',
    incomeType: 'earned',
    risk: 'medium',
    changeType: '개정',
    previousValue: '기본공제대상자 소득요건 존재(연 100만원 이하), 예능학원·체육시설은 취학 전 아동만 공제',
    confidenceScore: 88,
    scopeLimitations: '조문 개정 내용 원문 확인. 적용시기는 한국세무사회 자료 기준 — 부칙 확인 권장. 공제 한도·대통령령 위임 세부(체육시설 범위·금액)는 시행령 확인 필요. 연말정산 화면(교육비 입력) 검증로직 변경 영향.',
    implementationImpact: { content: true, ui: true, calculation: true, reporting: true, migration: false },
    history: [H('2026 P0: OPEN API로 §59조의4③ 개정(2025.12.23) 원문 확인 후 등록')],
  },
]

// ── 추가 ──
const existingIds = new Set(facts.map((f) => f.id))
let added = 0
for (const nf of NEW_FACTS) {
  if (existingIds.has(nf.id)) {
    console.log('skip (exists):', nf.id)
    continue
  }
  facts.push(nf)
  added++
}

// ── f_id0009 승격: §104조의27 본문 원문 확인 반영 ──
const hd = facts.find((f) => f.id === 'f_id0009')
if (hd && !hd.primarySourceVerified) {
  hd.primarySourceVerified = true
  hd.confidenceScore = Math.max(hd.confidenceScore, 88)
  hd.asOf = TODAY
  hd.sunsetDate = '2028.12.31이 속하는 사업연도까지(법 본문 확인)'
  hd.claim +=
    ' [2026-06-10 법 본문 원문 확인: 배당 불감소 요건의 비교 기준은 "직전 사업연도에 발생한 배당소득이 2024년 12월 31일이 속하는 사업연도보다 감소하지 아니하였을 것"이며, 특례는 2028년 12월 31일이 속하는 사업연도까지 적용되고, 요건 충족 공시는 정기주주총회에서 이익배당을 결의한 날의 다음 날까지 하여야 한다.]'
  hd.sourceIds = ['src_law_open_api']
  hd.history.push(H('OPEN API로 조특법 §104조의27 본문 원문 확인 — 기준연도(2024)·한시(2028)·공시기한 보강, 1차검증 승격'))
}

fs.writeFileSync(FILE, JSON.stringify(facts, null, 2) + '\n', 'utf8')
console.log('added:', added, '| total:', facts.length, '| f_id0009 upgraded:', !!hd)
