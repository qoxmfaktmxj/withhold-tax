# 원천징수 레퍼런스 — 운영 매뉴얼

> 최종 수정: 2026-06-10

---

## 1. 역할 및 책임

| 역할 | 담당 업무 | 특이사항 |
|------|-----------|----------|
| **Tax Owner** (세무 담당) | 세무 내용 최종 검토·확정 승인, fact verifyStatus 승격 판단 | critical 변경은 2인 리뷰어 필수 |
| **Content Owner** (콘텐츠 담당) | MDX 본문 작성·수정, `<F>` 컴포넌트 연결 | Tax Owner 승인 후 반영 |
| **Developer** (개발자) | zod 스키마·계산 rule 추가, 테스트 작성, 빌드·배포 관리 | |
| **Reviewer** (검토자) | PR 리뷰 시 출처 URL·조문 번호·시행일 교차 확인 | critical 항목은 최소 2인 |

---

## 2. 연간 법령 감시 일정

| 시기 | 모니터링 항목 |
|------|--------------|
| **1월** | 전년도 12월 공포 법률 시행 확인. 부칙 적용례·경과조치 검토. |
| **2~3월** | 시행령·시행규칙 공포 확인(법률 시행 후 하위법령 후속). 국세청 서식 개정 여부 확인. |
| **5~6월** | 국세청 서식·홈택스 갱신 확인. 간이지급명세서 반기 제출 기한 점검. |
| **7~8월** | 기재부 세법개정안 발표(통상 7월 말). `content/law-watchlist.json` 감시 항목 nextCheckDate 도래분 확인. |
| **9~11월** | 국회 기획재정위원회·법사위 법안 심의 경과 모니터링. |
| **12월** | 국회 통과 세법 확인. 부칙·적용례·경과조치 숙지. `law-watchlist.json` 업데이트. 익년 법령 감시 항목 등록. |

---

## 3. Fact 추가 절차

```
1. 1차 출처 확인
   └─ 국가법령정보센터(law.go.kr) 또는 국세청·홈택스 원문 직접 열람
   └─ 조문 번호·시행일·적용 대상 확인

2. sources.json 등록
   └─ 신규 출처면 lib/sources/schema.ts 스키마 준수, id: src_ + snake_case

3. facts.json 추가
   └─ lib/facts/schema.ts 스키마 준수
   └─ 1차 출처 직접 확인 완료 → primarySourceVerified: true
   └─ 확인 완료 → verifyStatus: "확정"
   └─ 미확인·해석여지 → verifyStatus: "확인필요" 또는 "강의기반"

4. MDX 본문 <F id="..."> 연결
   └─ 해당 챕터 MDX 파일에서 fact 인용

5. 테스트
   └─ npm test  (83 tests, 스키마 검증 포함)

6. REVIEW-QUEUE 재생성
   └─ node scripts/gen-review-queue.mjs
```

---

## 4. 분기 점검 명령어

```bash
# Fact 신선도 점검 (asOf 경과 180일↑ / 검토일 60일 이내 / 확인필요·강의기반)
node scripts/fact-freshness.mjs

# JSON 출력 (자동화·파싱용)
node scripts/fact-freshness.mjs --json

# 출처 링크 유효성 전수 점검 (facts.json lawUrl + sources.json url)
node scripts/check-source-links.mjs

# REVIEW-QUEUE 재생성
node scripts/gen-review-queue.mjs
```

---

## 5. Watchlist 운영 (`content/law-watchlist.json`)

- 시행 예정·확인 대기 중인 법령 개정 항목을 관리합니다.
- 각 항목의 `nextCheckDate`가 도래하면 담당자(`owner`)가 확인 후 상태를 업데이트합니다.
- 확인 완료 항목: `status`를 `watching`에서 `confirmed` 또는 `dismissed`로 변경하고, 관련 fact를 갱신합니다.
- 신규 감시 항목 추가 시: `lib/watchlist.ts` zod 스키마 준수, `watchId: watch_` + snake_case, `relatedFactIds`는 실제 facts.json ID 사용.

현재 감시 항목:

| watchId | 내용 | nextCheckDate |
|---------|------|--------------|
| `watch_2027_dividend_grossup` | 배당가산율 10% → 11% | 2026-12-15 |
| `watch_2027_simplified_statement_monthly` | 간이지급명세서 월별 제출 | 2026-12-15 |
| `watch_2026_corp_treaty_filing` | 법인세법 §98조의6 제한세율 신청서 | 2026-07-31 |

---

## 6. 검증 상태 정책

| 상태 | 사용 기준 |
|------|-----------|
| `확정` | 1차 출처(법령 원문·국세청 공식 안내) 직접 확인 완료. `primarySourceVerified: true` 병행 권장. <strong>2차 자료(보고서·강의)만으로 확정 처리 금지.</strong> |
| `확인필요` | 해석 여지, 시행 시점 불명확, 하위 법령 미확인, 판단 근거 부족 항목. |
| `강의기반` | 강의 자료 출처이며 1차 출처 미확인 항목. 공식 근거 확보 후 `확정` 승격 필요. |

> 세무 면책: 모든 수치·기한·세율은 국가법령정보센터·국세청·홈택스·최신 예규로 최종 확인이 필요한 실무 참조용입니다. 단정적 법률자문으로 사용하지 마십시오.
