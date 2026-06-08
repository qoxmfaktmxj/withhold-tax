# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 사용자 응답 언어: **한국어** (IT·디자인 용어 영문 병기 허용). 간결·핵심 위주.

## 프로젝트 정체성

CFO Academy 「원천징수실무」(세무사 차재영·박교원 공저) 2일 강의 녹취를 정리한
**원천징수 세무 레퍼런스**. 현재는 단일 HTML 산출물이며, 목표는 이를
**Next.js 앱으로 포팅 → Vercel 배포**(DB 없음, 정적/SSG 콘텐츠).

⚠️ **현재 상태**: 아직 Next.js 코드 없음. 레포에 소스 문서만 존재(빌드 도구/`package.json` 없음).
첫 작업은 콘텐츠 분석이지 코드 수정이 아님.

## 파일 구성과 관계 (★ 작업 전 이 흐름을 이해할 것)

```
HANDOFF.md ──────────────► 원천징수실무_완전정리_0521-0522.html
(클로드↔사용자 인수인계)      (원본 산출물 · 132KB · 2,053줄)
      │                            │
      ▼                            ▼
원천징수실무_대화내용.pdf ──► [ChatGPT Pro 감수] ──► 3개 파일
(797KB · ChatGPT 대화 원본)        ├─ withholding_html_audit_2026.md  (감수 보고서)
                                   ├─ source-map.template.json        (수정항목 출처맵 JSON)
                                   └─ html_patch_snippets_2026.html   (2026 패치 HTML 스니펫)

DESIGN-claude.md ──► Anthropic Claude.com 디자인 시스템 (포팅 시 목표 디자인)
```

- **HANDOFF.md** — 전체 맥락의 단일 진실원본(single source of truth). 10개 세션(0521 6회 + 0522 4회)
  강의 요약 전문 + 원본 HTML 빌드 방식/디자인 시스템/챕터 매핑 포함. 콘텐츠 작업 시 먼저 읽을 것.
- **원천징수실무_완전정리_0521-0522.html** — 12장 + 부록 3종(용어사전/색인/치트시트) 통합 HTML.
  Next.js 포팅의 **콘텐츠·구조 원천**.
- **감수 3종 파일** — 원본 HTML의 2026년 법령 오류·미흡 항목을 ChatGPT Pro가 검수한 결과.
  내용 수정 시 이 3개가 **수정 지시서** 역할(§콘텐츠 감수 참조).
- **DESIGN-claude.md** — 원본 HTML과 **다른** 디자인 시스템. 포팅 시 적용할 목표 디자인.

## 원본 HTML 구조 (포팅 원천)

섹션 ID(nav/TOC 앵커, 포팅 시 라우트/페이지 단위 후보):
```
#hero #toc #day1 #ch1..#ch6 #day2 #ch7..#ch10 #glossary #index #cheatsheet
```

챕터↔주제 매핑:
```
Ch1 소득세 기본구조   Ch2 법체계·세금분류   Ch3 원천징수 핵심   Ch4 가산세·신고실무
Ch5 거주자·해외파견   Ch6 근로소득 비과세 I  Ch7 신고서 작성·검증  Ch8 근로소득 비과세 II
Ch9 간이세액·퇴직소득  Ch10 사업·기타소득
부록A 용어사전   부록B 교재 페이지 색인   부록C 빠른 참조 치트시트
```

재사용 콘텐츠 블록(컴포넌트화 대상, 334회 사용):
`.box.imp`(레드) `.box.note`(그린) `.box.warn`(골드) `.box.tip`(블루),
`.compare`(VS 비교카드), `.formula`(다크 수식박스), `.case`(케이스 콜아웃),
`.stats/.stat`(통계타일), `.flow`(플로우 다이어그램), `.cheat-card`(치트카드),
`.tbl`(다크헤더 zebra 표 + `.hl/.red/.grn` 셀강조), `mark`(형광), `.badge`(연도 개정표시).

JS 기능(원본 tail `<script>`): progress bar, sticky topnav hide/show, back-to-top,
reveal IntersectionObserver, glossary/index 검색 필터.
**주의: 원본은 localStorage·sessionStorage 미사용**(아티팩트 환경 제약). Next.js에선 제약 없음.

## 원본 HTML 빌드 방식 (참고 — 포팅 시 대체됨)

대용량 HTML 컨텍스트 한계 회피용 **조각 분할 → `cat` 연결** 파이프라인이었음
(head/hero/day1_a/day1_b/day2_a/day2_b/tail). 검증은 ① Python `re.findall` 태그 균형 체크
② Playwright 섹션 스크린샷. 자세한 절차는 HANDOFF.md §1.

## 두 개의 디자인 시스템 (혼동 주의 ★)

| | 원본 HTML | DESIGN-claude.md (목표) |
|---|---|---|
| 무드 | 화려한 에디토리얼 매거진 | warm-canvas 에디토리얼(Anthropic) |
| 폰트 제목 | Fraunces (serif) | Copernicus/Tiempos(serif), 대체 Cormorant Garamond |
| 폰트 본문 | IBM Plex Sans KR | StyreneB/Inter |
| 주색 | 딥레드 `#c43e25` | 코랄 `#cc785c` |
| 바탕 | paper `#f4efe3` | cream canvas `#faf9f5` |
| 다크면 | — | navy `#181715` (코드/카드/푸터) |

**한글 본문이 핵심**이므로 DESIGN-claude.md의 영문 폰트를 그대로 쓰지 말 것:
제목은 한글 지원 serif(예: Nanum Myeongjo/본명조 계열), 본문은 IBM Plex Sans KR 유지 검토 필요.
이 트레이드오프는 포팅 계획 시 사용자와 결정.

## 콘텐츠 감수 — 2026 법령 수정 필수 항목 (★)

`withholding_html_audit_2026.md` + `source-map.template.json` 기준. 포팅하며 반드시 반영:

| 우선 | 원본(틀림) | 2026 수정 |
|---|---|---|
| 높음 | 사업소득 3.3%도 1,000원 미만 부징수 | 거주자 인적용역 사업소득은 **2024.7.1 이후 지급분부터 1,000원 미만이어도 원천징수** |
| 높음 | 고배당기업 분리과세 9%(2025 신설) | 조특법 §104조의27, **2026.1.1 이후 지급분**, 단일 9% 아님(별도 누진 분리과세) |
| 높음 | 근로 간이지급명세서 상반기 1~5월 | **반기 제출: 1~6월분 7월말 / 7~12월분 익년 1월말**, 월별제출 2027 유예 |
| 중간 | 원천세 납부지연가산세 MIN(A,B) 10%한도 | 미납세액×3% + 미납세액×2.2/10,000×경과일수, 한도는 공식 문구 그대로 |
| 중간 | 성과급(PS)=임금 아님 | 세법 귀속시기와 노동법 임금성 분리 서술 |

신규 보강 권장 장: ① 2026 개정 대시보드 ② 비거주자·외국법인 원천징수 ③ 이자·배당 원천징수.
출처 배지 체계(`NTS/LAW/BOOK/LECTURE/CASE/CHECK`) + `data-asof/data-source/data-law/data-risk` 속성.

⚠️ **세무 면책**: 모든 수치·기한·세율은 국가법령정보센터/국세청/홈택스/최신 예규로
최종 확인해야 하는 실무 참조용. 단정적 법률자문으로 쓰지 말 것. 각 사실에 `as-of date`·출처 부착.

## 작업 워크플로

이 레포는 superpowers + gstack 스킬 사용 환경. 신규 앱 설계이므로:
1. `/office-hours` — 무엇을/왜 만들지 구상
2. superpowers `brainstorming` → `writing-plans` — 계획 수립
3. 구현 → Vercel 배포

위험 작업(파일 삭제·git force/reset·설정/환경변수 변경·전역 패키지)은 실행 전 확인.
