import MiniSearch from 'minisearch'

export interface Doc { id: string; chapter: string; title: string; text: string }

export function buildIndex(docs: Doc[]): MiniSearch<Doc> {
  const ms = new MiniSearch<Doc>({
    fields: ['title', 'text'],
    storeFields: ['title', 'id', 'chapter'],
    tokenize: (text) => text.split(/[\s,]+/).filter(Boolean),
    processTerm: (term) => term,
  })
  ms.addAll(docs)
  return ms
}

export function searchIndex(idx: MiniSearch<Doc>, q: string) {
  return idx.search(q, { prefix: true, fuzzy: 0.1 })
}
