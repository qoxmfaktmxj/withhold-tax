import MiniSearch from 'minisearch'

export type SearchDocKind =
  | 'chapter-section'
  | 'fact'
  | 'tax-rule'
  | 'screen-guide'
  | 'source'
  | 'watch-item'

/** A searchable internal-reference document. */
export interface Doc {
  id: string
  kind: SearchDocKind
  chapter: string
  sectionId: string // github-slugger anchor; '' = chapter top
  heading: string
  text: string
  href: string
  level?: number
}

export type SearchResultDoc = Doc & {
  id: string
  terms: string[]
  score: number
}

export function buildIndex(docs: Doc[]): MiniSearch<Doc> {
  const ms = new MiniSearch<Doc>({
    fields: ['heading', 'text'],
    storeFields: ['heading', 'id', 'kind', 'chapter', 'sectionId', 'text', 'href'],
    // heading matches weigh more than body matches
    searchOptions: { boost: { heading: 3 } },
    tokenize: (text) => text.split(/[\s,()·]+/).filter(Boolean),
    processTerm: (term) => term.toLowerCase(),
  })
  ms.addAll(docs)
  return ms
}

export function searchIndex(idx: MiniSearch<Doc>, q: string) {
  return idx.search(q, { prefix: true, fuzzy: 0.1, boost: { heading: 3 } }) as unknown as SearchResultDoc[]
}
