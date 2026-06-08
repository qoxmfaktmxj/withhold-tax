import type { MDXComponents } from 'mdx/types'
import { Box } from '@/components/blocks/Box'
import { Tbl } from '@/components/blocks/Tbl'
import { Compare } from '@/components/blocks/Compare'
import { Formula } from '@/components/blocks/Formula'
import { CaseNote } from '@/components/blocks/CaseNote'
import { Stats, Stat } from '@/components/blocks/Stats'
import { Flow } from '@/components/blocks/Flow'
import { CheatCard } from '@/components/blocks/CheatCard'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Box, Tbl, Compare, Formula, CaseNote, Stats, Stat, Flow, CheatCard, ...components }
}
