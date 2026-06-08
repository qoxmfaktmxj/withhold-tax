import { FactsFileSchema, type Fact } from './schema'

type Status = Fact['verifyStatus']

export function loadFacts(raw: unknown): Fact[] {
  return FactsFileSchema.parse(raw)
}

export function byChapter(facts: Fact[], chapter: string): Fact[] {
  return facts.filter((f) => f.chapter === chapter)
}

/** 개정·신설·폐지 등 변경이 있는 전체 항목, 시행일 최신순 */
export function dashboardFacts(facts: Fact[]): Fact[] {
  return facts
    .filter((f) => f.changeType !== '없음')
    .sort((a, b) => (b.effectiveDate || '').localeCompare(a.effectiveDate || ''))
}

export function reviewDue(facts: Fact[]): Fact[] {
  return facts
    .filter((f) => f.nextReviewBy !== '')
    .sort((a, b) => a.nextReviewBy.localeCompare(b.nextReviewBy))
}

export function chapterSummary(facts: Fact[]) {
  const acc: Record<Status, number> & { total: number } = {
    확정: 0,
    확인필요: 0,
    강의기반: 0,
    total: facts.length,
  }
  for (const f of facts) acc[f.verifyStatus]++
  return acc
}
