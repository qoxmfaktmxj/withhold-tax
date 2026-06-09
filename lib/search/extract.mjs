// Pure MDX → search-section extraction. Used by scripts/gen-search-index.mjs and tests.
// No Next/React imports so it runs under plain node and vitest alike.
import GithubSlugger from 'github-slugger'

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/

/**
 * Strip MDX/JSX/markdown down to plain searchable text.
 * Removes JSX & HTML tags, decodes the few entities we use, drops markdown syntax,
 * keeps the human-readable text content (incl. table cell text).
 */
export function stripMarkdown(src) {
  let t = src
  // JSX/HTML tags (incl. <F id="...">, <Box kind="..">, </F>, self-closing)
  t = t.replace(/<\/?[A-Za-z][^>]*?>/g, ' ')
  // entities we actually use in content
  t = t
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
  // markdown links [text](url) -> text
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  // images ![alt](url) -> alt
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  // table pipes & alignment rows
  t = t.replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, ' ') // |---|---| separators
  t = t.replace(/\|/g, ' ')
  // blockquote / list markers (line-start only, so decoded '>' in body survives)
  t = t.replace(/^\s*>+\s?/gm, ' ')
  t = t.replace(/^\s*[-+]\s+/gm, ' ')
  // emphasis / inline code / heading markers
  t = t.replace(/[*_`#]+/g, ' ')
  // collapse whitespace
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

/** Heading text as rehype-slug would see it (rendered text content). */
function headingPlainText(raw) {
  // strip inline markdown emphasis/code so slug matches rendered text
  return raw
    .replace(/<\/?[A-Za-z][^>]*?>/g, '')
    .replace(/[*_`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Split one MDX chapter into section docs.
 * Each markdown heading (## .. ######) starts a new section; content before the
 * first heading becomes an intro section (sectionId '' → links to chapter top).
 * sectionId is produced by github-slugger so it matches rehype-slug anchors.
 *
 * @returns {{id:string, chapter:string, sectionId:string, heading:string, headingLevel:number, text:string}[]}
 */
export function splitSections(mdx, chapter, chapterTitle = '') {
  const slugger = new GithubSlugger()
  const lines = mdx.split(/\r?\n/)

  const sections = []
  let cur = { heading: chapterTitle, headingLevel: 1, sectionId: '', body: [] }
  let started = false

  for (const line of lines) {
    const m = line.match(HEADING_RE)
    if (m) {
      // flush previous (skip empty intro with no body)
      if (started || cur.body.join('').trim()) sections.push(cur)
      const level = m[1].length
      const rawHeading = m[2].trim()
      const plain = headingPlainText(rawHeading)
      cur = {
        heading: plain || rawHeading,
        headingLevel: level,
        sectionId: slugger.slug(plain || rawHeading),
        body: [],
      }
      started = true
    } else {
      cur.body.push(line)
    }
  }
  if (started || cur.body.join('').trim()) sections.push(cur)

  return sections.map((s, i) => ({
    id: `${chapter}__${i}`,
    chapter,
    sectionId: s.sectionId,
    heading: s.heading,
    headingLevel: s.headingLevel,
    text: stripMarkdown(s.body.join('\n')),
  }))
}
