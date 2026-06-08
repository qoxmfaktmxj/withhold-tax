import type { Fact } from '@/lib/facts/schema'
import type { Doc } from './build-index'

export function factsToDocs(facts: Fact[]): Doc[] {
  return facts.map((f) => ({
    id: f.id,
    chapter: f.chapter,
    title: f.slug,
    text: f.claim,
  }))
}
