import MiniSearch from 'minisearch'

/** A searchable section of chapter content (one per heading). */
export interface Doc {
  id: string
  chapter: string
  sectionId: string // github-slugger anchor; '' = chapter top
  heading: string
  text: string
  level?: number
}

export function buildIndex(docs: Doc[]): MiniSearch<Doc> {
  const ms = new MiniSearch<Doc>({
    fields: ['heading', 'text'],
    storeFields: ['heading', 'id', 'chapter', 'sectionId', 'text'],
    // heading matches weigh more than body matches
    searchOptions: { boost: { heading: 3 } },
    tokenize: (text) => text.split(/[\s,()·]+/).filter(Boolean),
    processTerm: (term) => term.toLowerCase(),
  })
  ms.addAll(docs)
  return ms
}

export function searchIndex(idx: MiniSearch<Doc>, q: string) {
  return idx.search(q, { prefix: true, fuzzy: 0.1, boost: { heading: 3 } })
}
