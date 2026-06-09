import fs from 'node:fs'
import path from 'node:path'

// Re-export pure client-safe metadata from chapter-meta
export { CHAPTERS, APPENDICES, chapterTitle } from './chapter-meta'

const CH_DIR = path.join(process.cwd(), 'content', 'chapters')

export function availableChapterSlugs(): string[] {
  if (!fs.existsSync(CH_DIR)) return []
  return fs.readdirSync(CH_DIR).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''))
}
