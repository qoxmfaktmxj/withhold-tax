<div align="center">

# 원천징수 레퍼런스

### 출처가 있는 원천징수 실무 레퍼런스 — *AI 재검증 루프를 끝내는 사내 세무 참고 사이트*

법령 조문 · 시행일 · 검증상태가 **모든 핵심 사실에 박혀 있는** 정적 웹 레퍼런스.
국세청에 한 번 더 확인하지 않아도 되도록, 출처를 1급 기능으로 만들었습니다.

`Next.js 16` · `TypeScript` · `Tailwind v4` · `MDX` · `zod` · `Vercel-ready` · `DB 없음`

</div>

<div align="center">
  <img src="docs/screenshots/01-home.png" alt="홈" width="900" />
</div>

---

## 왜 만들었나

인사시스템(HR) 개발사 내부에서 원천징수 지식이 필요한 순간 — ① 고객 질문에 **법적 근거** 제시 ② **화면 개발** 참고 ③ **연말정산** 프로젝트 — 마다 ChatGPT/Claude에 물었지만, AI가 **모르면서 아는 척**하거나 **옛 내용을 최신인 양** 답해서 **매번 책·국세청·홈택스로 한 번 더 검증**해야 했습니다.

이 재검증 루프를 없애는 게 목표입니다. 그래서 모든 검증 대상 사실에 **`§ 법령 조문 · 시행일 · 검증상태`** 를 붙였습니다.

> CFO Academy 「원천징수실무」(세무사 차재영·박교원 공저) 2일 강의 정리를 토대로, 2026년 기준 1차 출처(국가법령정보센터·국세청·예규)와 대조해 재검증했습니다.

---

## 핵심 — 출처가 곧 디자인

각 사실은 `<Fact>` 로 감싸여 **법률 인용 라인 + 검증상태 씰**과 함께 렌더됩니다. 장식이 아니라 신뢰의 본체입니다.

<div align="center">
  <img src="docs/screenshots/02-ch3-trust.png" alt="원천징수 핵심 — 출처 인용·검증상태" width="900" />
</div>

- **`§ 소득세법 제129조 제1항 · 시행 2026.06 · 국세청 ✓확정`** — 인용 라인이 모든 수치·세율·기한 옆에.
- **검증상태 3단**: `✓ 확정`(1차 출처 매칭) · `⚠ 확인필요`(재확인 권장) · `· 강의기반`(공식 출처 미확정).
- 챕터마다 **`이 장 검증: 확정 N · 확인필요 M`** 요약.

---

## 주요 기능

### 2026 개정·시행 대시보드 — 올해 뭐 바뀌었나
`facts.json`에서 개정·신설 항목을 자동 수집. 변경 전 → 2026 기준 → 시행일 → 출처를 한 화면에.

<div align="center">
  <img src="docs/screenshots/05-updates.png" alt="2026 개정·시행 이력" width="900" />
</div>

### 검토 임박 항목 — 재검토 큐
`nextReviewBy` 기준 정렬. 매년 시행규칙 개정 후 무엇을 다시 봐야 하는지.

<div align="center">
  <img src="docs/screenshots/06-review-due.png" alt="검토 임박 항목" width="900" />
</div>

### 검증된 표·콜아웃 — 가산세·신고실무
원본 강의의 표·비교·수식·콜아웃을 React 컴포넌트로 이식하고, 핵심 수치마다 인용을 연결.

<div align="center">
  <img src="docs/screenshots/03-ch4-penalty.png" alt="가산세·신고실무" width="900" />
</div>

### 그 외
- **규정 검색** (클라이언트 사이드, 한글 부분매칭) · **인쇄**(출처 배지·시행일 유지) · **사이드바 색인**(제1장~ + 부록).

---

## 콘텐츠 범위

원본 강의 **10개 장 + 부록 3종**에, 원본에 없던 **신규 2개 장**(비거주자·외국법인 / 이자·배당)을 1차 출처로 새로 조사·작성해 추가했습니다.

| | |
|---|---|
| <img src="docs/screenshots/04-ch1-basics.png" alt="소득세 기본구조" width="430" /> | <img src="docs/screenshots/10-ch6-exemption.png" alt="근로소득 비과세" width="430" /> |
| **CH1 소득세 기본구조** | **CH6 근로소득 비과세 I** |
| <img src="docs/screenshots/07-nonresident.png" alt="비거주자·외국법인" width="430" /> | <img src="docs/screenshots/08-interest-dividend.png" alt="이자·배당" width="430" /> |
| **비거주자·외국법인 원천징수** (신규) | **이자·배당 원천징수** (신규) |
| <img src="docs/screenshots/09-glossary.png" alt="용어 사전" width="430" /> | |
| **부록 A · 핵심 용어 사전** | |

전체 챕터: 소득세 기본구조 · 법체계·세금분류 · 원천징수 핵심 · 가산세·신고실무 · 거주자·해외파견 · 근로소득 비과세 I/II · 신고서 작성·검증 · 간이세액·퇴직소득 · 사업·기타소득 · 비거주자·외국법인 · 이자·배당 / 부록 용어사전·색인·치트시트.

---

## 신뢰 모델

검증 대상 사실은 `content/facts.json`에 구조화 데이터로 분리되어 있고 zod로 검증됩니다.

```jsonc
{
  "id": "f_c40003",
  "slug": "ch04.late-payment.daily-rate",
  "chapter": "ch4",
  "title": "납부지연가산세 1일 이자율",
  "claim": "납부지연가산세의 1일 이자율은 10만분의 22…",
  "sourceType": "EDICT",                 // LAW > EDICT > INTERPRETATION > NTS > BOOK > LECTURE > CASE
  "lawRef": "국세기본법 제47조의4 제1항 제1호",
  "lawUrl": "https://www.law.go.kr/…",
  "effectiveDate": "2022-02-15",
  "verifyStatus": "확정",                 // 확정 | 확인필요 | 강의기반
  "primarySourceVerified": true,         // 1차 원문 직접 확인 여부
  "confidenceScore": 88,
  "history": [{ "date": "2026-06-09", "author": "kms", "note": "…" }],
  "nextReviewBy": "2027-03-31"
}
```

**현재 검증 현황: 133개 사실 중 `확정 130` · `강의기반 3` · `확인필요 0`.**
1차 출처로 확정할 수 없는 항목(입법관행·계산 추정치·강의 항목번호 오인 가능)은 억지로 확정하지 않고 정직하게 `강의기반`으로 둡니다 — 그게 이 시스템의 신뢰성입니다.

수기 검토가 남은 항목은 [`docs/REVIEW-QUEUE.md`](docs/REVIEW-QUEUE.md)에 장별·우선순위(P0/P1/P2)로 정리되어 있습니다.

> ⚠️ **면책**: 본 자료는 강의 정리 기반 **사내 참고용**입니다. 신고·납부 전 국가법령정보센터·국세청·홈택스·세무대리인 검토가 우선하며, 회사는 본 자료 사용 결과에 책임지지 않습니다.

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, **SSG**, DB 없음) |
| 언어/스타일 | TypeScript · Tailwind v4 (OKLCH 토큰) |
| 콘텐츠 | MDX 본문 + `facts.json`(zod 검증) 하이브리드, fact는 `<F id>`로 본문에 연결 |
| 폰트 | Hanken Grotesk(디스플레이) · Pretendard(본문) · JetBrains Mono(인용) |
| 검색 | MiniSearch (클라이언트, 빌드타임 인덱스) |
| 테스트 | Vitest + @testing-library (45 tests) |
| 배포 | Vercel (`git push` → 자동 빌드) |

---

## 실행

```bash
npm install
npm run dev          # http://localhost:3000  (Windows: webpack 사용)
npm run build        # 정적 빌드
npm test             # 45 tests
```

> Windows에서는 Turbopack 네이티브 바인딩 부재로 `dev`/`build`가 `--webpack`을 사용합니다. Vercel(Linux) 배포 시 `build:turbo`로 Turbopack 사용 가능.

---

## 프로젝트 구조

```
app/                    # 라우트: / · /ch/[slug] · /updates-2026 · /review-due
components/             # Fact · SourcePill · VerifyStatus · 콘텐츠 블록(Box/Tbl/Compare/…)
content/
  chapters/*.mdx        # 12장 + 부록 본문
  facts.json            # 검증 사실 저장소 (zod)
lib/facts/              # schema(zod) · store(헬퍼)
docs/
  REVIEW-QUEUE.md        # 세무 수기검토 큐 (P0/P1/P2)
  superpowers/plans/     # 설계·계획·파일럿 산출물
```

---

<div align="center">
<sub>강의 정리 기반 사내 참고 자료 · 2026 기준 · 신고·납부 전 공식 출처 확인 필수</sub>
</div>
