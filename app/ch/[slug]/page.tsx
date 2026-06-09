import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import factsRaw from '@/content/facts.json'
import { loadFacts, byChapter } from '@/lib/facts/store'
import { availableChapterSlugs, chapterTitle } from '@/lib/chapters'
import { ChapterVerifySummary } from '@/components/ChapterVerifySummary'
import { Fact } from '@/components/Fact'

export function generateStaticParams() {
  return availableChapterSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!availableChapterSlugs().includes(slug)) notFound()

  const facts = loadFacts(factsRaw)
  const chFacts = byChapter(facts, slug)
  const factMap = Object.fromEntries(facts.map((f) => [f.id, f]))

  const F = ({ id, children }: { id: string; children: ReactNode }) =>
    factMap[id] ? <Fact data={factMap[id]}>{children}</Fact> : <>{children}</>

  let MDX: (props: { components?: Record<string, unknown> }) => ReactNode
  try {
    MDX = (await import(`../../../content/chapters/${slug}.mdx`)).default
  } catch {
    notFound()
  }

  return (
    <article className="wt-article">
      {/* Chapter title from CHAPTERS meta */}
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>
        {chapterTitle(slug)}
      </h1>

      {/* Verify summary as refined meta line */}
      <ChapterVerifySummary facts={chFacts} />

      {/* MDX content */}
      <MDX components={{ F }} />
    </article>
  )
}
