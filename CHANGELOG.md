# Changelog

## [0.2.0] — 2026-06-12

### 추가
- **챕터: 종업원분 주민세** (`content/chapters/employee-local-tax.mdx`) — 면세점(1.5억), 2026 공제 2종, 납기 20개 팩트
- **챕터: 일용근로자 원천징수** (`content/chapters/daily-worker.mdx`) — (일당−15만)×6%×45% 산식, 소액부징수 20개 팩트
- **계산기: 일용근로자 세액** (`/calculators/daily-worker-tax`) — 근무일수·일당 입력, 월 세액 산출
- **계산기: 종업원분 주민세 점검** (`/calculators/employee-local-tax`) — 면세점 판정 + 2026 특별공제
- **계산기: 임원퇴직금 한도** (`/calculators/executive-severance-limit`) — 3배수/2배수 구간 분리
- **계산기: 세후→세전 역산** (`/calculators/reverse-net-pay`) — 4대보험+연 환산 소득세 고정점 반복 수렴
- **팩트 77건** 추가 (f_dw*, f_lt*, f_ex*, f_si*, f_cs*, f_u26*), 누적 226건
- `content/law-watchlist.json` 시드 3건 (가상자산 기타소득 2027 유예 추가)
- `content/tax-rules/2026/` — employee-local-tax, retirement, social-insurance-2026, deadlines 규칙 추가
- 검색 인덱스 갱신: 402 docs / 17 챕터

### 수정 (신뢰성)
- **근로소득세액공제 기울기** (`lib/reverse-net-pay/calc.ts`): ×0.005 → ×0.5 (소득세법 §59①)
- **치트시트 세율표** (`content/chapters/cheatsheet.mdx`): 국세/지방세포함 5열 재구성 + 7단계 체크리스트
- **종업원분 납기** (`content/chapters/employee-local-tax.mdx`, `f_lt0002`): 매년 7.1~8.31 → 8.1~8.31 (과세기준일 7.1)
- **국민연금 상한 면책 문구** (`ReverseNetPayCalculator.tsx`): 2026년 1~6월 617만/39만 적용 안내 명시
- `VerifyStatus` 중복 DOM id 제거 (hydration 오류 방지)
- `app/calculators/employee-local-tax/page.tsx`, `executive-severance-limit/page.tsx`: `rule!` → null guard

### 기술
- `lib/chapter-meta.ts`: `employee-local-tax`, `daily-worker` 챕터 등록
- `lib/tool-priorities.ts`: 신규 계산기 4종 rank 10–13 등록
- 테스트 272건 전부 통과 (신규 룰↔lib 교차검증 포함)
