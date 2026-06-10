---
title: "원천징수 사내 레퍼런스 고도화 개발 가이드"
subtitle: "대한민국 2026년 기준 · HR/인사시스템 개발자를 위한 콘텐츠·데이터·화면·운영 설계서"
author: "ChatGPT"
date: "2026-06-09"
lang: ko-KR
---

# 원천징수 사내 레퍼런스 고도화 개발 가이드

## 0. 이 문서의 목적

이 문서는 `qoxmfaktmxj/withhold-tax` 저장소를 **사내 원천징수 실무 레퍼런스**로 발전시키기 위한 개발 가이드다. 단순한 세무 요약 사이트가 아니라, HR/인사시스템 개발자가 화면·검증 로직·신고 지원 기능을 만들 때 바로 참고할 수 있는 **법령 기반 제품 명세서**를 목표로 한다.

최종 목표는 다음과 같다.

- 2026년 기준 원천징수 실무를 **소득유형별, 화면별, 로직별**로 이해할 수 있게 한다.
- 모든 핵심 사실에 **법령 조문, 시행일, 적용대상, 검증상태**를 연결한다.
- 개발자가 국세청·국가법령정보센터를 매번 찾아보지 않아도, 사내 레퍼런스에서 대부분의 판단 근거를 확인할 수 있게 한다.
- 다만 신고·납부·고객 자문 전에는 공식 법령·국세청·세무대리인 검토를 우선한다는 면책을 유지한다.

## 1. 현재 저장소 진단

현재 저장소는 이미 좋은 출발점을 가지고 있다.

### 1.1 이미 잘 되어 있는 점

- README 기준으로 프로젝트 목적이 명확하다. 인사시스템 개발자가 고객 질문, 화면 개발, 연말정산 프로젝트에서 원천징수 지식이 필요하다는 문제를 해결하려는 구조다. [S1]
- `Fact` 컴포넌트와 `facts.json`을 통해 법령 조문, 시행일, 검증상태를 본문에 연결한다. [S1]
- `확정`, `확인필요`, `강의기반` 검증상태를 둔 것은 세무 레퍼런스에 매우 중요하다. [S1]
- 2026 개정·시행 대시보드와 검토 임박 항목 큐를 이미 구상했다. [S1]
- 콘텐츠는 원천징수 핵심, 신고실무, 거주자·해외파견, 비과세, 간이세액, 퇴직소득, 사업·기타소득, 비거주자·외국법인, 이자·배당까지 넓게 잡혀 있다. [S1]
- `facts.json`에는 2026년 기준의 개정·신설 항목이 일부 반영되어 있다. 예를 들어 고배당기업 배당소득 과세특례와 원천징수 납부지연가산세 fact가 존재한다. [S2]

### 1.2 현재 한계

현재 구조는 “읽기 좋은 세무 레퍼런스”에는 가깝지만, “인사시스템 개발자가 바로 구현할 수 있는 사내 기준서”로는 아직 부족하다.

부족한 점은 크게 여섯 가지다.

1. **화면 기준 설명 부족**
   - 급여 화면, 비과세 항목 화면, 사업소득 지급 화면, 비거주자 지급 화면, 원천세 신고 화면별로 어떤 필드와 검증이 필요한지 아직 충분히 정리되어 있지 않다.

2. **계산 로직과 콘텐츠의 경계가 불명확**
   - 법령 설명은 있지만 실제 시스템에서 사용할 수 있는 rate table, due date rule, penalty rule, validation rule 형태가 부족하다.

3. **2026년 신규·변경 사항의 완전 반영 필요**
   - 사업소득 연말정산 추가 납부세액 분납제도, 제한세율 적용 신청서 제출 의무, 출산·육아 관련 비과세 한도 상향 등은 별도 fact와 화면 가이드가 필요하다. [S3][S4]

4. **검증 레벨이 더 세밀해야 함**
   - `확정`과 `확인필요`만으로는 개발 반영 가능 여부를 충분히 표현하기 어렵다. “공식 법령 확인 완료”, “국세청 안내 확인”, “2차 자료 확인”, “조문번호 재확인 필요”, “세무사 검토 필요”를 구분해야 한다.

5. **운영 절차가 부족**
   - 세법 개정, 시행령 개정, 국세청 안내, 예규·판례 변경을 누가 언제 확인하고 어떻게 반영하는지 프로세스가 필요하다.

6. **테스트와 CI 기준 부족**
   - `facts.json`의 스키마 검증만으로는 부족하다. 계산 예제, 적용일, 조문 링크, 본문 fact 참조, 변경 이력까지 자동 테스트해야 한다.

## 2. 고도화의 최종 모습

이 저장소는 다음 네 가지를 모두 포함해야 한다.

### 2.1 법령 해설서

- 소득세법, 법인세법, 국세기본법, 지방세기본법, 조세특례제한법, 시행령, 시행규칙, 국세청 안내, 예규를 주제별로 설명한다.
- 설명은 반드시 “누가, 누구에게, 어떤 소득을, 언제 지급할 때, 얼마를, 언제까지, 어디에 신고·납부하는가”로 풀어야 한다.

### 2.2 개발 명세서

- 화면별 필드 목록을 제공한다.
- 필수 입력값, 기본값, 검증 규칙, 예외 처리, 경고 문구를 제공한다.
- 소득유형별 계산 흐름을 제공한다.
- 법령 변경이 시스템에 미치는 영향을 `schema`, `UI`, `calculation`, `reporting`, `migration`으로 나누어 표시한다.

### 2.3 운영 매뉴얼

- 매년 세법 개정 이후 어떤 파일을 검토해야 하는지 정리한다.
- 변경 fact를 추가하는 절차를 제공한다.
- 세무 담당자, 개발자, 리뷰어 역할을 나눈다.
- 고객 문의 대응 시 어떤 근거를 제시해야 하는지 정리한다.

### 2.4 검증 가능한 데이터 저장소

- 사람이 읽는 MDX와 개발자가 쓰는 JSON rule을 분리한다.
- 모든 rule은 fact와 source를 참조한다.
- 모든 계산 예제는 테스트 케이스가 된다.
- 변경 이력과 시행일을 기준으로 과거 귀속분과 현재 귀속분을 구분한다.

## 3. 원칙

### 3.1 모든 핵심 사실은 fact로 만든다

본문에 “3%”, “10만원”, “2월 말”, “다음 달 10일” 같은 숫자가 나오면 반드시 fact로 분리한다.

좋은 fact의 조건은 다음과 같다.

- claim이 하나의 판단만 담는다.
- lawRef가 있다.
- sourceUrl이 있다.
- 시행일이 있다.
- 적용대상이 있다.
- 개발 영향이 있다.
- 다음 검토일이 있다.

### 3.2 적용일과 지급일을 분리한다

세법에서는 다음 날짜가 다를 수 있다.

- 법 시행일
- 소득 지급일
- 귀속연도
- 신고·납부기한
- 신청서 제출기한
- 경과조치 기준일

예를 들어 사업소득 연말정산 추가 납부세액 분납제도는 2026년 1월 1일 이후 연말정산하는 분부터 적용된다. [S3] 시스템은 “지급일”만 보지 말고 “연말정산 대상연도”와 “정산 실행일”도 확인해야 한다.

### 3.3 국세와 지방소득세를 절대 섞지 않는다

원천징수 소득세와 지방소득세 특별징수는 신고·납부 구조가 연결되어 있지만, 법적 근거와 가산세 체계가 다르다. 국세청 안내에 따르면 지방소득세 특별징수는 보통 원천징수세액의 10%로 계산되며, 비거주자 조세조약 적용 시 지방소득세 계산에 별도 안분 구조가 등장한다. [S5]

따라서 rule은 다음처럼 분리한다.

- nationalIncomeTaxRule
- localIncomeTaxRule
- ruralSpecialTaxRule
- penaltyRuleNational
- penaltyRuleLocal

### 3.4 법령 설명과 계산 엔진을 분리한다

MDX 본문은 설명을 담당한다. JSON rule은 계산과 화면 검증을 담당한다. 둘은 fact ID로 연결한다.

나쁜 구조는 다음과 같다.

```tsx
const tax = amount * 0.03;
```

좋은 구조는 다음과 같다.

```ts
const rule = getRule("business_income_wht_rate", paymentDate);
const tax = applyRate(amount, rule.rate);
```

### 3.5 “확정”은 보수적으로 쓴다

다음 조건을 만족해야 `확정`으로 둔다.

- 국가법령정보센터, 국세청, 홈택스, 법령 원문, 관보, 공식 예규 중 하나를 직접 확인했다.
- 조문번호와 시행일을 확인했다.
- claim과 조문 내용이 일치한다.
- 적용대상과 예외를 확인했다.
- 세무 리뷰어가 승인했다.

회계법인 보고서, 세무사회 요약자료, 강의자료만 확인한 경우에는 `확인필요`가 적절하다.

## 4. 2026년에 반드시 반영할 개정·변경 항목

아래 항목은 2026년 사내 레퍼런스의 P0 백로그로 잡아야 한다.

### 4.1 사업소득 연말정산 추가 납부세액 분납제도

한국세무사회 2026년 세금제도 자료에 따르면, 연말정산 사업소득을 지급하는 원천징수의무자가 연말정산으로 추가 징수해야 하는 세액이 10만원을 초과하는 경우 다음 연도 2월분부터 4월분의 사업소득을 지급할 때까지 해당 세액을 나누어 원천징수할 수 있다. 적용시기는 2026년 1월 1일 이후 연말정산하는 분부터다. [S3]

개발 반영 항목은 다음과 같다.

- 대상: 연말정산 대상 사업소득
- 조건: 추가 납부세액 100,000원 초과
- 기간: 다음 연도 2월분, 3월분, 4월분 지급 시
- 화면: 사업소득 연말정산 화면
- 데이터: `additionalTaxAmount`, `installmentAllowed`, `installmentPlan`
- 검증: 추가세액이 100,000원 이하이면 분납 UI 비활성화
- 문구: “10만원 초과 시 2월~4월 지급분에서 분납 원천징수 가능”
- 필요 확인: 분납 신청 절차, 원천징수이행상황신고서 표시 방식, 홈택스 입력 항목

### 4.2 비거주자·외국법인 제한세율 적용 신청서 제출 의무

KPMG 2025 Tax Reform 보고서에 따르면, 종전에는 비거주자나 외국법인이 조세조약상 제한세율을 적용받기 위해 신청서를 원천징수의무자에게 제출하고 원천징수의무자가 이를 보관하면 충분했다. 2026년 시행 개정에 따라 원천징수의무자는 해당 신청서를 과세당국에 제출해야 하며, 제출기한은 국내원천소득이 지급된 연도의 다음 해 2월 말이다. 2026년 1월 1일 이후 제출되는 신청서부터 적용된다. [S4]

개발 반영 항목은 다음과 같다.

- 대상: 비거주자, 외국법인, 국내원천소득
- 조건: 조세조약상 제한세율 적용
- 제출자: 원천징수의무자
- 제출기한: 소득 지급연도 다음 해 2월 말
- 화면: 비거주자/외국법인 지급 등록 화면
- 데이터: `beneficialOwner`, `treatyCountry`, `treatyArticle`, `applicationReceivedAt`, `submittedToTaxOfficeAt`
- 첨부: 제한세율 적용 신청서, 거주자증명서, 실질귀속자 증빙
- 알림: 제출기한 30일 전, 7일 전, 기한 경과
- 필요 확인: 소득세법/법인세법 정확한 조문번호, 서식명, 홈택스 제출 경로

### 4.3 출산·육아 관련 비과세 한도 상향

2026년 개정 자료는 출산·육아 지원 강화를 위해 근로자 또는 종교 관련 종사자 본인이나 배우자의 출산 및 6세 이하 자녀 보육과 관련하여 받는 수당의 비과세 한도를 월 20만원에서 해당 자녀 1명당 월 20만원으로 상향한다고 설명한다. 적용시기는 2026년 1월 1일 이후 지급받는 소득분부터다. [S3]

개발 반영 항목은 다음과 같다.

- 급여항목 마스터에 `childBasedMonthlyCap` 추가
- 직원 가족정보에서 6세 이하 자녀 수 참조
- 월별 비과세 한도 계산
- 과세/비과세 분리 표시
- 동일 월 중도입사·중도퇴사 처리 기준 검토
- 종교인 소득 화면에도 동일 항목 반영 여부 검토

### 4.4 교육비 세액공제 확대

2026년 자료는 기본공제 대상자의 소득과 관계없이 교육비 세액공제가 가능해지는 항목과, 9세 미만 또는 초등학교 2학년 이하 직계비속의 예능 학원·체육시설 교육비가 공제대상에 포함되는 내용을 설명한다. [S3]

개발 반영 항목은 다음과 같다.

- 연말정산 교육비 입력 화면의 대상자 소득 검증 완화
- 자녀 나이와 학년 필드 추가 또는 연계
- 예능학원·체육시설 지출 유형 추가
- 증빙 분류 코드 추가
- 연말정산 미리보기 계산 반영

### 4.5 상용근로자 간이지급명세서 월별 제출시기 유예

2026년 자료는 상용근로자 간이지급명세서 월별 제출 시기가 2026년 1월 1일에서 2027년 1월 1일 이후로 유예되었다고 설명한다. [S3]

개발 반영 항목은 다음과 같다.

- 2026년 알림에서 월별 제출 필수 경고 제거
- 2027년부터 활성화되는 feature flag 추가
- 연도별 신고 캘린더 rule에 반영
- 고객사 설정에 따라 사전 준비 모드 제공

### 4.6 납부지연가산세 산정방법 개선

2026년 자료는 납세자 또는 원천징수의무자가 지정납부기한까지 국세 등을 완납하지 않은 경우, 지정납부기한 다음 날부터 1개월이 경과할 때마다 납부지연가산세를 산정하는 방식과 독촉 비용 포함을 설명한다. 적용시기는 2026년 7월 1일 이후 지정납부기한이 도래하는 분부터이며, 경과조치가 있다. [S3]

국세청 원천징수 가산세 안내는 원천징수 등 납부지연가산세 산식과 한도를 설명한다. 원천징수세액 미납·과소납부 시 미납세액의 3%와 일수 가산을 적용하되 한도가 있으며, 원천징수이행상황신고서를 제출하지 않았더라도 납부하면 가산세가 없는 구조도 안내한다. [S8]

개발 반영 항목은 다음과 같다.

- 법정납부기한
- 지정납부기한
- 고지일
- 납부일
- 미납세액
- 3% 기본 가산
- 일수 가산
- 10% 한도
- 50% 한도
- 2026년 7월 1일 경과조치
- 지방소득세 특별징수 가산세 별도 계산

### 4.7 고배당기업 배당소득 과세특례

2026년 자료는 고배당기업 주식 배당소득에 대해 14%, 20%, 25%, 30% 구간의 분리과세 특례를 설명한다. 적용시기는 2026년 1월 1일 이후 지급되는 배당분부터다. [S3]

현재 `facts.json`에는 관련 fact가 있으나, 개발 관점에서는 다음을 보강해야 한다. [S2]

- 상장법인 여부
- 코넥스 제외 여부
- 기준연도 대비 현금배당 감소 여부
- 배당성향 조건
- 전년 대비 배당 증가율
- 기업가치제고계획 공시 여부
- 특례 적용기간
- 일반 배당 원천징수와의 차이
- 금융소득 종합과세와의 관계

### 4.8 배당가산율 10% → 11%

2026년 자료는 배당소득 이중과세 조정을 위한 배당가산율이 10%에서 11%로 조정되고, 2027년 1월 1일 이후 지급받는 소득분부터 적용된다고 설명한다. [S3]

이는 2026년 당장 적용되는 항목은 아니지만, 2027년 세법 대비 watchlist에 넣어야 한다.

### 4.9 사적연금 종신수령 원천징수세율 인하

검색 결과와 정책 요약 자료에서는 사적연금을 종신계약으로 수령할 때 원천징수세율을 4%에서 3%로 낮추는 내용이 확인된다. 다만 레퍼런스에 반영하기 전에는 소득세법 제129조, 시행령, 국세청 연금소득 안내를 직접 확인해야 한다.

개발 반영 항목은 다음과 같다.

- 연금 종류
- 연금수령자의 나이
- 종신계약 여부
- 퇴직소득을 연금으로 받는지 여부
- 20년 초과 수령 여부
- 원천징수세율
- 분리과세 선택 여부

검증상태는 처음에는 `확인필요`로 두는 것이 안전하다.

### 4.10 국내원천소득 범위 변경

KPMG 보고서는 2026년 개정에서 외국법인의 국내원천 기타소득과 배당소득 범위가 일부 명확화 또는 확대된다고 설명한다. 예를 들어 국내 소재 재산을 현저히 낮은 대가로 취득하는 경우 차액이 국내원천 기타소득으로 다뤄질 수 있고, 국내원천 배당과 연계된 장외파생거래 지급액이 국내원천 배당소득 범위에 포함된다. [S4]

개발 반영 항목은 다음과 같다.

- 비거주자·외국법인 지급 소득분류 목록 확장
- 국내원천소득 판정 체크리스트 추가
- 조세조약 제한세율 적용 전 기본 국내법 세율 표시
- “세무검토 필요” 경고 조건 추가

## 5. 추천 정보구조

현재 `content/chapters`와 `content/facts.json` 중심 구조를 유지하되, 개발용 rule과 운영용 자료를 추가한다.

```txt
app/
  page.tsx
  ch/[slug]/page.tsx
  updates-2026/page.tsx
  review-due/page.tsx
  screen-guides/[slug]/page.tsx
  calculators/[slug]/page.tsx
  calendar/page.tsx
  sources/page.tsx

content/
  chapters/
  playbooks/
  screen-guides/
  examples/
  facts.json
  sources.json
  law-watchlist.json
  tax-rules/
    2026/
      withholding-rates.json
      non-taxable-income.json
      deadlines.json
      payment-statements.json
      penalty-rules.json
      treaty-documents.json
      year-end-settlement.json
      local-income-tax.json

lib/
  facts/
  rules/
  sources/
  calculators/
  validation/
  search/

scripts/
  verify-facts.ts
  verify-rules.ts
  check-source-links.ts
  generate-search-index.ts
  generate-change-dashboard.ts
  law-watch.ts
```

## 6. 데이터 모델 설계

### 6.1 Source 모델

모든 출처는 `sources.json`에 먼저 등록한다.

```ts
export type SourceType =
  | "LAW"
  | "ENFORCEMENT_DECREE"
  | "ENFORCEMENT_RULE"
  | "NTS_GUIDE"
  | "NTS_FORM"
  | "TAX_RULING"
  | "CASE"
  | "TAX_FIRM_REPORT"
  | "BOOK"
  | "LECTURE";

export interface SourceRecord {
  id: string;
  type: SourceType;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
  jurisdiction: "KR";
  reliability: "primary" | "official-guide" | "secondary";
  notes?: string;
}
```

예시:

```json
{
  "id": "src_kacta_2026_tax_changes",
  "type": "TAX_FIRM_REPORT",
  "title": "2026 달라지는 세금제도",
  "publisher": "한국세무사회",
  "url": "https://www.kacta.or.kr/.../2026달라지는세금제도e_book.pdf",
  "accessedAt": "2026-06-09",
  "jurisdiction": "KR",
  "reliability": "secondary",
  "notes": "법령 원문 확인 전까지 보조 출처로 사용"
}
```

### 6.2 Fact 모델

현재 fact 구조에 다음 필드를 추가한다.

```ts
export type VerifyStatus =
  | "확정"
  | "확인필요"
  | "강의기반"
  | "검토중"
  | "폐지"
  | "대체";

export type ImplementationStatus =
  | "not_started"
  | "content_done"
  | "rule_done"
  | "ui_done"
  | "tests_done"
  | "released";

export interface FactRecord {
  id: string;
  slug: string;
  title: string;
  chapter: string;
  domain: string;
  incomeType?: string;
  claim: string;
  sourceIds: string[];
  sourceType: string;
  lawRef: string;
  lawUrl: string;
  effectiveDate?: string;
  appliesFrom?: string;
  appliesTo?: string;
  appliesUntil?: string;
  asOf: string;
  verifyStatus: VerifyStatus;
  primarySourceVerified: boolean;
  confidenceScore: number;
  risk: "low" | "medium" | "high" | "critical";
  changeType: "없음" | "신설" | "개정" | "폐지" | "유예";
  previousValue?: string;
  currentValue?: string;
  implementationStatus: ImplementationStatus;
  implementationImpact: {
    content: boolean;
    ui: boolean;
    calculation: boolean;
    reporting: boolean;
    migration: boolean;
  };
  nextReviewBy: string;
  reviewerId?: string;
  scopeLimitations?: string;
  localTaxRef?: string;
  history: Array<{
    date: string;
    author: string;
    note: string;
  }>;
}
```

### 6.3 Rule 모델

계산 가능한 규정은 fact와 별도로 rule로 만든다.

```ts
export interface TaxRule {
  ruleId: string;
  version: string;
  calendarYear: number;
  name: string;
  domain: string;
  incomeType: string;
  effectiveFrom: string;
  effectiveTo?: string;
  factIds: string[];
  inputs: Array<{
    key: string;
    type: "number" | "string" | "date" | "boolean" | "enum";
    required: boolean;
    description: string;
  }>;
  formula: {
    type: "rate" | "table" | "tier" | "date-rule" | "custom";
    expression: string;
  };
  rounding?: {
    base: number;
    method: "floor" | "round" | "ceil";
  };
  examples: Array<{
    title: string;
    input: Record<string, unknown>;
    expected: Record<string, unknown>;
  }>;
  warnings?: string[];
}
```

### 6.4 ScreenRequirement 모델

화면 가이드는 세무 설명과 UI 명세를 연결한다.

```ts
export interface ScreenRequirement {
  screenId: string;
  title: string;
  userRole: "payroll_admin" | "tax_admin" | "developer" | "reviewer";
  purpose: string;
  relatedFactIds: string[];
  fields: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    source: "manual" | "employee" | "payroll" | "rule";
    validation?: string;
    helpText?: string;
  }>;
  decisions: Array<{
    question: string;
    result: string;
    factIds: string[];
  }>;
  alerts: Array<{
    condition: string;
    severity: "info" | "warning" | "error";
    message: string;
  }>;
  testCases: string[];
}
```

## 7. P0 fact 추가 예시

### 7.1 사업소득 연말정산 분납 fact

```json
{
  "id": "f_2026_business_income_yas_installment",
  "slug": "business-income.year-end.installment-payment",
  "title": "사업소득 연말정산 추가 납부세액 분납제도",
  "chapter": "ch10",
  "domain": "business-income-year-end-settlement",
  "incomeType": "business_income",
  "claim": "연말정산 사업소득을 지급하는 원천징수의무자가 연말정산으로 추가 징수하여야 하는 세액이 10만원을 초과하는 경우, 다음 연도 2월분부터 4월분의 사업소득을 지급할 때까지 해당 세액을 나누어 원천징수할 수 있다.",
  "sourceIds": ["src_kacta_2026_tax_changes"],
  "sourceType": "TAX_FIRM_REPORT",
  "lawRef": "소득세법 제144조의2",
  "lawUrl": "",
  "effectiveDate": "2026-01-01",
  "appliesFrom": "2026-01-01",
  "appliesTo": "2026년 1월 1일 이후 연말정산하는 분",
  "asOf": "2026-06-09",
  "verifyStatus": "확인필요",
  "primarySourceVerified": false,
  "confidenceScore": 78,
  "risk": "high",
  "changeType": "신설",
  "previousValue": "분납 규정 없음",
  "currentValue": "추가 납부세액 10만원 초과 시 2월~4월 분납 가능",
  "implementationStatus": "not_started",
  "implementationImpact": {
    "content": true,
    "ui": true,
    "calculation": true,
    "reporting": true,
    "migration": false
  },
  "nextReviewBy": "2026-07-31",
  "scopeLimitations": "법령 원문과 홈택스 신고서 반영 방식 확인 필요",
  "history": [
    {
      "date": "2026-06-09",
      "author": "system",
      "note": "2026 세금제도 자료 기반 P0 후보 등록"
    }
  ]
}
```

### 7.2 제한세율 적용 신청서 제출 의무 fact

```json
{
  "id": "f_2026_treaty_reduced_rate_application_filing",
  "slug": "nonresident.treaty.reduced-rate-application-filing",
  "title": "비거주자·외국법인 제한세율 적용 신청서 세무당국 제출 의무",
  "chapter": "ch11",
  "domain": "nonresident-foreign-corp",
  "incomeType": "korean_source_income",
  "claim": "조세조약상 제한세율을 적용받기 위해 비거주자 또는 외국법인으로부터 받은 제한세율 적용 신청서와 관련 증빙을 원천징수의무자가 세무당국에 제출해야 하며, 제출기한은 소득 지급연도의 다음 해 2월 말이다.",
  "sourceIds": ["src_kpmg_2025_tax_reform_eng"],
  "sourceType": "TAX_FIRM_REPORT",
  "lawRef": "소득세법·법인세법 제한세율 적용 신청 관련 조문",
  "lawUrl": "",
  "effectiveDate": "2026-01-01",
  "appliesFrom": "2026-01-01",
  "appliesTo": "2026년 1월 1일 이후 제출되는 제한세율 적용 신청서",
  "asOf": "2026-06-09",
  "verifyStatus": "확인필요",
  "primarySourceVerified": false,
  "confidenceScore": 76,
  "risk": "critical",
  "changeType": "신설",
  "previousValue": "원천징수의무자 보관 중심",
  "currentValue": "세무당국 제출 의무 추가",
  "implementationStatus": "not_started",
  "implementationImpact": {
    "content": true,
    "ui": true,
    "calculation": false,
    "reporting": true,
    "migration": true
  },
  "nextReviewBy": "2026-07-31",
  "scopeLimitations": "정확한 조문번호, 서식명, 제출 경로, 홈택스 화면 확인 필요",
  "history": [
    {
      "date": "2026-06-09",
      "author": "system",
      "note": "KPMG 2025 Tax Reform 기반 P0 후보 등록"
    }
  ]
}
```

## 8. 화면별 개발 가이드

### 8.1 직원 세무 프로필 화면

목적은 직원별 원천징수 판단에 필요한 세무 속성을 관리하는 것이다.

필수 필드:

- 직원 ID
- 거주자 구분
- 내국인/외국인 구분
- 국적
- 체류자격
- 입국일
- 국내 거소 여부
- 세대주 여부
- 부양가족 수
- 6세 이하 자녀 수
- 장애인 여부
- 급여 원천징수 방식
- 연말정산 대상 여부
- 비과세 적용 대상 여부

검증 규칙:

- 비거주자로 표시되면 조세조약 검토 알림을 띄운다.
- 외국인이고 거주자 판단 근거가 없으면 `확인필요` 상태를 표시한다.
- 6세 이하 자녀 수가 있으면 출산·보육 비과세 한도 계산에 연결한다.
- 연말정산 제외 대상이면 연말정산 화면에서 자동 제외한다.

권장 UI:

- “세무 상태 요약” 카드
- “원천징수 영향” 카드
- “필요 증빙” 체크리스트
- “적용 법령” 접기 영역

### 8.2 급여 항목 마스터 화면

목적은 급여 항목별 과세·비과세·제출명세서 반영 여부를 관리하는 것이다.

필수 필드:

- 급여 항목 코드
- 항목명
- 과세 여부
- 비과세 유형
- 월 한도
- 자녀 수 기반 한도 여부
- 연간 한도
- 지급명세서 반영 여부
- 간이지급명세서 반영 여부
- 사회보험 보수 포함 여부
- 적용 시작일
- 적용 종료일
- 관련 fact ID

검증 규칙:

- 비과세 유형이 있으면 관련 법령 fact가 필요하다.
- 월 한도 항목은 지급월별 누적 체크가 필요하다.
- 자녀 수 기반 한도 항목은 직원 가족정보와 연결되어야 한다.
- 적용 종료일이 지난 항목은 신규 급여 입력에서 숨긴다.

### 8.3 월 급여 원천징수 계산 화면

목적은 월 급여 지급 시 소득세와 지방소득세를 계산하고, 사용자가 근거를 확인할 수 있게 하는 것이다.

표시해야 할 정보:

- 과세 급여
- 비과세 급여
- 공제 대상 가족 수
- 간이세액표 적용 결과
- 지방소득세 특별징수액
- 원천징수 합계
- 적용 rule 버전
- 적용 fact 목록

경고 조건:

- 직원 세무 프로필이 미완성인 경우
- 비과세 한도 초과분이 발생한 경우
- 적용일이 다른 급여 항목이 혼재된 경우
- 비거주자로 보이지만 거주자 세율이 적용된 경우

### 8.4 연말정산 화면

목적은 근로소득 연말정산과 세액공제 입력, 결과 검증을 지원하는 것이다.

필수 기능:

- 공제자료 입력
- 교육비 공제 검증
- 출산·보육 비과세 반영 내역 표시
- 추가 납부세액/환급세액 계산
- 법령 변경 영향 안내
- 연도별 rule 선택

2026년 보강 포인트:

- 교육비 공제 대상자 소득 요건 변경 반영
- 예능학원·체육시설 교육비 항목 추가
- 6세 이하 자녀 관련 비과세 한도 변경 반영

### 8.5 사업소득 지급 및 연말정산 화면

목적은 사업소득 원천징수와 연말정산 대상 사업소득 정산을 지원하는 것이다.

필수 필드:

- 지급 대상자
- 사업자등록 여부
- 인적용역 여부
- 지급 금액
- 필요경비율 적용 여부
- 원천징수세율
- 지방소득세
- 지급일
- 신고월
- 연말정산 대상 여부
- 추가 납부세액
- 분납 적용 여부
- 분납 계획

2026년 분납 UI:

```txt
추가 납부세액: 150,000원
분납 가능 여부: 가능
분납 기간: 2027년 2월분 ~ 4월분
권장 분납액: 50,000원 × 3개월
상태: 세무 검토 필요
```

검증 규칙:

- 추가 납부세액이 100,000원 이하이면 분납 불가
- 2월~4월 지급 예정액이 없으면 경고
- 분납월의 원천징수액이 지급액보다 크면 경고
- 원천징수이행상황신고서 반영 방식 확인 전에는 `확인필요` 배지 표시

### 8.6 비거주자·외국법인 지급 화면

목적은 국내원천소득 지급 시 원천징수, 조세조약, 제한세율 신청서, 제출기한을 관리하는 것이다.

필수 필드:

- 지급 대상자 유형
- 거주지국
- 국내원천소득 유형
- 지급 금액
- 국내법 기본세율
- 조세조약 적용 여부
- 제한세율
- 제한세율 적용 신청서 수령일
- 거주자증명서 수령일
- 실질귀속자 확인 여부
- 세무당국 제출일
- 제출기한
- 관련 첨부파일

경고 조건:

- 조세조약 적용을 선택했는데 신청서가 없는 경우
- 신청서 수령 후 세무당국 제출 상태가 없는 경우
- 다음 해 2월 말 제출기한이 임박한 경우
- 실질귀속자 확인이 불충분한 경우
- 국내원천소득 분류가 불명확한 경우

권장 문구:

> 제한세율을 적용하려면 신청서와 증빙 수령·보관뿐 아니라 세무당국 제출 의무가 발생할 수 있습니다. 제출기한과 서식은 세무담당자 확인 후 확정하세요.

### 8.7 원천세 신고·납부 캘린더

국세청 안내에 따르면 원천징수세액은 원칙적으로 소득 지급일이 속하는 달의 다음 달 10일까지 신고·납부한다. 반기별 납부 승인을 받은 경우에는 1월~6월 지급분은 7월 10일, 7월~12월 지급분은 다음 해 1월 10일까지다. [S6]

캘린더 기능:

- 월별 신고·납부기한 표시
- 반기별 납부 사업장 여부 반영
- 지급명세서 제출기한 표시
- 간이지급명세서 제출기한 표시
- 비거주자 제한세율 신청서 제출기한 표시
- 기한 30일 전 알림
- 기한 7일 전 알림
- 기한 경과 경고

필수 데이터:

```json
{
  "dueId": "monthly_wht_payment",
  "name": "월별 원천세 신고·납부",
  "basis": "payment_month_next_10th",
  "factIds": ["f_nts_due_monthly_wht"],
  "appliesTo": ["withholding_agent"],
  "exceptions": ["semi_annual_approved"]
}
```

### 8.8 가산세 계산기

목적은 원천징수세액 미납·과소납부 시 예상 가산세를 계산하고 근거를 제공하는 것이다.

입력값:

- 세목
- 소득유형
- 법정납부기한
- 지정납부기한
- 납부일
- 납부고지일
- 미납세액
- 지방소득세 포함 여부
- 2026년 7월 1일 전후 적용 여부

출력값:

- 기본 가산세
- 일수 가산세
- 10% 한도 적용 여부
- 50% 한도 적용 여부
- 지방소득세 가산세
- 총 예상 가산세
- 계산식
- 적용 fact 목록

주의:

- 공식 신고 전 세무담당자 검토 필요 문구를 고정 표시한다.
- 납부고지 이후 계산은 법령과 고지서 기준이 다를 수 있으므로 확인필요로 표시한다.

### 8.9 fact 관리자 화면

목적은 세무 지식이 운영 데이터로 유지되도록 하는 것이다.

필수 기능:

- fact 검색
- 상태별 필터
- 시행일별 필터
- 소득유형별 필터
- 출처별 필터
- 변경 이력 보기
- 연결된 MDX 본문 보기
- 연결된 rule 보기
- 연결된 테스트 보기
- 다음 검토일 수정
- 리뷰어 승인 기록

검증 규칙:

- `확정` fact는 primary source가 있어야 한다.
- `critical` risk fact는 reviewerId가 있어야 한다.
- `calculation` impact가 true인 fact는 rule이 있어야 한다.
- `ui` impact가 true인 fact는 screen guide가 있어야 한다.

## 9. 계산 로직 설계

### 9.1 원천징수 판단 순서

모든 소득유형에 대해 다음 순서를 통일한다.

1. 지급자가 원천징수의무자인지 판단한다.
2. 수취자가 거주자인지 비거주자인지 판단한다.
3. 소득유형을 분류한다.
4. 비과세 또는 과세제외 여부를 판단한다.
5. 과세표준 또는 지급금액을 확정한다.
6. 국내법 세율 또는 간이세액표를 적용한다.
7. 조세조약 또는 감면 규정을 적용한다.
8. 지방소득세 특별징수를 계산한다.
9. 농어촌특별세가 있으면 계산한다.
10. 신고·납부기한을 산정한다.
11. 지급명세서·간이지급명세서 제출기한을 산정한다.
12. 결과와 근거 fact를 함께 저장한다.

### 9.2 세율 rule 예시

국세청 원천징수 세율 안내는 거주자·내국법인에 대한 이자·배당·사업·근로·연금·기타소득 세율과 비거주자·외국법인에 대한 국내원천소득 세율을 안내한다. [S7]

```json
{
  "ruleId": "resident_business_income_wht_rate_2026",
  "version": "2026.1.0",
  "calendarYear": 2026,
  "name": "거주자 사업소득 원천징수세율",
  "domain": "withholding-rate",
  "incomeType": "business_income",
  "effectiveFrom": "2026-01-01",
  "factIds": ["f_resident_business_income_rate"],
  "inputs": [
    {
      "key": "grossPayment",
      "type": "number",
      "required": true,
      "description": "지급 총액"
    }
  ],
  "formula": {
    "type": "rate",
    "expression": "grossPayment * 0.03"
  },
  "rounding": {
    "base": 10,
    "method": "floor"
  },
  "examples": [
    {
      "title": "사업소득 1,000,000원 지급",
      "input": { "grossPayment": 1000000 },
      "expected": { "nationalTax": 30000 }
    }
  ]
}
```

### 9.3 지방소득세 rule 예시

```json
{
  "ruleId": "local_income_tax_special_wht_default_2026",
  "version": "2026.1.0",
  "calendarYear": 2026,
  "name": "지방소득세 특별징수 기본 계산",
  "domain": "local-income-tax",
  "incomeType": "all",
  "effectiveFrom": "2026-01-01",
  "factIds": ["f_local_income_tax_special_wht_default"],
  "formula": {
    "type": "rate",
    "expression": "nationalIncomeTax * 0.10"
  },
  "warnings": [
    "조세조약 적용 비거주자 소득은 별도 안분 규칙 확인"
  ]
}
```

### 9.4 납부지연가산세 rule 예시

```json
{
  "ruleId": "national_wht_late_payment_penalty_2026",
  "version": "2026.1.0",
  "calendarYear": 2026,
  "name": "원천징수 납부지연가산세",
  "domain": "penalty",
  "incomeType": "all",
  "effectiveFrom": "2026-01-01",
  "factIds": ["f_a00004"],
  "inputs": [
    { "key": "unpaidTax", "type": "number", "required": true, "description": "미납세액" },
    { "key": "dueDate", "type": "date", "required": true, "description": "법정납부기한" },
    { "key": "paymentDate", "type": "date", "required": true, "description": "실제 납부일" },
    { "key": "noticeDate", "type": "date", "required": false, "description": "납부고지일" }
  ],
  "formula": {
    "type": "custom",
    "expression": "min(unpaidTax * 0.50, unpaidTax * 0.03 + dailyPenalty)"
  },
  "warnings": [
    "2026-07-01 이후 지정납부기한 관련 개정 규정 별도 적용 필요",
    "지방소득세 가산세는 별도 rule로 계산"
  ]
}
```

## 10. 콘텐츠 작성 가이드

### 10.1 챕터 표준 구조

각 챕터는 다음 순서로 작성한다.

```mdx
# 챕터 제목

## 이 장에서 해결하는 질문

## 1분 요약

## 적용 대상

## 원천징수 판단 흐름

## 법령 근거

## 화면 구현 포인트

## 계산 예시

## 자주 틀리는 부분

## 2026년 변경사항

## 개발 체크리스트

## 관련 fact
```

### 10.2 문장 작성 원칙

- 한 문장에는 하나의 판단만 담는다.
- 금액, 세율, 기한은 반드시 fact와 연결한다.
- “대체로”, “보통”, “일반적으로”라는 표현을 쓰면 예외를 함께 적는다.
- “2026년 현재”라는 표현에는 `asOf` 날짜를 연결한다.
- 세무담당자 확인이 필요한 부분은 숨기지 않는다.

### 10.3 개발자용 콜아웃

다음 콜아웃을 표준화한다.

```mdx
<DevNote title="화면 구현 포인트">
  이 항목은 지급월별 누적 한도 계산이 필요합니다.
</DevNote>

<TaxRisk level="high">
  조세조약 적용 여부는 증빙 수령 전 자동 적용하지 마세요.
</TaxRisk>

<SourceRequired>
  이 claim은 법령 원문 확인 전까지 확인필요로 유지합니다.
</SourceRequired>
```

## 11. 컴포넌트 설계

### 11.1 핵심 컴포넌트

- `Fact`
- `SourcePill`
- `VerifyStatusBadge`
- `EffectiveDateBadge`
- `ChangeTypeBadge`
- `LawRefLink`
- `RuleCard`
- `FormulaBox`
- `ScreenSpec`
- `Checklist`
- `DueDateCard`
- `PenaltyCalculator`
- `WithholdingRateTable`
- `SourceDiffPanel`
- `ReviewQueueCard`
- `TaxRiskCallout`

### 11.2 Fact 컴포넌트 개선

현재 fact는 출처와 검증상태 중심이다. 앞으로는 개발 영향도 같이 보여준다.

표시 항목:

- 제목
- claim
- 법령 조문
- 시행일
- 적용대상
- 검증상태
- 위험도
- 개발 영향
- 다음 검토일
- 관련 화면
- 관련 rule

### 11.3 ScreenSpec 컴포넌트

화면별 구현 요건을 문서화한다.

```tsx
<ScreenSpec
  id="nonresident-payment"
  title="비거주자·외국법인 지급 등록"
  requiredFields={[
    "payeeType",
    "residenceCountry",
    "incomeType",
    "treatyApplied",
    "applicationReceivedAt"
  ]}
  relatedFacts={[
    "f_2026_treaty_reduced_rate_application_filing"
  ]}
/>
```

## 12. 검색과 탐색 기능

### 12.1 검색 인덱스 필드

검색 인덱스에는 다음을 포함한다.

- 제목
- 본문 요약
- 소득유형
- 법령명
- 조문번호
- 시행일
- 변경유형
- 위험도
- 화면 ID
- fact ID
- 동의어

### 12.2 추천 동의어

- 원천세 = 원천징수세액
- 지방세 = 지방소득세 특별징수
- 사업소득 3.3 = 사업소득 원천징수 3% + 지방소득세 0.3%
- 프리랜서 = 인적용역 사업소득
- 비거주자 = non-resident
- 제한세율 = treaty reduced rate
- 지급명세서 = payment statement
- 간이지급명세서 = simplified payment statement
- 연말정산 = year-end settlement

### 12.3 필터

- 연도
- 소득유형
- 화면
- 변경유형
- 검증상태
- 위험도
- 출처유형
- 다음 검토월

## 13. 2026 업데이트 대시보드 개선

현재 대시보드는 `facts.json`에서 개정·신설 항목을 수집하는 방향이다. 이를 개발용 영향도 중심으로 확장한다.

필수 카드:

- 올해 시행
- 내년 시행 예정
- 2026년 중간 시행
- 조문번호 확인 필요
- 계산 로직 영향 있음
- UI 영향 있음
- 신고서 영향 있음
- 고객 공지 필요
- 세무 리뷰 대기

각 카드에는 다음 정보를 표시한다.

- 변경 제목
- 시행일
- 적용대상
- 영향 영역
- 검증상태
- 담당자
- PR 링크
- 관련 테스트 상태

## 14. 법령 변경 감시 체계

### 14.1 정기 일정

매년 다음 일정으로 운영한다.

- 1월: 전년도 말 통과 세법의 시행 여부 확인
- 2월~3월: 시행령·시행규칙 후속 개정 확인
- 5월~6월: 국세청 안내, 신고서, 서식, 홈택스 변경 확인
- 7월~8월: 세법개정안 발표 확인
- 9월~11월: 국회 심의 상황 확인
- 12월: 최종 통과 법률과 부칙 확인

### 14.2 watchlist 구조

```json
{
  "watchId": "watch_2027_dividend_gross_up_rate",
  "title": "배당가산율 10%에서 11%로 조정",
  "expectedEffectiveDate": "2027-01-01",
  "sourceIds": ["src_kacta_2026_tax_changes"],
  "status": "watching",
  "owner": "tax-owner",
  "nextCheckDate": "2026-12-15",
  "impact": ["content", "calculation", "year_end_settlement"],
  "notes": "2027년 지급분부터 적용 여부와 시행령 반영 확인"
}
```

### 14.3 자동화 아이디어

- 법령 URL 링크 상태 확인
- 국세청 원천징수 메뉴 변경 감지
- `asOf` 180일 초과 fact 알림
- `확인필요` fact Slack 알림
- 시행일 30일 전 미구현 rule 알림
- PR 생성 템플릿 자동 작성

## 15. 테스트 전략

### 15.1 스키마 테스트

- `facts.json`은 zod로 검증한다.
- `sources.json`은 URL, 출처유형, 접근일을 필수로 둔다.
- `tax-rules`는 입력값, formula, examples를 필수로 둔다.

### 15.2 링크 테스트

- 모든 `lawUrl`이 200 또는 허용된 리다이렉트인지 확인한다.
- 국세청·국가법령정보센터 링크는 별도 retry를 둔다.
- 접근 실패 시 `linkStatus: unstable`로 기록한다.

### 15.3 fact 참조 테스트

- MDX의 `<F id="..." />`가 실제 fact에 존재해야 한다.
- `calculation` impact fact는 rule에서 참조되어야 한다.
- `ui` impact fact는 screen guide에서 참조되어야 한다.
- `critical` risk fact는 reviewerId가 있어야 한다.

### 15.4 계산 테스트

- 세율 rule은 최소 3개 예제를 가진다.
- 경계값 테스트를 포함한다.
- 시행일 전후 테스트를 포함한다.
- 반올림·절사 테스트를 포함한다.
- 국세와 지방소득세를 분리 검증한다.

### 15.5 콘텐츠 품질 테스트

- 금액·세율·기한이 본문에 나오면 fact 연결이 있어야 한다.
- `2026년 현재` 문구가 있으면 asOf가 있어야 한다.
- `확정` fact는 primary source가 있어야 한다.
- `확인필요` fact는 review due date가 90일 이내여야 한다.

### 15.6 GitHub Actions 예시

```yaml
name: reference-quality-gate

on:
  pull_request:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run validate:facts
      - run: npm run validate:rules
      - run: npm run validate:content
      - run: npm run build
```

## 16. 개발 로드맵

### Phase 0. 기준선 확보

목표는 현재 저장소를 안전하게 빌드·검증 가능한 상태로 만드는 것이다.

작업:

- README와 실제 파일 구조 일치 확인
- `npm install`, `npm test`, `npm run build` 확인
- `facts.json` 스키마 오류 확인
- 현재 fact 전체 목록 CSV export
- 현재 `확인필요`, `강의기반`, `primarySourceVerified=false` 목록 생성

산출물:

- `docs/CURRENT-STATE.md`
- `docs/FACT-AUDIT-2026-06.md`
- `docs/BUILD-CHECK.md`

완료 기준:

- main branch build 성공
- fact validation 성공
- 검토 큐 자동 생성 가능

### Phase 1. 출처·fact 모델 확장

작업:

- `sources.json` 추가
- fact schema 확장
- source ID 기반 참조로 전환
- source reliability 표시
- fact 관리자/목록 페이지 보강

산출물:

- `content/sources.json`
- `lib/facts/schema.ts` 개정
- `scripts/verify-facts.ts`
- `/sources` 페이지

완료 기준:

- 모든 fact가 sourceIds를 가진다.
- 확정 fact의 primary source 여부가 자동 검증된다.

### Phase 2. 2026 P0 개정사항 반영

작업:

- 사업소득 연말정산 분납 fact 추가
- 제한세율 적용 신청서 제출 의무 fact 추가
- 출산·육아 비과세 fact 추가
- 교육비 세액공제 fact 추가
- 간이지급명세서 유예 fact 추가
- 납부지연가산세 2026-07-01 개정 fact 추가
- 사적연금 종신수령 3% fact는 확인필요로 추가

산출물:

- `docs/2026-CHANGELOG.md`
- `content/chapters` 개정
- `content/facts.json` 개정
- `/updates-2026` 보강

완료 기준:

- 모든 P0 변경사항이 본문과 fact에 연결된다.
- 1차 출처 확인 전 항목은 확정으로 표시하지 않는다.

### Phase 3. 화면 가이드 추가

작업:

- 직원 세무 프로필 화면 가이드
- 급여 항목 마스터 화면 가이드
- 월 급여 원천징수 계산 화면 가이드
- 연말정산 화면 가이드
- 사업소득 지급/연말정산 화면 가이드
- 비거주자·외국법인 지급 화면 가이드
- 신고·납부 캘린더 화면 가이드
- 가산세 계산기 화면 가이드

산출물:

- `content/screen-guides/*.mdx`
- `/screen-guides` 라우트
- `ScreenSpec` 컴포넌트

완료 기준:

- 각 화면 가이드는 필드, 검증, 경고, 관련 fact를 포함한다.

### Phase 4. rule 기반 계산·검증 추가

작업:

- withholding-rates rule 추가
- non-taxable-income rule 추가
- deadlines rule 추가
- penalty rule 추가
- local-income-tax rule 추가
- treaty-documents rule 추가
- calculator 테스트 추가

산출물:

- `content/tax-rules/2026/*.json`
- `lib/rules`
- `/calculators` 라우트
- Vitest 계산 테스트

완료 기준:

- 대표 소득유형의 계산 예제가 테스트로 검증된다.
- rule마다 fact 연결이 있다.

### Phase 5. 운영 자동화

작업:

- `law-watchlist.json` 추가
- review due 알림
- source link checker
- fact freshness checker
- PR 템플릿 추가
- issue template 추가

산출물:

- `docs/OPERATIONS.md`
- `.github/ISSUE_TEMPLATE/tax-change.yml`
- `.github/pull_request_template.md`
- `scripts/law-watch.ts`

완료 기준:

- 새 법령 변경사항을 issue로 등록하고 PR에서 검증할 수 있다.

## 17. PR 템플릿

```md
## 변경 요약

## 변경 유형
- [ ] 신규 fact
- [ ] 기존 fact 수정
- [ ] 화면 가이드 수정
- [ ] 계산 rule 수정
- [ ] 테스트 추가
- [ ] 문서 수정

## 법령·출처
- Source ID:
- 법령 조문:
- 시행일:
- 적용대상:

## 검증상태
- [ ] 확정
- [ ] 확인필요
- [ ] 강의기반

## 개발 영향
- [ ] 콘텐츠
- [ ] UI
- [ ] 계산
- [ ] 신고/제출
- [ ] 마이그레이션

## 체크리스트
- [ ] fact schema 통과
- [ ] source 등록 완료
- [ ] 본문에서 fact 참조
- [ ] rule 필요 시 추가
- [ ] 테스트 추가
- [ ] 리뷰어 지정
```

## 18. Issue 템플릿

```yaml
name: 세법 변경사항 반영
description: 원천징수 관련 법령·예규·국세청 안내 변경사항 등록
body:
  - type: input
    id: title
    attributes:
      label: 변경 제목
  - type: textarea
    id: summary
    attributes:
      label: 요약
  - type: input
    id: source
    attributes:
      label: 출처 URL
  - type: input
    id: law-ref
    attributes:
      label: 법령 조문
  - type: input
    id: effective-date
    attributes:
      label: 시행일
  - type: dropdown
    id: impact
    attributes:
      label: 영향 영역
      multiple: true
      options:
        - 콘텐츠
        - UI
        - 계산
        - 신고/제출
        - 마이그레이션
  - type: dropdown
    id: risk
    attributes:
      label: 위험도
      options:
        - low
        - medium
        - high
        - critical
```

## 19. 운영 역할

### 19.1 Tax Owner

- 법령 변경사항을 확인한다.
- fact의 claim이 세법상 맞는지 검토한다.
- 확정 여부를 승인한다.
- 고객 공지 필요 여부를 판단한다.

### 19.2 Content Owner

- MDX 본문을 작성한다.
- 개발자가 이해할 수 있도록 예시와 화면 포인트를 추가한다.
- 기존 챕터와 용어를 일관되게 유지한다.

### 19.3 Developer

- schema, rule, component, page를 구현한다.
- 계산 테스트를 추가한다.
- 화면 가이드와 실제 시스템 간 차이를 기록한다.

### 19.4 Reviewer

- 출처 링크와 조문번호를 확인한다.
- fact와 본문 연결을 확인한다.
- 위험도 높은 항목은 2인 검토한다.

## 20. 위험 관리

### 20.1 절대 하면 안 되는 것

- 2차 자료만 보고 `확정`으로 표시하지 않는다.
- 국세와 지방소득세를 한 rule에 섞지 않는다.
- 시행일을 무시하고 최신 세율만 하드코딩하지 않는다.
- 비거주자 조세조약을 증빙 없이 자동 적용하지 않는다.
- 고객에게 세무 자문처럼 보이는 단정 문구를 노출하지 않는다.
- “원천징수 3.3%”처럼 관용 표현만 쓰고 법적 구조를 생략하지 않는다.

### 20.2 고위험 항목

- 비거주자·외국법인 지급
- 조세조약 제한세율
- 퇴직소득
- 연금소득
- 고배당기업 특례
- 가산세
- 연말정산 공제요건
- 비과세 한도
- 지급명세서 제출기한

고위험 항목은 다음 조건을 만족해야 배포한다.

- primary source 확인
- 세무 리뷰어 승인
- 테스트 케이스 존재
- 화면 경고 문구 존재
- 변경 이력 기록

## 21. 내부 배포 전략

### 21.1 사용자 그룹

- HR 개발자
- 급여 운영자
- 세무 담당자
- 고객지원 담당자
- 영업/컨설팅 담당자

### 21.2 첫 화면 구성

첫 화면에는 다음 카드가 있어야 한다.

- 2026년 원천징수 변경사항
- 오늘 기준 검토 필요 항목
- 소득유형별 바로가기
- 화면 개발 가이드 바로가기
- 원천세 신고·납부 캘린더
- 가산세 계산기
- 비거주자 지급 체크리스트
- 출처·검증상태 안내

### 21.3 온보딩 문서

신규 개발자를 위해 다음 문서를 제공한다.

- 원천징수 30분 입문
- 소득유형별 세율 요약
- 급여 화면 개발 체크리스트
- 사업소득 지급 체크리스트
- 비거주자 지급 체크리스트
- 연말정산 개발 체크리스트
- fact 추가 방법
- rule 추가 방법

## 22. “완성”의 기준

다음 조건을 만족하면 사내 레퍼런스 1차 완성으로 볼 수 있다.

- 2026년 P0 개정사항이 모두 fact로 등록되어 있다.
- 각 P0 fact는 본문, 화면 가이드, rule 또는 watchlist와 연결되어 있다.
- 대표 소득유형의 세율과 신고기한 rule이 존재한다.
- 급여, 사업소득, 비거주자, 신고납부, 가산세 화면 가이드가 존재한다.
- `확인필요` 항목은 review due date와 담당자가 지정되어 있다.
- GitHub Actions에서 fact, rule, content, build가 통과한다.
- 세무 리뷰어가 고위험 항목을 승인했다.
- 내부 개발자가 법령 사이트를 열지 않고도 화면 설계 초안을 만들 수 있다.

## 23. 우선순위 백로그

### P0. 즉시 개발

- `sources.json` 추가
- fact schema 확장
- 2026 P0 개정 fact 추가
- 사업소득 연말정산 분납 화면 가이드
- 비거주자 제한세율 신청서 제출 화면 가이드
- 출산·육아 비과세 한도 rule
- 신고·납부기한 rule
- 가산세 rule 보강
- PR 템플릿과 issue 템플릿 추가

### P1. 1차 배포 후

- 계산기 3종 추가
  - 사업소득 원천징수
  - 지방소득세 특별징수
  - 납부지연가산세
- `/screen-guides` 검색 페이지
- `/sources` 신뢰도 페이지
- `law-watchlist.json`
- 테스트 케이스 50개 이상

### P2. 고도화

- 홈택스 신고서 입력 가이드
- 지급명세서/간이지급명세서 자동 캘린더
- 비거주자 조세조약 체크리스트
- 영문 요약 페이지
- Slack/메일 알림
- 내부 API 제공
- 고객지원 답변 템플릿

## 24. 추천 작업 순서

1. 브랜치 생성: `feature/internal-reference-roadmap`
2. `content/sources.json` 추가
3. fact schema 확장
4. 기존 fact를 sourceIds 구조로 마이그레이션
5. P0 fact 7개 추가
6. `/updates-2026`에서 P0 변경 표시
7. `/screen-guides/business-income-year-end` 추가
8. `/screen-guides/nonresident-payment` 추가
9. `tax-rules/2026/deadlines.json` 추가
10. `tax-rules/2026/penalty-rules.json` 추가
11. 계산 테스트 추가
12. PR 템플릿 추가
13. 세무 리뷰 요청
14. main 병합

## 25. 부록 A. 소득유형별 개발 체크리스트

### 근로소득

- 거주자 여부
- 월 급여 지급일
- 과세 급여
- 비과세 급여
- 부양가족 수
- 간이세액표 적용
- 지방소득세 계산
- 연말정산 대상 여부
- 지급명세서 제출기한

### 일용근로소득

- 일용근로자 여부
- 일 지급액
- 근무일수
- 원천징수세율
- 소액부징수 여부
- 지급명세서 제출기한

### 사업소득

- 인적용역 여부
- 사업자등록 여부
- 소액부징수 예외 여부
- 원천징수세율
- 지방소득세
- 연말정산 대상 여부
- 2026 분납제도 적용 여부

### 기타소득

- 기타소득 유형
- 필요경비 인정 여부
- 원천징수세율
- 지급명세서 제출기한
- 비거주자 여부

### 퇴직소득

- 퇴직일
- 근속연수
- 퇴직급여
- 이연퇴직소득 여부
- 연금수령 여부
- 지급명세서 제출기한

### 연금소득

- 공적연금/사적연금 구분
- 연금계좌 유형
- 수령자 나이
- 종신계약 여부
- 연금수령연차
- 원천징수세율
- 분리과세 선택 여부

### 이자·배당소득

- 거주자/비거주자 구분
- 이자 유형
- 배당 유형
- 고배당기업 특례 여부
- 조세조약 여부
- 지방소득세
- 지급명세서 제출기한

### 비거주자·외국법인

- 국내원천소득 유형
- 거주지국
- 조세조약 적용 여부
- 실질귀속자 여부
- 제한세율 신청서
- 거주자증명서
- 세무당국 제출기한
- 지방소득세 안분

## 26. 부록 B. 주요 출처

[S1] GitHub README, `qoxmfaktmxj/withhold-tax`, 2026-06-09 확인.

[S2] GitHub `content/facts.json`, `qoxmfaktmxj/withhold-tax`, 2026-06-09 확인.

[S3] 한국세무사회, 「2026 달라지는 세금제도」, 2026-06-09 확인. 주요 확인 항목: 고배당기업 배당소득 과세특례, 출산·육아 비과세, 교육비 세액공제, 납부지연가산세, 간이지급명세서 유예, 사업소득 연말정산 분납.

[S4] Samjong KPMG, 「2025 Tax Reform Highlights」, 2026-06-09 확인. 주요 확인 항목: 2025 Tax Reform 통과 및 2026 시행, 비거주자·외국법인 제한세율 신청서 제출 의무, 국내원천소득 범위 변경, 고배당기업 특례.

[S5] 국세청, 「원천징수 개요」, 2026-06-09 확인. 주요 확인 항목: 원천징수의무자, 원천징수 대상 소득, 지방소득세 특별징수, 소액부징수.

[S6] 국세청, 「원천징수 신고·납부기한」, 2026-06-09 확인. 주요 확인 항목: 다음 달 10일 신고·납부, 반기별 납부, 지급명세서 제출기한.

[S7] 국세청, 「원천징수 세율」, 2026-06-09 확인. 주요 확인 항목: 거주자·내국법인 세율, 비거주자·외국법인 국내원천소득 세율.

[S8] 국세청, 「원천징수 관련 가산세」, 2026-06-09 확인. 주요 확인 항목: 원천징수 등 납부지연가산세 산식과 한도, 지방소득세 특별징수 가산세.

[S9] 국세청, 「연금소득 원천징수」, 2026-06-09 확인. 주요 확인 항목: 연금소득 범위와 원천징수 방법. 2026년 사적연금 세율 변경은 별도 1차 확인 필요.

## 27. 마지막 권고

이 프로젝트는 “세법 설명 사이트”가 아니라 “HR 제품 개발 기준서”로 만들어야 한다. 핵심은 세무 지식을 화면·필드·검증·계산·신고기한으로 번역하는 것이다.

가장 먼저 해야 할 일은 P0 fact를 추가하고, 그 fact들이 실제 화면 가이드와 rule에 연결되도록 만드는 것이다. 그 다음 계산기와 캘린더를 붙이면 개발자와 운영자가 모두 쓰는 사내 원천징수 허브가 된다.
