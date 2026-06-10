'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { buildIndex, searchIndex, type Doc } from '@/lib/search/build-index'
import { chapterTitle } from '@/lib/chapter-meta'
import searchData from '@/content/search-index.json'

const DOCS = searchData as Doc[]
const MAX = 14

/** Build a ~90-char snippet around the first matched term, with <mark> highlight. */
function snippet(text: string, terms: string[]): { pre: string; hit: string; post: string } | null {
  if (!text) return null
  const lower = text.toLowerCase()
  let at = -1
  let len = 0
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase())
    if (i >= 0 && (at < 0 || i < at)) {
      at = i
      len = t.length
    }
  }
  if (at < 0) return { pre: text.slice(0, 96), hit: '', post: '' }
  const start = Math.max(0, at - 32)
  return {
    pre: (start > 0 ? '…' : '') + text.slice(start, at),
    hit: text.slice(at, at + len),
    post: text.slice(at + len, at + len + 60) + (at + len + 60 < text.length ? '…' : ''),
  }
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const idx = useMemo(() => buildIndex(DOCS), [])
  const results = useMemo(
    () => (query.trim() ? searchIndex(idx, query.trim()).slice(0, MAX) : []),
    [idx, query]
  )
  const safeActive = results.length ? Math.min(active, results.length - 1) : 0

  const openPalette = useCallback(() => {
    setActive(0)
    setOpen(true)
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  // global hotkey: ⌘K / Ctrl+K toggles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) closePalette()
        else openPalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closePalette, open, openPalette])

  // focus input on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 20)
      return () => clearTimeout(t)
    }
  }, [open])

  // keep active row in view
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${safeActive}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [safeActive])

  const go = useCallback(
    (chapter: string, sectionId: string) => {
      const url = `/ch/${chapter}${sectionId ? `#${sectionId}` : ''}`
      closePalette()
      // scroll:false stops App Router's scroll-to-top; <HashScroll> on the chapter
      // page does the actual scroll-to-section (on mount + hashchange).
      router.push(url, { scroll: !sectionId })
    },
    [closePalette, router]
  )

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[safeActive]
      if (r) go(r.chapter, r.sectionId)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closePalette()
    }
  }

  return (
    <>
      {/* Sidebar trigger */}
      <button type="button" className="wt-cmdk-trigger" onClick={openPalette} aria-label="전체 검색 열기">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="wt-cmdk-trigger-label">전체 검색</span>
        <kbd className="wt-cmdk-kbd">Ctrl K</kbd>
      </button>

      {/* Floating trigger — mobile only (sidebar hidden ≤640px) */}
      <button type="button" className="wt-cmdk-fab" onClick={openPalette} aria-label="전체 검색 열기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="wt-cmdk-overlay" role="presentation" onMouseDown={closePalette}>
          <div
            className="wt-cmdk-panel"
            role="dialog"
            aria-modal="true"
            aria-label="전체 본문 검색"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="wt-cmdk-input-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--gray-400)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="전체 본문 검색 — 예: 식대, 납부지연, 비거주자 세율…"
                aria-label="전체 본문 검색"
                aria-controls="wt-cmdk-results"
                aria-activedescendant={results.length ? `wt-cmdk-opt-${safeActive}` : undefined}
                className="wt-cmdk-input"
              />
              <kbd className="wt-cmdk-kbd" onClick={closePalette} style={{ cursor: 'pointer' }}>esc</kbd>
            </div>

            {query.trim() && (
              <ul id="wt-cmdk-results" ref={listRef} className="wt-cmdk-results" role="listbox" aria-label="검색 결과">
                {results.length === 0 && (
                  <li className="wt-cmdk-empty" role="option" aria-selected="false">
                    “{query.trim()}” 검색 결과 없음
                  </li>
                )}
                {results.map((r, i) => {
                  const snip = snippet(r.text as string, r.terms)
                  return (
                    <li
                      key={r.id}
                      id={`wt-cmdk-opt-${i}`}
                      data-i={i}
                      role="option"
                      aria-selected={i === safeActive}
                      className={`wt-cmdk-item${i === safeActive ? ' is-active' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        go(r.chapter, r.sectionId)
                      }}
                    >
                      <div className="wt-cmdk-item-top">
                        <span className="wt-cmdk-item-chapter">{chapterTitle(r.chapter)}</span>
                        <span className="wt-cmdk-item-heading">{r.heading}</span>
                      </div>
                      {snip && (
                        <div className="wt-cmdk-item-snip">
                          {snip.pre}
                          {snip.hit && <mark>{snip.hit}</mark>}
                          {snip.post}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="wt-cmdk-footer">
              <span><kbd className="wt-cmdk-kbd-sm">↑</kbd><kbd className="wt-cmdk-kbd-sm">↓</kbd> 이동</span>
              <span><kbd className="wt-cmdk-kbd-sm">↵</kbd> 해당 위치로</span>
              <span><kbd className="wt-cmdk-kbd-sm">esc</kbd> 닫기</span>
              <span className="wt-cmdk-footer-count">{query.trim() ? `${results.length}건` : `${DOCS.length}개 섹션 색인`}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
