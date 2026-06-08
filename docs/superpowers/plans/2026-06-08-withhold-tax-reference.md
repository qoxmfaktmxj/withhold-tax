# 원천징수 신뢰 레퍼런스 (HTML→Next.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 강의 기반 원천징수 HTML을 출처·시행일이 박힌 신뢰 가능한 Next.js 정적 레퍼런스로 포팅해 Vercel에 배포한다.

**Architecture:** Next.js(App Router, SSG) + MDX 본문 + `facts.json`(zod 검증) 하이브리드. 검증 대상 사실은 `<Fact id>`로 감싸고 출처/시행일/검증상태는 facts.json에서 참조. 2026 개정 대시보드·챕터 검증요약·법령 딥링크·검토임박 뷰는 facts에서 자동 렌더. 클라이언트 사이드 검색. DB 없음.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS v4, @next/mdx, zod, Vitest + @testing-library/react, MiniSearch(파일럿 결정), next/font.

> **설계 출처:** `C:\Users\kms\.gstack\projects\qoxmfaktmxj-withhold-tax\kms-main-design-20260608-153728.md` (APPROVED, 9/10). 디자인 토큰: `DESIGN-claude.md`. 콘텐츠 원천: `원천징수실무_완전정리_0521-0522.html`, `HANDOFF.md`. 감수: `withholding_html_audit_2026.md`, `source-map.template.json`, `html_patch_snippets_2026.html`.

---

## File Structure

```
withhold-tax/                     # 레포 루트 = Next.js 앱
  package.json  tsconfig.json  next.config.mjs  postcss.config.mjs  vitest.config.ts
  mdx-components.tsx              # MDX 엘리먼트 → React 컴포넌트 매핑
  app/
    layout.tsx                   # 폰트, globals, topnav, footer, 전역 면책
    globals.css                  # 디자인 토큰(DESIGN-claude.md) + Tailwind
    page.tsx                     # 히어로 + 목차(TOC) + 2026 대시보드 진입
    updates-2026/page.tsx        # 2026 개정 대시보드(facts 자동)
    review-due/page.tsx          # nextReviewBy 정렬 뷰
    ch/[slug]/page.tsx           # 챕터 페이지(MDX 렌더 + 검증요약)
  content/
    chapters/                    # ch1.mdx .. ch10.mdx, 신규 3장, 부록 A/B/C
    facts.json                   # fact 저장소(zod 검증)
  lib/
    facts/schema.ts              # Fact zod 스키마 + 타입
    facts/store.ts               # facts 로드·검증·헬퍼(byChapter/dashboard/reviewDue)
    law-link.ts                  # lawRef → law.go.kr URL(best-effort) + 텍스트
    search/build-index.ts        # 빌드타임 검색 인덱스 생성
  components/
    Fact.tsx  SourcePill.tsx  VerifyStatus.tsx  Disclaimer.tsx
    UpdatesDashboard.tsx  ChapterVerifySummary.tsx  Search.tsx
    blocks/ Box.tsx Compare.tsx Formula.tsx CaseNote.tsx Stats.tsx Flow.tsx CheatCard.tsx Tbl.tsx
  test/
    facts-schema.test.ts  facts-store.test.ts  law-link.test.ts
    components/SourcePill.test.tsx  VerifyStatus.test.tsx  Fact.test.tsx  UpdatesDashboard.test.tsx
  docs/superpowers/plans/2026-06-08-withhold-tax-reference.md
```

**파일 책임 원칙:** 신뢰(출처/검증) 로직은 `lib/facts/` + `components/Fact|SourcePill|VerifyStatus`에 집중. 콘텐츠 블록은 `components/blocks/`(HTML CSS 1:1 포팅). 자동 렌더 뷰는 facts.store 헬퍼만 소비.

---

## 검증 공수 (10 fact 파일럿 실측 — `docs/superpowers/plans/pilot-results-2026-06-08.md`)

- **실측**: fact당 평균 **15.2분**(easy 편중 표본 → 전체 **18~22분** 보정). 전체 콘텐츠(fact 300~500) 인간 검증 **6~18주(중앙 10~13)**, 주 10~15h 단일 검토자, confidence **low**.
- **fact 상한 350**(설계 500에서 하향, 파일럿 권고).
- **검색 라이브러리**: 파일럿 미결 → Task 15에서 한글 분절 비교 후 결정(기본 MiniSearch).
- **P0/P1 분할(권장)**: P0 = 감수 5건 + 신규 3장 ≈ **60~90 fact** → 검증 2~3주 + 통합 1~2주 = **첫 dogfood 3~5주**. P1 = 나머지 12장 점진(4~13주).
- 🔴 **구조 리스크(P0 필수 해소)**: `law.go.kr`·홈택스 동적 로딩으로 조문 원문 직접 매칭 거의 실패 → "확정" 8건 중 1차 직접확인 4건뿐. **1차 원문 우회 확보 절차**(law.go.kr `&print=print` URL / PDF 캡처)를 P0에서 표준화하고 `primarySourceVerified` 플래그로 분리(Task 3 스키마 반영, Task 19 절차 반영).
- 파일럿 검증 데이터(10건, claim 교정 포함)는 `content/facts.pilot.json` → Task 14 시드.

---

## Task 1: 프로젝트 스캐폴드 (Next.js + TS + Vitest + Tailwind)

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`

- [ ] **Step 1: Next.js 앱 생성(비대화식)**

Run:
```bash
cd C:/Users/kms/Desktop/dev/withhold-tax
npx --yes create-next-app@latest . --ts --app --tailwind --eslint --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```
Expected: 기존 폴더에 Next.js 구조 생성(기존 .md/.html/.json 소스파일은 보존). 충돌 시 빈 폴더 아님 경고 → `--yes` 진행, 기존 파일 유지 확인.

- [ ] **Step 2: 테스트 도구 설치**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
npm install zod
```
Expected: devDependencies에 vitest 등 추가.

- [ ] **Step 3: vitest 설정 작성**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
```

`test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: test 스크립트 추가**

`package.json`의 `scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: 스모크 테스트 통과 확인**

`test/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```
Run: `npm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with TypeScript, Tailwind, Vitest"
```

---

## Task 2: 디자인 토큰 + 폰트 (DESIGN-claude.md → globals.css)

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: 디자인 토큰 작성(globals.css 상단)**

`app/globals.css` (Tailwind import 아래에 추가). 값은 `DESIGN-claude.md` colors/spacing/rounded에서:
```css
:root {
  /* brand */
  --color-primary: #cc785c; --color-primary-active: #a9583e;
  --color-ink: #141413; --color-body: #3d3d3a; --color-muted: #6c6a64;
  --color-canvas: #faf9f5; --color-surface-card: #efe9de;
  --color-surface-dark: #181715; --color-on-dark: #faf9f5;
  --color-hairline: #e6dfd8;
  /* semantic for verify status */
  --color-verified: #5db872;   /* 확정 */
  --color-check: #d4a017;      /* 확인필요 */
  --color-lecture: #8e8b82;    /* 강의기반 */
  /* radius */
  --radius-md: 8px; --radius-lg: 12px; --radius-pill: 9999px;
  /* space */
  --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --space-section: 96px;
}
body { background: var(--color-canvas); color: var(--color-ink); }
```

- [ ] **Step 2: 폰트 로드(next/font, self-host)**

`app/layout.tsx` 상단:
```tsx
import { IBM_Plex_Sans_KR, JetBrains_Mono, Gowun_Batang } from 'next/font/google'

const sans = IBM_Plex_Sans_KR({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-sans', display: 'swap' })
const serif = Gowun_Batang({ subsets: ['latin'], weight: ['400','700'], variable: '--font-serif', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-mono', display: 'swap' })
```
> 제목 serif는 한글 지원 `Gowun_Batang`(디자인 단계 최종 후보 1). 본문 IBM Plex Sans KR 고정.

- [ ] **Step 3: body 클래스에 폰트 변수 연결**

`app/layout.tsx`의 `<body>`:
```tsx
<body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
```
`globals.css`:
```css
body { font-family: var(--font-sans), system-ui, sans-serif; }
h1, h2, h3 { font-family: var(--font-serif), serif; letter-spacing: -0.02em; font-weight: 400; }
code, pre, .mono { font-family: var(--font-mono), ui-monospace, monospace; }
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공, 폰트 최적화 로그.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add Anthropic-style design tokens and Korean fonts"
```

---

## Task 3: Fact zod 스키마 (신뢰 데이터 모델의 핵심)

**Files:**
- Create: `lib/facts/schema.ts`
- Test: `test/facts-schema.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`test/facts-schema.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { FactSchema } from '@/lib/facts/schema'

const valid = {
  id: 'f_a1b2c3', slug: 'ch03.small-amount.personal-service',
  chapter: 'ch3', claim: '...', sourceType: 'NTS', sourceTitle: '국세청 원천징수 개요',
  lawRef: '소득세법 제86조', lawUrl: '', asOf: '2026-06-08', effectiveDate: '2024-07-01',
  verifyStatus: '확정', risk: 'high', changeType: '개정', previousValue: '',
  history: [{ date: '2026-06-08', author: 'kms', note: '재검증' }], nextReviewBy: '2027-03-31',
}

describe('FactSchema', () => {
  it('accepts a valid fact', () => {
    expect(FactSchema.parse(valid)).toMatchObject({ id: 'f_a1b2c3' })
  })
  it('rejects bad id format', () => {
    expect(() => FactSchema.parse({ ...valid, id: 'x1' })).toThrow()
  })
  it('rejects unknown verifyStatus', () => {
    expect(() => FactSchema.parse({ ...valid, verifyStatus: '대충맞음' })).toThrow()
  })
  it('rejects bad date format', () => {
    expect(() => FactSchema.parse({ ...valid, asOf: '2026/06/08' })).toThrow()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run test/facts-schema.test.ts`
Expected: FAIL — `Cannot find module '@/lib/facts/schema'`.

- [ ] **Step 3: 스키마 구현**

`lib/facts/schema.ts`:
```ts
import { z } from 'zod'

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
const ymdOrEmpty = z.union([ymd, z.literal('')])

export const SourceType = z.enum(['LAW','EDICT','INTERPRETATION','NTS','BOOK','LECTURE','CASE'])
export const VerifyStatus = z.enum(['확정','확인필요','강의기반'])
export const ChangeType = z.enum(['신설','개정','폐지','없음'])
export const Risk = z.enum(['high','medium','low'])

export const FactSchema = z.object({
  id: z.string().regex(/^f_[a-z0-9]{6}$/, 'f_ + 6 hex/alnum'),
  slug: z.string().min(1),
  chapter: z.string().regex(/^ch\d+$/),
  claim: z.string().min(1),
  sourceType: SourceType,
  sourceTitle: z.string(),
  lawRef: z.string(),
  lawUrl: z.string(),
  asOf: ymd,
  effectiveDate: ymdOrEmpty,
  verifyStatus: VerifyStatus,
  risk: Risk,
  changeType: ChangeType,
  previousValue: z.string(),
  history: z.array(z.object({ date: ymd, author: z.string(), note: z.string() })).min(1),
  nextReviewBy: ymdOrEmpty,
  // --- 파일럿 도출 갭 필드 (기본값으로 하위호환) ---
  primarySourceVerified: z.boolean().default(false),   // 1차 원문 직접확인 여부(law.go.kr 동적로딩 문제 분리)
  confidenceScore: z.number().min(0).max(100).default(0),
  subordinateLawRef: z.string().default(''),           // 시행령·시행규칙 별도 조문
  scopeLimitations: z.string().default(''),            // 적용범위·예외 단서
  localTaxRef: z.string().default(''),                 // 지방소득세 별도 근거
  supersededRefs: z.string().default(''),              // 폐지 구제도 혼입 추적
  appliesFrom: ymdOrEmpty.default(''),                 // 지급분 적용개시일(≠ 법 전체 시행일)
  sunsetDate: z.string().default(''),                  // 한시규정 종료(자유텍스트: '부칙 확인' 등 허용)
  reviewerId: z.string().default(''),                  // 최종 검토자
})

export type Fact = z.infer<typeof FactSchema>
export const FactsFileSchema = z.array(FactSchema)
```
> 갭 9개는 파일럿(`pilot-results-2026-06-08.md`)에서 도출. `.default()`로 기존 데이터 하위호환. `primarySourceVerified`가 핵심 — `확정`이어도 1차 원문 미확인이면 false로 정직하게 구분.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run test/facts-schema.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/facts/schema.ts test/facts-schema.test.ts
git commit -m "feat: add zod schema for fact store with verification metadata"
```

---

## Task 4: facts 스토어 + 헬퍼 (로드·검증·집계)

**Files:**
- Create: `lib/facts/store.ts`, `content/facts.json`
- Test: `test/facts-store.test.ts`

- [ ] **Step 1: 빈 facts.json + 픽스처**

`content/facts.json`:
```json
[]
```

- [ ] **Step 2: 실패하는 테스트 작성**

`test/facts-store.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { loadFacts, byChapter, dashboardFacts, reviewDue, chapterSummary } from '@/lib/facts/store'
import type { Fact } from '@/lib/facts/schema'

const f = (o: Partial<Fact>): Fact => ({
  id: 'f_000001', slug: 's', chapter: 'ch3', claim: 'c', sourceType: 'NTS', sourceTitle: 't',
  lawRef: '', lawUrl: '', asOf: '2026-06-08', effectiveDate: '', verifyStatus: '확정',
  risk: 'low', changeType: '없음', previousValue: '',
  history: [{ date: '2026-06-08', author: 'kms', note: 'n' }], nextReviewBy: '', ...o,
})

describe('facts store', () => {
  it('loadFacts validates and throws on bad data', () => {
    expect(() => loadFacts([{ id: 'bad' } as any])).toThrow()
  })
  it('byChapter groups', () => {
    const list = [f({ id: 'f_000001', chapter: 'ch3' }), f({ id: 'f_000002', chapter: 'ch4' })]
    expect(byChapter(list, 'ch3')).toHaveLength(1)
  })
  it('dashboardFacts picks 2026 changes', () => {
    const list = [f({ id: 'f_000001', changeType: '신설', effectiveDate: '2026-01-01' }), f({ id: 'f_000002', changeType: '없음' })]
    expect(dashboardFacts(list)).toHaveLength(1)
  })
  it('reviewDue sorts by nextReviewBy ascending, skips empty', () => {
    const list = [f({ id: 'f_000001', nextReviewBy: '2027-03-31' }), f({ id: 'f_000002', nextReviewBy: '' }), f({ id: 'f_000003', nextReviewBy: '2026-12-01' })]
    expect(reviewDue(list).map(x => x.id)).toEqual(['f_000003', 'f_000001'])
  })
  it('chapterSummary counts by status', () => {
    const list = [f({ id: 'f_000001', verifyStatus: '확정' }), f({ id: 'f_000002', verifyStatus: '확인필요' })]
    expect(chapterSummary(list)).toEqual({ 확정: 1, 확인필요: 1, 강의기반: 0, total: 2 })
  })
})
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run test/facts-store.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: 스토어 구현**

`lib/facts/store.ts`:
```ts
import { FactsFileSchema, type Fact, type VerifyStatus } from './schema'

export function loadFacts(raw: unknown): Fact[] {
  return FactsFileSchema.parse(raw)
}

export function byChapter(facts: Fact[], chapter: string): Fact[] {
  return facts.filter((f) => f.chapter === chapter)
}

export function dashboardFacts(facts: Fact[]): Fact[] {
  return facts.filter((f) => f.changeType !== '없음' || f.effectiveDate >= '2026-01-01')
}

export function reviewDue(facts: Fact[]): Fact[] {
  return facts.filter((f) => f.nextReviewBy !== '').sort((a, b) => a.nextReviewBy.localeCompare(b.nextReviewBy))
}

export function chapterSummary(facts: Fact[]) {
  const acc = { 확정: 0, 확인필요: 0, 강의기반: 0, total: facts.length } as Record<VerifyStatus, number> & { total: number }
  for (const f of facts) acc[f.verifyStatus]++
  return acc
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run test/facts-store.test.ts`
Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add lib/facts/store.ts content/facts.json test/facts-store.test.ts
git commit -m "feat: add facts store with chapter/dashboard/review-due helpers"
```

---

## Task 5: 법령 딥링크 유틸 (텍스트 1급, 링크 보조)

**Files:**
- Create: `lib/law-link.ts`
- Test: `test/law-link.test.ts`

- [ ] **Step 1: 실패하는 테스트**

`test/law-link.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { lawLink } from '@/lib/law-link'

describe('lawLink', () => {
  it('returns text + best-effort url for 소득세법 제127조', () => {
    const r = lawLink('소득세법 제127조')
    expect(r.text).toBe('소득세법 제127조')
    expect(r.url).toContain('law.go.kr')
    expect(r.url).toContain('소득세법')
  })
  it('returns empty url when ref is empty', () => {
    expect(lawLink('')).toEqual({ text: '', url: '' })
  })
  it('handles 조특법 abbreviation', () => {
    expect(lawLink('조세특례제한법 제104조의27').url).toContain('조세특례제한법')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run test/law-link.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 (best-effort, 텍스트 우선)**

`lib/law-link.ts`:
```ts
export interface LawLink { text: string; url: string }

// best-effort: law.go.kr는 /법령/{법령명}/{조문} 패턴이 대체로 동작. 깨질 수 있으므로 text가 1급.
export function lawLink(ref: string): LawLink {
  if (!ref.trim()) return { text: '', url: '' }
  const m = ref.match(/^(.+?)\s*(제\d+조(?:의\d+)?)?$/)
  const lawName = (m?.[1] ?? ref).trim()
  const article = m?.[2]?.trim()
  const base = `https://www.law.go.kr/법령/${encodeURIComponent(lawName)}`
  const url = article ? `${base}/${encodeURIComponent(article)}` : base
  return { text: ref, url }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run test/law-link.test.ts`
Expected: 3 passed.

> **구현 1단계 검증(코드 아님, 수동):** 실제 브라우저에서 `https://www.law.go.kr/법령/소득세법/제127조` 동작 확인. 안 되면 url을 검색 페이지(`/lsSc.do?query=`)로 폴백 후 테스트 갱신.

- [ ] **Step 5: Commit**

```bash
git add lib/law-link.ts test/law-link.test.ts
git commit -m "feat: add best-effort law.go.kr deep-link util (text-first)"
```

---

## Task 6: SourcePill 컴포넌트 (출처 배지 + a11y)

**Files:**
- Create: `components/SourcePill.tsx`
- Test: `test/components/SourcePill.test.tsx`

- [ ] **Step 1: 실패하는 테스트**

`test/components/SourcePill.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SourcePill } from '@/components/SourcePill'

describe('SourcePill', () => {
  it('renders source type label', () => {
    render(<SourcePill sourceType="NTS" sourceTitle="국세청 원천징수 개요" asOf="2026-06-08" lawRef="" lawUrl="" />)
    expect(screen.getByText('NTS')).toBeInTheDocument()
  })
  it('has accessible label with source, asOf', () => {
    render(<SourcePill sourceType="LAW" sourceTitle="소득세법" asOf="2026-06-08" lawRef="소득세법 제127조" lawUrl="https://x" />)
    const el = screen.getByRole('note')
    expect(el).toHaveAttribute('aria-label', expect.stringContaining('출처'))
    expect(el.getAttribute('aria-label')).toContain('2026-06-08')
  })
  it('renders law link when lawUrl present', () => {
    render(<SourcePill sourceType="LAW" sourceTitle="소득세법" asOf="2026-06-08" lawRef="소득세법 제127조" lawUrl="https://law.go.kr/x" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://law.go.kr/x')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run test/components/SourcePill.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

`components/SourcePill.tsx`:
```tsx
import type { Fact } from '@/lib/facts/schema'

type Props = Pick<Fact, 'sourceType' | 'sourceTitle' | 'asOf' | 'lawRef' | 'lawUrl'>

const TONE: Record<Fact['sourceType'], string> = {
  LAW: 'var(--color-primary)', EDICT: 'var(--color-primary)', INTERPRETATION: 'var(--color-verified)',
  NTS: 'var(--color-verified)', BOOK: 'var(--color-check)', LECTURE: 'var(--color-muted)', CASE: 'var(--color-muted)',
}

export function SourcePill({ sourceType, sourceTitle, asOf, lawRef, lawUrl }: Props) {
  const label = `출처: ${sourceTitle}${lawRef ? `, ${lawRef}` : ''}, 시행/확인일 ${asOf}`
  return (
    <span role="note" aria-label={label}
      className="mono" style={{ display: 'inline-flex', gap: 4, alignItems: 'center', padding: '2px 7px',
        borderRadius: 'var(--radius-pill)', border: `1px solid ${TONE[sourceType]}`, color: TONE[sourceType], fontSize: 10 }}>
      <span>{sourceType}</span>
      {lawUrl
        ? <a href={lawUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{lawRef || '법령'}</a>
        : lawRef ? <span>{lawRef}</span> : null}
      <span aria-hidden style={{ opacity: 0.7 }}>· {asOf}</span>
    </span>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run test/components/SourcePill.test.tsx`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add components/SourcePill.tsx test/components/SourcePill.test.tsx
git commit -m "feat: add SourcePill with accessible label and law link"
```

---

## Task 7: VerifyStatus 컴포넌트 (확정/확인필요/강의기반)

**Files:**
- Create: `components/VerifyStatus.tsx`
- Test: `test/components/VerifyStatus.test.tsx`

- [ ] **Step 1: 실패하는 테스트**

`test/components/VerifyStatus.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerifyStatus } from '@/components/VerifyStatus'

describe('VerifyStatus', () => {
  it('확정 shows checkmark and verified tone', () => {
    render(<VerifyStatus status="확정" />)
    expect(screen.getByText(/확정/)).toBeInTheDocument()
  })
  it('강의기반 exposes a disclosure id for aria-describedby', () => {
    render(<VerifyStatus status="강의기반" />)
    const el = screen.getByText(/강의기반/)
    expect(el).toHaveAttribute('id')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run test/components/VerifyStatus.test.tsx`
Expected: FAIL.

- [ ] **Step 3: 구현**

`components/VerifyStatus.tsx`:
```tsx
import type { Fact } from '@/lib/facts/schema'

const MAP: Record<Fact['verifyStatus'], { icon: string; tone: string; note: string }> = {
  '확정': { icon: '✓', tone: 'var(--color-verified)', note: '공식 1차 출처와 직접 매칭됨' },
  '확인필요': { icon: '!', tone: 'var(--color-check)', note: '출처는 있으나 해석/시행시점 재확인 권장' },
  '강의기반': { icon: '·', tone: 'var(--color-lecture)', note: '강의 설명 기반. 공식 1차 출처 미확정 — 신고 전 별도 확인 필요' },
}

export function VerifyStatus({ status }: { status: Fact['verifyStatus'] }) {
  const m = MAP[status]
  const id = `vs-${status}`
  return (
    <span id={id} title={m.note} aria-label={`검증상태: ${status}. ${m.note}`}
      style={{ color: m.tone, fontSize: 11, fontWeight: 500 }}>
      {m.icon} {status}
    </span>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run test/components/VerifyStatus.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add components/VerifyStatus.tsx test/components/VerifyStatus.test.tsx
git commit -m "feat: add VerifyStatus badge with disclosure for lecture-based facts"
```

---

## Task 8: Fact 컴포넌트 (claim 래핑 + 출처/검증 결합)

**Files:**
- Create: `components/Fact.tsx`
- Test: `test/components/Fact.test.tsx`

- [ ] **Step 1: 실패하는 테스트**

`test/components/Fact.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Fact } from '@/components/Fact'
import type { Fact as FactData } from '@/lib/facts/schema'

const data: FactData = {
  id: 'f_a1b2c3', slug: 's', chapter: 'ch3', claim: '비영업대금 이익 25%', sourceType: 'LAW',
  sourceTitle: '소득세법', lawRef: '소득세법 제129조', lawUrl: 'https://law.go.kr/x', asOf: '2026-06-08',
  effectiveDate: '', verifyStatus: '확정', risk: 'low', changeType: '없음', previousValue: '',
  history: [{ date: '2026-06-08', author: 'kms', note: 'n' }], nextReviewBy: '',
}

describe('Fact', () => {
  it('renders children with source pill and verify status', () => {
    render(<Fact data={data}>비영업대금 이익은 <strong>25%</strong></Fact>)
    expect(screen.getByText(/비영업대금 이익은/)).toBeInTheDocument()
    expect(screen.getByText('LAW')).toBeInTheDocument()
    expect(screen.getByText(/확정/)).toBeInTheDocument()
  })
  it('강의기반 fact wires aria-describedby to status disclosure', () => {
    render(<Fact data={{ ...data, verifyStatus: '강의기반' }}>설명</Fact>)
    const region = screen.getByTestId('fact-f_a1b2c3')
    expect(region.getAttribute('aria-describedby')).toContain('vs-강의기반')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run test/components/Fact.test.tsx`
Expected: FAIL.

- [ ] **Step 3: 구현**

`components/Fact.tsx`:
```tsx
import type { ReactNode } from 'react'
import type { Fact as FactData } from '@/lib/facts/schema'
import { SourcePill } from './SourcePill'
import { VerifyStatus } from './VerifyStatus'

export function Fact({ data, children }: { data: FactData; children: ReactNode }) {
  const describedBy = data.verifyStatus === '강의기반' ? `vs-강의기반` : undefined
  const muted = data.verifyStatus === '강의기반'
  return (
    <span data-testid={`fact-${data.id}`} data-fact-id={data.id} aria-describedby={describedBy}
      style={{ background: muted ? 'color-mix(in srgb, var(--color-lecture) 10%, transparent)' : undefined }}>
      {children}{' '}
      <SourcePill sourceType={data.sourceType} sourceTitle={data.sourceTitle} asOf={data.asOf} lawRef={data.lawRef} lawUrl={data.lawUrl} />
      {' '}
      <VerifyStatus status={data.verifyStatus} />
    </span>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run test/components/Fact.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add components/Fact.tsx test/components/Fact.test.tsx
git commit -m "feat: add Fact component combining claim, source pill, verify status"
```

---

## Task 9: 콘텐츠 블록 컴포넌트 (HTML CSS → React)

원본 HTML의 블록 클래스를 React 컴포넌트로 이식. 각 블록의 정확한 스타일은 `원천징수실무_완전정리_0521-0522.html`의 `<style>` 해당 규칙을 참조해 옮긴다.

**Files:**
- Create: `components/blocks/Box.tsx`, `Compare.tsx`, `Formula.tsx`, `CaseNote.tsx`, `Stats.tsx`, `Flow.tsx`, `CheatCard.tsx`, `Tbl.tsx`

- [ ] **Step 1: Box (콜아웃 4종: imp/note/warn/tip)**

`components/blocks/Box.tsx`:
```tsx
import type { ReactNode } from 'react'
const TONE = {
  imp: 'var(--color-primary)', note: 'var(--color-verified)',
  warn: 'var(--color-check)', tip: '#2c5f8a',
} as const
export function Box({ kind, title, children }: { kind: keyof typeof TONE; title?: string; children: ReactNode }) {
  return (
    <aside style={{ borderLeft: `3px solid ${TONE[kind]}`, background: 'var(--color-surface-card)',
      padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)', margin: 'var(--space-md) 0' }}>
      {title && <strong style={{ color: TONE[kind] }}>{title}</strong>}
      <div>{children}</div>
    </aside>
  )
}
```

- [ ] **Step 2: Tbl (다크헤더 zebra 표 래퍼 + 셀 강조)**

`components/blocks/Tbl.tsx`:
```tsx
import type { ReactNode } from 'react'
export function Tbl({ children, scroll }: { children: ReactNode; scroll?: boolean }) {
  return (
    <div style={{ overflowX: scroll ? 'auto' : undefined, margin: 'var(--space-md) 0' }}>
      <table className="wt-tbl">{children}</table>
    </div>
  )
}
```
`app/globals.css`에 추가:
```css
.wt-tbl { border-collapse: collapse; width: 100%; font-size: 14px; }
.wt-tbl thead th { background: var(--color-surface-dark); color: var(--color-on-dark); padding: 8px 12px; text-align: left; }
.wt-tbl td { border-top: 1px solid var(--color-hairline); padding: 8px 12px; }
.wt-tbl tbody tr:nth-child(even) { background: var(--color-surface-card); }
.wt-tbl td.hl { background: #ffe98a; } .wt-tbl td.red { color: var(--color-primary-active); } .wt-tbl td.grn { color: var(--color-verified); }
```

- [ ] **Step 3: Compare (VS 비교 카드)**

`components/blocks/Compare.tsx`:
```tsx
import type { ReactNode } from 'react'
export function Compare({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--space-md)', alignItems: 'center', margin: 'var(--space-md) 0' }}>
      <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>{left}</div>
      <span className="mono" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>VS</span>
      <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>{right}</div>
    </div>
  )
}
```

- [ ] **Step 4: Formula (다크 수식 박스)**

`components/blocks/Formula.tsx`:
```tsx
import type { ReactNode } from 'react'
export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="mono" style={{ background: 'var(--color-surface-dark)', color: 'var(--color-on-dark)',
      padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', margin: 'var(--space-md) 0', lineHeight: 1.6 }}>
      {children}
    </div>
  )
}
```

- [ ] **Step 5: CaseNote (케이스 콜아웃)**

`components/blocks/CaseNote.tsx`:
```tsx
import type { ReactNode } from 'react'
export function CaseNote({ title = '사례', children }: { title?: string; children: ReactNode }) {
  return (
    <aside style={{ border: `1px dashed var(--color-muted)`, borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', margin: 'var(--space-md) 0' }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--color-muted)' }}>{title}</span>
      <div>{children}</div>
    </aside>
  )
}
```

- [ ] **Step 6: Stats + Flow + CheatCard**

`components/blocks/Stats.tsx`:
```tsx
import type { ReactNode } from 'react'
export function Stats({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', margin: 'var(--space-md) 0' }}>{children}</div>
}
export function Stat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', minWidth: 120 }}>
      <div className="mono" style={{ fontSize: 24, color: 'var(--color-primary)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{label}</div>
    </div>
  )
}
```
`components/blocks/Flow.tsx`:
```tsx
import type { ReactNode } from 'react'
export function Flow({ steps }: { steps: ReactNode[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', margin: 'var(--space-md) 0' }}>
      {steps.map((s, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'var(--color-surface-card)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>{s}</span>
          {i < steps.length - 1 && <span aria-hidden style={{ color: 'var(--color-primary)' }}>→</span>}
        </span>
      ))}
    </div>
  )
}
```
`components/blocks/CheatCard.tsx`:
```tsx
import type { ReactNode } from 'react'
export function CheatCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface-card)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div>{children}</div>
    </div>
  )
}
```

- [ ] **Step 7: 빌드 타입 확인**

Run: `npx tsc --noEmit`
Expected: 타입 에러 없음.

- [ ] **Step 8: Commit**

```bash
git add components/blocks app/globals.css
git commit -m "feat: port HTML content blocks to React components"
```

---

## Task 10: MDX 설정 + 컴포넌트 매핑

**Files:**
- Create: `mdx-components.tsx`
- Modify: `next.config.mjs`
- Install: `@next/mdx @mdx-js/react`

- [ ] **Step 1: MDX 패키지 설치**

Run: `npm install @next/mdx @mdx-js/loader @mdx-js/react`

- [ ] **Step 2: next.config에 MDX 연결**

`next.config.mjs`:
```js
import createMDX from '@next/mdx'
const withMDX = createMDX({})
/** @type {import('next').NextConfig} */
const nextConfig = { pageExtensions: ['ts', 'tsx', 'mdx'] }
export default withMDX(nextConfig)
```

- [ ] **Step 3: mdx-components 매핑**

`mdx-components.tsx`:
```tsx
import type { MDXComponents } from 'mdx/types'
import { Box } from '@/components/blocks/Box'
import { Tbl } from '@/components/blocks/Tbl'
import { Compare } from '@/components/blocks/Compare'
import { Formula } from '@/components/blocks/Formula'
import { CaseNote } from '@/components/blocks/CaseNote'
import { Stats, Stat } from '@/components/blocks/Stats'
import { Flow } from '@/components/blocks/Flow'
import { CheatCard } from '@/components/blocks/CheatCard'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Box, Tbl, Compare, Formula, CaseNote, Stats, Stat, Flow, CheatCard, ...components }
}
```
> `<Fact>`는 facts.json 데이터를 주입해야 하므로 챕터 페이지에서 wrapper로 제공(Task 13).

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공.

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs mdx-components.tsx package.json
git commit -m "feat: wire MDX with content block components"
```

---

## Task 11: 레이아웃 (topnav, footer, 전역 면책)

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/Disclaimer.tsx`

- [ ] **Step 1: Disclaimer 컴포넌트**

`components/Disclaimer.tsx`:
```tsx
export function Disclaimer() {
  return (
    <p role="note" style={{ fontSize: 12, color: 'var(--color-muted)', borderTop: '1px solid var(--color-hairline)', paddingTop: 12 }}>
      본 자료는 강의 정리 기반 <strong>사내 참고용</strong>입니다. 신고·납부 전 국가법령정보센터·국세청·홈택스·세무대리인 검토가 우선하며,
      회사는 본 자료 사용 결과에 대해 책임지지 않습니다.
    </p>
  )
}
```

- [ ] **Step 2: layout에 topnav/footer/면책 배치**

`app/layout.tsx` 본문(`<body>` 내부):
```tsx
<header style={{ position: 'sticky', top: 0, height: 64, display: 'flex', alignItems: 'center',
  padding: '0 var(--space-lg)', background: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline)', zIndex: 10 }}>
  <a href="/" style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>원천징수 레퍼런스</a>
  <nav style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-md)', fontSize: 14 }}>
    <a href="/updates-2026">2026 개정</a><a href="/review-due">검토 임박</a>
  </nav>
</header>
<main style={{ maxWidth: 880, margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>{children}</main>
<footer style={{ background: 'var(--color-surface-dark)', color: 'var(--color-on-dark)', padding: 'var(--space-xl) var(--space-lg)' }}>
  <div style={{ maxWidth: 880, margin: '0 auto' }}><Disclaimer /></div>
</footer>
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx components/Disclaimer.tsx
git commit -m "feat: add layout with sticky nav, footer, global disclaimer"
```

---

## Task 12: UpdatesDashboard (2026 개정 자동 렌더)

**Files:**
- Create: `components/UpdatesDashboard.tsx`, `app/updates-2026/page.tsx`
- Test: `test/components/UpdatesDashboard.test.tsx`

- [ ] **Step 1: 실패하는 테스트**

`test/components/UpdatesDashboard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpdatesDashboard } from '@/components/UpdatesDashboard'
import type { Fact } from '@/lib/facts/schema'

const base: Fact = {
  id: 'f_000001', slug: 's', chapter: 'ch3', claim: '고배당 9% 폐지, 누진 분리과세', sourceType: 'LAW',
  sourceTitle: '조특법', lawRef: '조세특례제한법 제104조의27', lawUrl: '', asOf: '2026-06-08',
  effectiveDate: '2026-01-01', verifyStatus: '확정', risk: 'high', changeType: '신설',
  previousValue: '고배당 9% 분리과세', history: [{ date: '2026-06-08', author: 'kms', note: 'n' }], nextReviewBy: '',
}

describe('UpdatesDashboard', () => {
  it('lists 2026 changes with before/after and effective date', () => {
    render(<UpdatesDashboard facts={[base]} />)
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument()
    expect(screen.getByText(/고배당 9% 분리과세/)).toBeInTheDocument()
    expect(screen.getByText(/신설/)).toBeInTheDocument()
  })
  it('renders empty state when no changes', () => {
    render(<UpdatesDashboard facts={[]} />)
    expect(screen.getByText(/개정 항목 없음/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run test/components/UpdatesDashboard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: 구현**

`components/UpdatesDashboard.tsx`:
```tsx
import type { Fact } from '@/lib/facts/schema'
import { dashboardFacts } from '@/lib/facts/store'
import { SourcePill } from './SourcePill'
import { VerifyStatus } from './VerifyStatus'

export function UpdatesDashboard({ facts }: { facts: Fact[] }) {
  const items = dashboardFacts(facts)
  if (items.length === 0) return <p style={{ color: 'var(--color-muted)' }}>개정 항목 없음.</p>
  return (
    <table className="wt-tbl">
      <thead><tr><th>항목</th><th>변경 전</th><th>2026 기준</th><th>시행일</th><th>구분</th><th>출처/검증</th></tr></thead>
      <tbody>
        {items.map((f) => (
          <tr key={f.id}>
            <td>{f.slug}</td>
            <td style={{ color: 'var(--color-muted)' }}>{f.previousValue || '—'}</td>
            <td>{f.claim}</td>
            <td className="mono">{f.effectiveDate || '—'}</td>
            <td>{f.changeType}</td>
            <td><SourcePill sourceType={f.sourceType} sourceTitle={f.sourceTitle} asOf={f.asOf} lawRef={f.lawRef} lawUrl={f.lawUrl} /> <VerifyStatus status={f.verifyStatus} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 4: 페이지 작성**

`app/updates-2026/page.tsx`:
```tsx
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { UpdatesDashboard } from '@/components/UpdatesDashboard'

export default function Page() {
  const facts = loadFacts(factsRaw)
  return (<><h1>2026년 원천징수 개정·시행</h1><UpdatesDashboard facts={facts} /></>)
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run test/components/UpdatesDashboard.test.tsx`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add components/UpdatesDashboard.tsx app/updates-2026 test/components/UpdatesDashboard.test.tsx
git commit -m "feat: add auto-rendered 2026 updates dashboard"
```

---

## Task 13: 챕터 페이지 + 검증요약

**Files:**
- Create: `app/ch/[slug]/page.tsx`, `components/ChapterVerifySummary.tsx`

- [ ] **Step 1: ChapterVerifySummary 구현(헬퍼는 Task4에서 테스트됨)**

`components/ChapterVerifySummary.tsx`:
```tsx
import type { Fact } from '@/lib/facts/schema'
import { chapterSummary } from '@/lib/facts/store'

export function ChapterVerifySummary({ facts }: { facts: Fact[] }) {
  const s = chapterSummary(facts)
  return (
    <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
      이 장 검증: <span style={{ color: 'var(--color-verified)' }}>확정 {s.확정}</span> ·{' '}
      <span style={{ color: 'var(--color-check)' }}>확인필요 {s.확인필요}</span> ·{' '}
      <span style={{ color: 'var(--color-lecture)' }}>강의기반 {s.강의기반}</span> / 총 {s.total}
    </p>
  )
}
```

- [ ] **Step 2: 챕터 라우트 (정적 생성 + MDX + Fact 주입)**

`app/ch/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import factsRaw from '@/content/facts.json'
import { loadFacts, byChapter } from '@/lib/facts/store'
import { ChapterVerifySummary } from '@/components/ChapterVerifySummary'
import { Fact } from '@/components/Fact'

const CHAPTERS = ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8','ch9','ch10','nonresident','interest-dividend','updates'] as const

export function generateStaticParams() {
  return CHAPTERS.map((slug) => ({ slug }))
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!CHAPTERS.includes(slug as any)) notFound()
  const facts = loadFacts(factsRaw)
  const chFacts = byChapter(facts, slug.startsWith('ch') ? slug : `ch_${slug}`)
  const factMap = Object.fromEntries(facts.map((f) => [f.id, f]))
  const F = ({ id, children }: { id: string; children: React.ReactNode }) =>
    factMap[id] ? <Fact data={factMap[id]}>{children}</Fact> : <>{children}</>
  const { default: MDX } = await import(`@/content/chapters/${slug}.mdx`)
  return (
    <article>
      <ChapterVerifySummary facts={chFacts} />
      <MDX components={{ F }} />
    </article>
  )
}
```
> MDX 안에서는 `<F id="f_xxxx">…</F>`로 사실을 감싼다(짧은 별칭). facts.json에 없는 id면 그냥 본문만 렌더.

- [ ] **Step 3: 타입 선언 (mdx import)**

`mdx.d.ts`:
```ts
declare module '*.mdx' { const C: (props: any) => JSX.Element; export default C }
```

- [ ] **Step 4: 빌드 확인(샘플 챕터는 Task 14에서 추가)**

Run: `npx tsc --noEmit`
Expected: 타입 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add app/ch components/ChapterVerifySummary.tsx mdx.d.ts
git commit -m "feat: add chapter route with MDX render and verify summary"
```

---

## Task 14: 파일럿 콘텐츠 시드 (수직 슬라이스 — 엔드투엔드 증명)

**Files:**
- Modify: `content/facts.json` (파일럿 10건 주입)
- Create: `content/chapters/ch3.mdx` (시드 챕터, 파일럿 fact 사용)

- [ ] **Step 1: 파일럿 산출(`content/facts.pilot.json`, 10건)을 facts.json으로 변환**

`content/facts.pilot.json`의 각 항목(claim2026 = 교정된 최종 문장)을 Task3 스키마로 매핑해 `content/facts.json`에 기록. id는 `f_`+해시 부여, history에 author/note 추가, `primarySourceVerified`/`confidenceScore`/`subordinateLawRef` 등 갭 필드 그대로 이관. ⚠️ 고배당(`ch03.high-dividend.special-tax`)은 **원본 9% → 14/20/25/30% 누진**으로 교정된 값 사용, previousValue에 원본 오류 기록. 예(고배당):
```json
[
  {
    "id": "f_hd1042", "slug": "ch03.high-dividend.special-tax", "chapter": "ch3",
    "claim": "<파일럿 claim2026>", "sourceType": "<파일럿>", "sourceTitle": "<파일럿>",
    "lawRef": "조세특례제한법 제104조의27", "lawUrl": "<파일럿 sourceUrl>",
    "asOf": "2026-06-08", "effectiveDate": "<파일럿>", "verifyStatus": "<파일럿>",
    "risk": "high", "changeType": "<파일럿>", "previousValue": "고배당 9% 분리과세",
    "history": [{ "date": "2026-06-08", "author": "kms", "note": "파일럿 1차 출처 검증" }],
    "nextReviewBy": "2027-03-31"
  }
]
```

- [ ] **Step 2: 시드 챕터 MDX 작성(ch3 일부, F로 사실 래핑)**

`content/chapters/ch3.mdx` (HANDOFF.md §20~24 + 감수 반영):
```mdx
# 원천징수 핵심

## 주요 원천징수 세율

<Tbl>
  <thead><tr><th>구분</th><th>세율</th></tr></thead>
  <tbody>
    <tr><td>비영업대금 이익</td><td><F id="f_int025">25%</F></td></tr>
    <tr><td>일반 이자·배당</td><td><F id="f_gen014">14%</F></td></tr>
  </tbody>
</Tbl>

<Box kind="imp" title="소액부징수 2024 개정">
  <F id="f_sml001">거주자 인적용역 사업소득은 2024.7.1 이후 지급분부터 1,000원 미만이어도 원천징수</F>한다.
</Box>
```
> `f_int025` 등 id는 Step1 facts.json의 실제 id와 일치시킬 것.

- [ ] **Step 3: facts.json 스키마 검증 테스트**

`test/facts-seed.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import raw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'

describe('seeded facts.json', () => {
  it('passes schema validation', () => {
    expect(() => loadFacts(raw)).not.toThrow()
  })
  it('has at least the pilot facts', () => {
    expect(loadFacts(raw).length).toBeGreaterThanOrEqual(10)
  })
})
```

- [ ] **Step 4: 빌드 + 테스트 + 로컬 확인**

Run: `npm test && npm run build`
Expected: 테스트 통과, ch3 정적 생성. `npm run dev` 후 `/ch/ch3`, `/updates-2026` 육안 확인(출처 배지·검증상태 표시).

- [ ] **Step 5: Commit**

```bash
git add content/facts.json content/chapters/ch3.mdx test/facts-seed.test.ts
git commit -m "feat: seed pilot facts and ch3 vertical slice"
```

---

## Task 15: 클라이언트 검색 (파일럿 라이브러리 결정 반영)

**Files:**
- Create: `lib/search/build-index.ts`, `components/Search.tsx`
- Test: `test/search.test.ts`

> 파일럿 calibration의 `검색 라이브러리 결정` 반영(기본 MiniSearch). 한글 부분매칭 품질 확인.

- [ ] **Step 1: 검색 라이브러리 설치**

Run: `npm install minisearch`

- [ ] **Step 2: 실패하는 테스트(인덱스 빌더)**

`test/search.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildIndex, searchIndex } from '@/lib/search/build-index'

const docs = [
  { id: 'ch3', title: '원천징수 핵심', text: '비영업대금 이익 25% 원천징수' },
  { id: 'ch6', title: '근로소득 비과세', text: '식대 비과세 월 20만원' },
]

describe('search', () => {
  it('builds index and finds by Korean term', () => {
    const idx = buildIndex(docs)
    const r = searchIndex(idx, '식대')
    expect(r[0].id).toBe('ch6')
  })
  it('supports prefix match', () => {
    const idx = buildIndex(docs)
    expect(searchIndex(idx, '원천').map(r => r.id)).toContain('ch3')
  })
})
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run test/search.test.ts`
Expected: FAIL.

- [ ] **Step 4: 구현**

`lib/search/build-index.ts`:
```ts
import MiniSearch from 'minisearch'

export interface Doc { id: string; title: string; text: string }

export function buildIndex(docs: Doc[]): MiniSearch<Doc> {
  const ms = new MiniSearch<Doc>({ fields: ['title', 'text'], storeFields: ['title', 'id'] })
  ms.addAll(docs)
  return ms
}

export function searchIndex(idx: MiniSearch<Doc>, q: string) {
  return idx.search(q, { prefix: true, fuzzy: 0.1 })
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run test/search.test.ts`
Expected: 2 passed.

> **한글 분절 확인(수동):** `식대비과세`(붙임), 조사 포함 쿼리 품질을 dev에서 확인. MiniSearch 토크나이저가 부족하면 calibration 권고대로 Pagefind 전환(이 태스크만 교체).

- [ ] **Step 6: Search UI(클라이언트) + 인덱스 직렬화는 빌드시 facts+chapters에서 생성**

`components/Search.tsx` (클라이언트 컴포넌트, 정적 인덱스 JSON fetch). 인덱스 크기 gzip ≤ 200KB 확인.

- [ ] **Step 7: Commit**

```bash
git add lib/search components/Search.tsx test/search.test.ts package.json
git commit -m "feat: add client-side search with MiniSearch"
```

---

## Task 16: 검토 임박 뷰 (/review-due)

**Files:**
- Create: `app/review-due/page.tsx`

- [ ] **Step 1: 페이지(헬퍼 reviewDue는 Task4 검증됨)**

`app/review-due/page.tsx`:
```tsx
import factsRaw from '@/content/facts.json'
import { loadFacts, reviewDue } from '@/lib/facts/store'

export default function Page() {
  const items = reviewDue(loadFacts(factsRaw))
  return (
    <>
      <h1>검토 임박 항목</h1>
      <table className="wt-tbl">
        <thead><tr><th>다음 검토일</th><th>항목</th><th>현재 상태</th></tr></thead>
        <tbody>{items.map((f) => (
          <tr key={f.id}><td className="mono">{f.nextReviewBy}</td><td>{f.slug}</td><td>{f.verifyStatus}</td></tr>
        ))}</tbody>
      </table>
    </>
  )
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add app/review-due
git commit -m "feat: add review-due page sorted by nextReviewBy"
```

---

## Task 17: 인쇄 스타일 (@media print)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: print 규칙 추가**

`app/globals.css`:
```css
@media print {
  header, footer nav, .wt-search { display: none !important; }
  main { max-width: 100%; }
  [role="note"][aria-label^="출처"], .wt-tbl { break-inside: avoid; }
  /* 출처 배지·시행일은 인쇄에서도 유지 (근거 출력 시나리오) */
  a[href]::after { content: " (" attr(href) ")"; font-size: 10px; color: #666; }
}
```

- [ ] **Step 2: 육안 확인(수동)**

`npm run dev` → `/ch/ch3` → 브라우저 인쇄 미리보기에서 출처 배지·시행일 유지 확인.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add print styles preserving source badges"
```

---

## Task 18: 빌드 검증 + Vercel 배포

**Files:**
- Create: `vercel.json` (필요 시), `README.md`(배포 안내)

- [ ] **Step 1: 전체 테스트 + 빌드 + 빌드시간 측정**

Run: `npm test && npm run build`
Expected: 전체 통과. 빌드 시간 기록 — **10분 초과 시 ISR 검토**(설계 Success Criteria).

- [ ] **Step 2: Lighthouse(수동)**

`npm run start` 후 Lighthouse: 접근성 ≥ 95, 성능 ≥ 90 확인. 미달 시 폰트 서브셋·이미지 점검.

- [ ] **Step 3: Vercel 연결**

Run:
```bash
npx --yes vercel link
npx --yes vercel --prod
```
Expected: 배포 URL 반환. git push(main) 시 자동 배포 동작 확인.

- [ ] **Step 4: Commit**

```bash
git add README.md vercel.json
git commit -m "chore: add Vercel deploy config and build verification"
```

---

## Task 19: 콘텐츠 포팅·검증 반복 프로세스 (P0 → P1)

나머지 챕터를 동일 패턴으로 포팅·검증. **반복 단위 = 1챕터.** 파일럿 calibration의 단계 분할 권고 반영.

**P0(우선): 감수 5건 + 신규 3장 ≈ 60~90 fact** → dogfood 배포(약 3~5주).
**P1: 원본 12장 나머지 fact 점진(4~13주).**

- [ ] **P0-0. law.go.kr 1차 원문 우회 절차 표준화(구조 리스크 해소):** 동적 로딩 우회 = ① 인쇄용 URL(`...&print=print`) ② 조문 PDF 캡처 ③ casenote 등 2차는 보조. 이 절차를 문서화하고 P1 전 챕터에 재사용. 1차 원문 직접 확인 시 `primarySourceVerified=true`.

각 챕터 반복 절차(체크리스트 — 챕터마다 1회):
- [ ] **a. fact 추출(CC):** 해당 챕터 HTML/HANDOFF 구간에서 세율·기한·금액임계치·한도·시행일·세목판정 항목을 fact 후보로 추출.
- [ ] **b. 1차 출처 검증(인간 판단 + P0-0 절차):** 각 fact를 법령/국세청 1차 출처와 대조 → `확정/확인필요/강의기반` + 출처/시행일/`primarySourceVerified`/`confidenceScore` 기입. 시행령 의존분은 `subordinateLawRef`. 해석 모호부는 `확인필요`, 강의 해석은 `강의기반`.
- [ ] **c. facts.json 추가:** Task3 스키마로 항목 추가. history에 author·date·note, `reviewerId` 기입.
- [ ] **d. MDX 작성:** `content/chapters/{slug}.mdx`에 본문 + `<F id>`로 사실 래핑 + 블록 컴포넌트 사용.
- [ ] **e. 검증:** `npm test`(facts.json 스키마 통과) + `npm run build` + dev 육안.
- [ ] **f. Commit:** `git commit -m "content: port and verify {chapter}"`.

신규 3장 슬러그: `updates`(2026 대시보드는 Task12로 자동, 본문 보강), `nonresident`(비거주자·외국법인), `interest-dividend`(이자·배당). 신규 3장은 `확인필요` 비율 높을 가능성 → 세무 전문가 검토 우선 배분.

> **≤350 fact 상한**(파일럿 권고) 초과 시 격하 규칙(`risk=low && sourceType=LECTURE` 우선 일반 산문화) 적용.

---

## Self-Review

- **Spec coverage:** 데이터 모델(T3-4)·출처 1급(T6-8)·블록 포팅(T9-10)·2026 대시보드(T12)·챕터+검증요약(T13)·검색(T15)·검토임박(T16)·인쇄(T17)·면책(T11)·배포(T18)·전체 검증 프로세스(T19) → 설계 Success Criteria 전 항목 매핑됨. fact 모집단/종결기준은 T19 절차 + T14 시드로 구현.
- **파일럿 의존:** 공수 추정·검색 라이브러리·≤500 상한은 파일럿(`wndz22ezf`) 완료 후 "검증 공수" 섹션 + T14/T15에 수치 반영.
- **Placeholder scan:** 코드 스텝은 실제 코드 포함. T14 facts.json 값만 파일럿 산출로 채움(의도된 데이터 주입, 구현 placeholder 아님).
- **Type consistency:** `Fact` 타입(schema.ts)을 store/components/pages 전체에서 단일 사용. 헬퍼명 `byChapter/dashboardFacts/reviewDue/chapterSummary` 일관.

## Execution Handoff

설계의 The Assignment(10 fact 파일럿)는 이미 Workflow로 실행 중 → 완료 시 T14 시드로 직결.
