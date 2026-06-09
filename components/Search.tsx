'use client'

import { useState, useMemo } from 'react'
import { buildIndex, searchIndex, type Doc } from '@/lib/search/build-index'
import { chapterTitle } from '@/lib/chapter-meta'

interface SearchProps {
  docs: Doc[]
  availableChapters: string[]
}

export function Search({ docs, availableChapters }: SearchProps) {
  const [query, setQuery] = useState('')
  const idx = useMemo(() => buildIndex(docs), [docs])
  const results = useMemo(() => (query.trim() ? searchIndex(idx, query.trim()) : []), [idx, query])
  const availableSet = useMemo(() => new Set(availableChapters), [availableChapters])

  return (
    <div className="wt-search" style={{ margin: 'var(--space-xl) 0', maxWidth: 520 }}>
      <label
        htmlFor="fact-search"
        style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-muted)' }}
      >
        규정 검색
      </label>
      <input
        id="fact-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="예: 식대, 소액부징수, 비과세…"
        className="wt-search-input"
        aria-label="원천징수 규정 검색"
        aria-expanded={results.length > 0}
        aria-owns="search-results-list"
      />
      {results.length > 0 && (
        <ul
          id="search-results-list"
          className="wt-search-results"
          role="listbox"
          aria-label="검색 결과"
        >
          {results.map((r) => (
            <li key={r.id} className="wt-search-item" role="option">
              {availableSet.has(r.chapter) ? (
                <a href={`/ch/${r.chapter}`}>
                  <span style={{ color: 'var(--color-muted-soft)', fontSize: 11, marginRight: 8 }}>
                    {chapterTitle(r.chapter)}
                  </span>
                  <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{r.title}</strong>
                </a>
              ) : (
                <span style={{ color: 'var(--color-muted)' }}>
                  <span style={{ fontSize: 11, marginRight: 8 }}>{chapterTitle(r.chapter)}</span>
                  {r.title}
                  <span style={{ color: 'var(--color-muted-soft)', fontSize: 11, marginLeft: 6 }}>(작성 예정)</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
