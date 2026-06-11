import fs from 'node:fs'
import path from 'node:path'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import factsRaw from '@/content/facts.json'
import { loadFacts } from '@/lib/facts/store'
import { getScreenGuideSpec, screenGuideTitle } from '@/lib/screen-guides'
import { Fact } from '@/components/Fact'
import { HashScroll } from '@/components/HashScroll'
import { ScreenSpec } from '@/components/guides/ScreenSpec'
import { StructuredScreenSpec } from '@/components/guides/StructuredScreenSpec'
import { DevNote } from '@/components/guides/DevNote'
import { TaxRisk } from '@/components/guides/TaxRisk'

const SG_DIR = path.join(process.cwd(), 'content', 'screen-guides')

function availableScreenGuideSlugs(): string[] {
  if (!fs.existsSync(SG_DIR)) return []
  return fs
    .readdirSync(SG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function generateStaticParams() {
  return availableScreenGuideSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false

export default async function ScreenGuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!availableScreenGuideSlugs().includes(slug)) notFound()
  const structuredSpec = getScreenGuideSpec(slug)

  const facts = loadFacts(factsRaw)
  const factMap = Object.fromEntries(facts.map((f) => [f.id, f]))

  const F = ({ id, children }: { id: string; children: ReactNode }) =>
    factMap[id] ? <Fact data={factMap[id]}>{children}</Fact> : <>{children}</>

  let MDX: (props: { components?: Record<string, unknown> }) => ReactNode
  try {
    MDX = (await import(`../../../content/screen-guides/${slug}.mdx`)).default
  } catch {
    notFound()
  }

  return (
    <article className="wt-article">
      <HashScroll />
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>{screenGuideTitle(slug)}</h1>
      {structuredSpec && <StructuredScreenSpec spec={structuredSpec} />}
      <MDX
        components={{
          F,
          ScreenSpec,
          DevNote,
          TaxRisk,
        }}
      />
    </article>
  )
}
