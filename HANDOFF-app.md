# HANDOFF — 원천징수 레퍼런스 (HTML → Next.js 앱) 인수인계

> 이 문서 하나로 이 프로젝트를 다른 세션/사람이 이어받을 수 있게 정리. (원본 강의→HTML 단계 인수인계는 [`HANDOFF.md`](HANDOFF.md), 코드 가이드는 [`CLAUDE.md`](CLAUDE.md), 사용자용 소개는 [`README.md`](README.md))
> 작성: 2026-06-09 · 상태: **완료, `main` 병합 + GitHub push 완료**

## 0. 한눈에

| 항목 | 내용 |
|---|---|
| 무엇 | CFO Academy 「원천징수실무」 강의 정리 HTML → **출처·검증 박힌 Next.js 정적 레퍼런스** |
| 사용자 | 김민석 / 인사시스템(HR) 개발사 내부용(CS 근거·화면개발·연말정산 참고) / 응답 한국어 |
| 저장소 | `C:\Users\kms\Desktop\dev\withhold-tax` · GitHub `origin: github.com/qoxmfaktmxj/withhold-tax` (main 푸시됨, 60커밋) |
| 정체성 | **AI 재검증 루프 제거** — 모든 핵심 사실에 `§법령 조문 · 시행일 · 검증상태` |
| 배포 | Vercel-ready (아직 미배포 — 보류) |
| 다음 | Vercel 배포 / 강의기반 3건 수기검토 / 2027 세법 재검증 |

## 1. 기술 스택 / 실행

- Next.js 16 (App Router, **SSG**, DB 없음), TypeScript, Tailwind v4(OKLCH 토큰).
- 콘텐츠: **MDX 본문 + `content/facts.json`(zod 검증)** 하이브리드. 사실은 `<F id>`로 본문에 연결.
- 폰트: Hanken Grotesk(디스플레이) · Pretendard(본문, CDN @import) · JetBrains Mono(인용).
- 검색: MiniSearch(클라이언트). 테스트: Vitest+RTL (45 tests).

```bash
npm install
npm run dev      # http://localhost:3000  ※ Windows: webpack(--webpack) 사용
npm run build    # 정적 빌드 (21 pages)
npm test         # 45 tests
```

⚠️ **Windows 게이트** : Turbopack 네이티브 바인딩 부재 → `dev`/`build`가 `--webpack`. Vercel(Linux)은 `build:turbo`(=`next build`)로 Turbopack 사용 가능.

## 2. 아키텍처

```
app/
  layout.tsx              # 사이드바 색인 + 검증범례 + 검색 + 면책 푸터
  page.tsx                # 홈: 히어로 + 2026 개정 카드 + 신뢰마크 예시 + 챕터 그리드 + 부록
  ch/[slug]/page.tsx      # 챕터: fs로 content/chapters/*.mdx 스캔 → 정적생성, <F id> 주입, 검증요약
  updates-2026/page.tsx   # 2026 개정·시행 자동 대시보드 (dashboardFacts)
  review-due/page.tsx     # nextReviewBy 정렬 검토 큐
  globals.css             # Webflow-D 디자인 시스템 (토큰·컴포넌트 CSS)
components/
  Fact.tsx · SourcePill.tsx · VerifyStatus.tsx   # 신뢰 표시 3종 (핵심)
  blocks/ Box·Tbl·Compare·Formula·CaseNote·Stats·Flow·CheatCard  # 원본 HTML 블록 이식
  UpdatesDashboard·ChapterVerifySummary·Search·Disclaimer.tsx
lib/
  facts/schema.ts         # FactSchema (zod) — 신뢰 데이터 모델
  facts/store.ts          # loadFacts·byChapter·dashboardFacts·reviewDue·chapterSummary
  chapter-meta.ts         # CHAPTERS·APPENDICES·chapterTitle (클라 안전)
  chapters.ts             # availableChapterSlugs (fs)
  law-link.ts · search/build-index.ts
content/
  chapters/*.mdx          # 12장(ch1~10 + nonresident + interest-dividend) + 부록 3(glossary·index·cheatsheet)
  facts.json              # 133 fact (zod 검증)
  facts.pilot.json         # 파일럿 10건 원천(참고)
docs/
  REVIEW-QUEUE.md          # 세무 수기검토 큐 (P0/P1/P2) — gen-review-queue.mjs로 생성
  screenshots/*.png        # README용 10장
  superpowers/plans/       # 설계문서·구현계획·파일럿 결과
scripts/ gen-review-queue.mjs · validate-facts.ts
```

**데이터 흐름**: `content/facts.json` → `loadFacts`(zod 검증) → 페이지가 `byChapter`/`dashboardFacts`/`reviewDue`로 소비 + 챕터 MDX의 `<F id="f_xxxx">…</F>`가 fact를 본문에 인라인 연결.

## 3. 신뢰(검증) 모델 — 핵심

- 검증상태 3단: `확정`(1차 출처 직접 매칭) · `확인필요`(재확인 권장) · `강의기반`(공식출처 미확정).
- `primarySourceVerified`(bool): 1차 원문을 실제로 읽었는지(law.go.kr 동적로딩으로 2차 미러 교차확인분은 false).
- `sourceType` 우선순위: LAW > EDICT(시행령/규칙) > INTERPRETATION(예규) > NTS(국세청) > BOOK > LECTURE > CASE.
- **현재: 133 fact = 확정 130 / 강의기반 3 / 확인필요 0.**
- 검증은 파일럿(10) → 배치1(ch4,6) → 배치2(7장+신규2장) → 3차 재검증(29건 승격) 순으로 진행. 다수 오류 교정(고배당 9%→누진 14/20/25/30, 제135조 지급시기특례, 건강진단비 예규, 8,800만원 세율점프 등).
- **남은 강의기반 3건**(억지 확정 안 함 = 정직성): `f_c70003`(기타소득 81·82코드 — 리서치상 미존재, 강의 오인 가능) · `f_c20001`(세법 1.1 시행 = 입법관행, 단일조문 없음) · `f_c80012`(외국인 단일세율 손익분기 1.61억 = 계산추정). [`docs/REVIEW-QUEUE.md`](docs/REVIEW-QUEUE.md) 참조.

### fact 추가/검증 워크플로
1. 1차 출처 확인: 법령=law.go.kr(검색→조문, 부칙=시행일), 예규=taxlaw.nts.go.kr, 서식=홈택스.
2. `content/facts.json`에 항목 추가/수정 (id=`f_`+6자 영숫자, 스키마 준수). 틀린 값은 claim 교정 + previousValue.
3. 본문 MDX에서 해당 문장을 `<F id="...">…</F>`로 감쌈.
4. `node scripts/validate-facts.ts`(또는 build) + `npm test` + `node scripts/gen-review-queue.mjs`로 큐 갱신.

## 4. 디자인 (Webflow-D, 확정)

- 화이트/라이트블루 + `#2563eb` 단일 액센트, Hanken Grotesk + Pretendard, 고정 좌측 사이드바, 8~12px 라운드, 절제된 그림자.
- 디자인 여정: Anthropic 미니멀(거부) → 관보/법전(거부) → **Webflow-D(확정)**. 3안 목업 비교 후 선택. 목업 HTML은 `.gstack/variants/`(gitignore).
- 사용자 피드백 반영: 상단 여백 64px 일관·파란 상단바 제거·ASCII Formula→Tbl·`**` 리터럴 버그 전면 `<strong>` 변환·a11y focus 링·대비 AA.
- 디자인 컨텍스트: [`.impeccable.md`](.impeccable.md), 원천 토큰: [`DESIGN-claude.md`](DESIGN-claude.md).

## 5. 알아둘 점(gotchas)

- **Windows webpack** (위 §1).
- **CJK 마크다운**: `**굵게**` 닫는 `**`가 한글 바로 앞이면 CommonMark flanking 규칙상 리터럴 렌더 → 본문은 `<strong>` 사용(전 챕터 변환 완료).
- **law.go.kr/홈택스 동적로딩**: WebFetch가 조문 원문 직접 추출 실패 → casenote.kr/lawnb/taxlaw.nts.go.kr/기재부 보도자료 미러로 교차확인(그래서 `primarySourceVerified=false` 다수). 1차 원문 최종확인은 인간 권장.
- `.gstack/`·`.omx/`·`next-scaffold/` gitignore. 스크린샷은 `docs/screenshots/`(커밋됨).

## 6. 남은 일 / 다음 단계

1. **Vercel 배포** (보류 중): Vercel에서 repo 연결 → 자동 배포. 빌드커맨드는 기본(`next build`=turbo) 또는 `npm run build`(webpack) 중 택. 환경변수 없음.
2. **강의기반 3건 수기검토** (선택, 네 도메인).
3. **2027 세법 재검증**: facts의 `nextReviewBy: 2027-03-31` (매년 시행규칙 개정 후). 배치 재검증 Workflow 재사용 가능.
4. **콘텐츠 추가 검증**: `확정 130`도 일부 `primarySourceVerified=false` → 시간되면 1차 원문 직접확인으로 격상.

## 7. 세션 여정 요약

`/office-hours`(무엇/왜 구상) → superpowers `writing-plans`(19태스크 계획) + 10 fact 파일럿(공수 실측) → `subagent-driven-development`(Task1~17 구현, 태스크별 spec+품질 2단 리뷰) → 콘텐츠 전량 포팅(Workflow 12장 병렬) → 디자인 3회 반복 → 세법 검증 3배치 + 재검증 → README/스크린샷 → main 병합·push.
