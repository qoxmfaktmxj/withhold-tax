// Build content/search-index.json from chapters, facts, rules, screen guides, sources, and watchlist.
// Run: node scripts/gen-search-index.mjs   (auto-run via npm "prebuild")
import fs from 'node:fs'
import path from 'node:path'
import { splitSections, stripMarkdown } from '../lib/search/extract.mjs'

const ROOT = process.cwd()
const CH_DIR = path.join(ROOT, 'content', 'chapters')
const SCREEN_GUIDE_DIR = path.join(ROOT, 'content', 'screen-guides')
const RULE_DIR = path.join(ROOT, 'content', 'tax-rules', '2026')
const FACTS = path.join(ROOT, 'content', 'facts.json')
const SOURCES = path.join(ROOT, 'content', 'sources.json')
const WATCHLIST = path.join(ROOT, 'content', 'law-watchlist.json')
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
function pushDoc(doc) {
  docs.push({
    sectionId: '',
    level: 1,
    ...doc,
  })
}

for (const slug of ordered(files, titles)) {
  const mdx = fs.readFileSync(path.join(CH_DIR, `${slug}.mdx`), 'utf8')
  const title = titles[slug] || slug
  for (const s of splitSections(mdx, slug, title)) {
    if (!s.text && !s.heading) continue
    pushDoc({
      id: s.id,
      kind: 'chapter-section',
      chapter: slug,
      sectionId: s.sectionId,
      heading: s.heading,
      level: s.headingLevel,
      text: s.text,
      href: `/ch/${slug}${s.sectionId ? `#${s.sectionId}` : ''}`,
    })
  }
}

const facts = JSON.parse(fs.readFileSync(FACTS, 'utf8'))
for (const fact of facts) {
  pushDoc({
    id: `fact:${fact.id}`,
    kind: 'fact',
    chapter: fact.chapter || 'facts',
    heading: fact.title || fact.slug || fact.id,
    text: [
      fact.id,
      fact.slug,
      fact.claim,
      fact.lawRef,
      fact.sourceTitle,
      fact.incomeType,
      fact.appliesTo,
    ].filter(Boolean).join(' '),
    href: `/ch/${fact.chapter || 'ch1'}`,
  })
}

function ruleHref(rule) {
  if (rule.ruleId === 'payment_statement_penalty') return '/tools/statement-penalty'
  if (rule.domain === 'deadline') return '/tools/filing-deadline'
  if (rule.domain === 'penalty') return '/tools/late-payment-penalty'
  if (rule.domain === 'non-taxable') return '/tools/non-taxable-cap'
  if (rule.domain === 'local-income-tax') return '/tools'
  if (rule.domain === 'withholding-rate' && rule.incomeType === 'business') return '/calculators/business-income'
  return '/tools'
}

const seenRuleDocIds = new Map()
for (const file of fs.readdirSync(RULE_DIR).filter((name) => name.endsWith('.json')).sort()) {
  const rules = JSON.parse(fs.readFileSync(path.join(RULE_DIR, file), 'utf8'))
  if (!Array.isArray(rules)) {
    if (file === 'treaty-rates.json' && Array.isArray(rules.rates)) {
      for (const entry of rules.rates) {
        pushDoc({
          id: `treaty-rate:${entry.countryCode}`,
          kind: 'treaty-rate',
          chapter: 'nonresident',
          heading: `${entry.country} 조세조약 제한세율`,
          text: [
            entry.country,
            entry.countryCode,
            entry.region,
            `이자 ${entry.interest?.join('/')}`,
            `배당25 ${entry.dividend?.major25?.join('/')}`,
            `배당기타 ${entry.dividend?.other?.join('/')}`,
            `사용료 ${entry.royalty?.join('/')}`,
            entry.note,
            ...(rules.warnings || []),
          ].filter(Boolean).join(' '),
          href: '/ch/nonresident#주요-34개국-제한세율-표',
        })
      }
    }
    continue
  }
  for (const rule of rules) {
    const baseId = `tax-rule:${rule.ruleId}`
    const seenCount = seenRuleDocIds.get(baseId) || 0
    seenRuleDocIds.set(baseId, seenCount + 1)
    pushDoc({
      id: seenCount === 0 ? baseId : `${baseId}:${rule.version}`,
      kind: 'tax-rule',
      chapter: rule.incomeType || 'all',
      heading: rule.name || rule.ruleId,
      text: [
        rule.ruleId,
        rule.domain,
        rule.incomeType,
        rule.formula?.expression,
        ...(rule.factIds || []),
        ...(rule.warnings || []),
      ].filter(Boolean).join(' '),
      href: ruleHref(rule),
    })
  }
}

for (const file of fs.readdirSync(SCREEN_GUIDE_DIR).filter((name) => name.endsWith('.mdx')).sort()) {
  const slug = file.replace(/\.mdx$/, '')
  const mdx = fs.readFileSync(path.join(SCREEN_GUIDE_DIR, file), 'utf8')
  pushDoc({
    id: `screen-guide:${slug}`,
    kind: 'screen-guide',
    chapter: 'screen-guides',
    heading: slug,
    text: stripMarkdown(mdx),
    href: `/screen-guides/${slug}`,
  })
}

const sources = JSON.parse(fs.readFileSync(SOURCES, 'utf8'))
for (const source of sources) {
  pushDoc({
    id: `source:${source.id}`,
    kind: 'source',
    chapter: 'sources',
    heading: source.title || source.id,
    text: [source.id, source.type, source.publisher, source.url, source.notes].filter(Boolean).join(' '),
    href: '/sources',
  })
}

const watchlist = JSON.parse(fs.readFileSync(WATCHLIST, 'utf8'))
for (const item of watchlist) {
  pushDoc({
    id: `watch-item:${item.watchId}`,
    kind: 'watch-item',
    chapter: 'watchlist',
    heading: item.title,
    text: [
      item.watchId,
      item.status,
      item.expectedEffectiveDate,
      item.nextCheckDate,
      item.notes,
      ...(item.impact || []),
      ...(item.relatedFactIds || []),
    ].filter(Boolean).join(' '),
    href: '/updates-2026',
  })
}

fs.writeFileSync(OUT, JSON.stringify(docs), 'utf8')
console.log('wrote', path.relative(ROOT, OUT), '—', docs.length, 'docs from', files.length, 'chapters')
