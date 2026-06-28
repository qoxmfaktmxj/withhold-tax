# 리뉴얼 핸드오프 — 「원천징수 및 퇴직급여제도 실무」

> 다른 PC/새 세션에서 이어받기 위한 **단일 컨텍스트 문서**.
> (로컬 메모리 `~/.claude/.../memory/`는 git으로 전송되지 않으므로, 그 핵심 내용을 여기에 박아둔다.)

## 프로젝트 방향
`withhold-tax` 사이트를 기존 **「원천징수 레퍼런스」 → 「원천징수 및 퇴직급여제도 실무」**로 확장 리뉴얼.
- 사용자 = **HR 시스템 개발자** (급여·퇴직급여 DB/DC/혼합형 개발, 퇴직금 산정·검증 담당).
- 입력 재료: CFO Academy 「퇴직급여제도의 운영과 실무해설」 **강의 4강**(2026-06-23~24) + 인터넷 1차출처 리서치.
- 단계: **P1 강의록 정리(완료) → P2 리서치(1차 패스 완료) → P3 IA 설계(다음) → P4 통합 구현+QA**.
- 상세 로드맵·TODO·검증 blocker → [docs/lecture-notes/00-INDEX-TODO.md](lecture-notes/00-INDEX-TODO.md)

## 디자인 DNA (확정 — Toss 무드)
2026-06-23 세션에서 확정. 따뜻한 크림/코랄 + serif 에디토리얼 계열은 거부됨("색감·무드 별로").
- **캔버스**: 화이트(또는 아주 연한 블루 틴트 `#F1F6FF`). **회색 앱배경 `#F2F4F6` 금지**.
- **액센트**: Toss 블루 `#3182F6` (소프트 배경 `#E8F3FF`). (민트 `#0AA17B`·바이올렛 `#6D5BF0`보다 블루 우세)
- **타이포**: 굵은 sans (Pretendard, weight 700) — **serif 미사용**. 숫자·조문은 tabular.
- **컴포넌트**: 둥근 화이트 카드(radius ~18) + 하이라인 `#EDEFF2` + 소프트 그림자(`0 1px 2px`, `0 6px 16px`), 컬러 소프트 아이콘칩, 큰 굵은 숫자.
- **상태색**: 검증 그린 `#03A66A`(bg `#E7F9F1`) · 주의 레드 `#F04452`.
- **텍스트**: ink `#191F28` · body `#4E5968` · muted `#8B95A1`.
- **진행 상태**: 홈 화면 목업 확정(만족). 챕터·계산기 목업 → 디자인 스펙 → 구현 순. 배경 틴트/액센트 최종 픽만 확정 남음.
- (주의) 기존 `app/globals.css`는 코랄/크림/잉크(Airtable Editorial) 계열 — **Toss 블루/화이트로 교체 대상**.

## 현재 코드 상태 (참고)
- 기존 퇴직 스캐폴딩: `content/tax-rules/2026/retirement.json`, `lib/retirement-tax/`, `lib/executive-severance/`, 계산기 `retirement-tax`·`executive-severance-limit`, 챕터 ch9(퇴직소득). → 리뉴얼은 이 위에 확장.
- 아키텍처 원칙: **facts.json = SOT**(수치 하드코딩 금지), `verifyStatus` 3단(확정/확인필요/강의기반), `npm run qa`(lint→typecheck→test→check:freshness→check:links) 게이트.

## 산출물 (이 브랜치: `docs/retirement-benefit-lecture-notes`)
- `docs/lecture-notes/00-INDEX-TODO.md` — 인덱스·로드맵·검증 마스터리스트·P2 결과
- `docs/lecture-notes/2026-06-2*-퇴직급여제도-{1,2,3,4}차.md` — 강의 4강 정리(종합+🛠️ 개발자 콜아웃)
- `docs/lecture-notes/퇴직급여제도-리서치-검증.md` — P2 1차출처 검증 대장(57건: 확정35·확인필요18·교정4 + 완전성 비평)
- `docs/RENEWAL-HANDOFF.md` — (이 문서)

## P4 통합 전 🔴 1차출처 재확인 최우선 blocker
1. **2026.7.1 퇴직소득 세액정산 개정** — 시행일·적용례(부칙)·환급제한 산식이 강의·리서치·검증 3者 불일치. `law.go.kr` 대통령령 부칙·시행규칙 별지 제24호서식 원문 직접 확인 필요.
2. 신 원천징수영수증 서식(가산세 위연 항목·부표명·개정일).
3. 국민연금전환금 IRP 이전의무 제외(법령근거 미확보 — 미확보 시 게재 제외).
4. DC 부담금 소멸시효(3년) 판례 재인용, IRP 자동이전 §9③(2025.11.11) 실재 확인.

## 다른 PC에서 이어가기
```bash
git fetch origin
git checkout docs/retirement-benefit-lecture-notes
```
→ 이 문서(`docs/RENEWAL-HANDOFF.md`) + `docs/lecture-notes/00-INDEX-TODO.md`를 읽으면 컨텍스트 복원. 다음 작업은 **P3 IA 설계**(브레인스토밍) 또는 위 blocker 해소.
