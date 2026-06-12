import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import factsRaw from '@/content/facts.json'
import { loadFacts, byChapter } from '@/lib/facts/store'
import { availableChapterSlugs, chapterTitle } from '@/lib/chapters'
import { chapterCat } from '@/lib/chapter-meta'
import { ChapterVerifySummary } from '@/components/ChapterVerifySummary'
import { Fact } from '@/components/Fact'
import { HashScroll } from '@/components/HashScroll'

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
  } catch (err) {
    console.error(`[chapter-mdx] import failed for ${slug}:`, err)
    notFound()
  }

  return (
    <article className="wt-article">
      <HashScroll />
      {/* Chapter title from CHAPTERS meta — category-colored eyebrow */}
      <header className="wt-hero" data-cat={chapterCat(slug)} style={{ borderBottom: 'none', padding: 0, marginBottom: 0 }}>
        <span className="wt-hero-eyebrow">
          {slug.startsWith('ch')
            ? `Chapter ${slug.replace('ch', '').padStart(2, '0')}`
            : chapterCat(slug) === 'appendix'
              ? '부록 · Appendix'
              : '특별편 · Special'}
        </span>
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>
          {chapterTitle(slug)}
        </h1>
      </header>

      {/* Verify summary as refined meta line */}
      <ChapterVerifySummary facts={chFacts} />

      {/* MDX content */}
      <MDX components={{ F }} />
    </article>
  )
}
