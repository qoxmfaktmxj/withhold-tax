// Build content/search-index.json from content/chapters/*.mdx (full-text, section-level).
// Run: node scripts/gen-search-index.mjs   (auto-run via npm "prebuild")
import fs from 'node:fs'
import path from 'node:path'
import { splitSections } from '../lib/search/extract.mjs'

const ROOT = process.cwd()
const CH_DIR = path.join(ROOT, 'content', 'chapters')
const META = path.join(ROOT, 'lib', 'chapter-meta.ts')
const OUT = path.join(ROOT, 'content', 'search-index.json')

// title map from chapter-meta.ts (stable literal — regex parse, no TS runtime needed)
function titleMap() {
  const src = fs.readFileSync(META, 'utf8')
  const map = {}
  const re = /\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)'/g
  let m
  while ((m = re.exec(src))) map[m[1]] = m[2]
  return map
}

// chapter-meta order, then any extra files appended
function ordered(slugs, titles) {
  const order = Object.keys(titles)
  return [...slugs].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })
}

const titles = titleMap()
const files = fs.readdirSync(CH_DIR).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''))

const docs = []
for (const slug of ordered(files, titles)) {
  const mdx = fs.readFileSync(path.join(CH_DIR, `${slug}.mdx`), 'utf8')
  const title = titles[slug] || slug
  for (const s of splitSections(mdx, slug, title)) {
    if (!s.text && !s.heading) continue
    docs.push({
      id: s.id,
      chapter: slug,
      sectionId: s.sectionId,
      heading: s.heading,
      level: s.headingLevel,
      text: s.text,
    })
  }
}

fs.writeFileSync(OUT, JSON.stringify(docs), 'utf8')
console.log('wrote', path.relative(ROOT, OUT), '—', docs.length, 'sections from', files.length, 'chapters')
