import type { Fact } from '@/lib/facts/schema'
import { chapterTitle } from '@/lib/chapter-meta'
import type { Doc } from './build-index'

export function factsToDocs(facts: Fact[]): Doc[] {
  return facts.map((f) => ({
    id: f.id,
    chapter: f.chapter,
    title: f.title || chapterTitle(f.chapter),
    text: f.claim,
  }))
}
