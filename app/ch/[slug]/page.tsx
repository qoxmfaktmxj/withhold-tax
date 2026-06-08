import { notFound } from 'next/navigation'
import fs from 'node:fs'
import path from 'node:path'
import type { ReactNode } from 'react'
import factsRaw from '@/content/facts.json'
import { loadFacts, byChapter } from '@/lib/facts/store'
import { ChapterVerifySummary } from '@/components/ChapterVerifySummary'
import { Fact } from '@/components/Fact'

const CH_DIR = path.join(process.cwd(), 'content', 'chapters')

function chapterSlugs(): string[] {
  if (!fs.existsSync(CH_DIR)) return []
  return fs
    .readdirSync(CH_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function generateStaticParams() {
  return chapterSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!chapterSlugs().includes(slug)) notFound()

  const facts = loadFacts(factsRaw)
  const chFacts = byChapter(facts, slug)
  const factMap = Object.fromEntries(facts.map((f) => [f.id, f]))

  const F = ({ id, children }: { id: string; children: ReactNode }) =>
    factMap[id] ? <Fact data={factMap[id]}>{children}</Fact> : <>{children}</>

  let MDX: (props: { components?: Record<string, unknown> }) => ReactNode
  try {
    // Use relative path for webpack dynamic import context
    MDX = (await import(`../../../content/chapters/${slug}.mdx`)).default
  } catch {
    notFound()
  }

  return (
    <article>
      <ChapterVerifySummary facts={chFacts} />
      <MDX components={{ F }} />
    </article>
  )
}
