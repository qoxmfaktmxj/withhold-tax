import type { Fact } from '@/lib/facts/schema'
import { chapterTitle } from '@/lib/chapter-meta'
import type { Doc } from './build-index'

/**
 * Map facts → search Docs. Superseded by the full-text section index
 * (content/search-index.json); kept for fact-only search fallbacks.
 * Facts have no section anchor, so sectionId is '' (links to chapter top).
 */
export function factsToDocs(facts: Fact[]): Doc[] {
  return facts.map((f) => ({
    id: f.id,
    chapter: f.chapter,
    sectionId: '',
    heading: f.title || chapterTitle(f.chapter),
    text: f.claim,
  }))
}
