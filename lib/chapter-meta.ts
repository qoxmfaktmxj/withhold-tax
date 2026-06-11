/** Pure client-safe chapter metadata — no Node.js fs/path imports */

/** 주제 분류 — 디자인 시스템의 카테고리 컬러 코딩 키 (globals.css --cat-*) */
export type ChapterCat =
  | 'structure' // 기본구조·법체계
  | 'core'      // 원천징수 핵심
  | 'penalty'   // 가산세·신고실무
  | 'global'    // 거주자·비거주자·국제
  | 'exempt'    // 근로소득 비과세
  | 'payroll'   // 간이세액·퇴직소득
  | 'income'    // 사업·기타·이자배당
  | 'appendix'  // 부록

export const CHAPTERS: { slug: string; title: string; cat: ChapterCat }[] = [
  { slug: 'ch1',             title: '소득세 기본구조',            cat: 'structure' },
  { slug: 'ch2',             title: '법체계·세금분류',            cat: 'structure' },
  { slug: 'ch3',             title: '원천징수 핵심',              cat: 'core' },
  { slug: 'ch4',             title: '가산세·신고실무',            cat: 'penalty' },
  { slug: 'ch5',             title: '거주자·해외파견',            cat: 'global' },
  { slug: 'ch6',             title: '근로소득 비과세 I',          cat: 'exempt' },
  { slug: 'ch7',             title: '신고서 작성·검증',           cat: 'penalty' },
  { slug: 'ch8',             title: '근로소득 비과세 II',         cat: 'exempt' },
  { slug: 'ch9',             title: '간이세액·퇴직소득',          cat: 'payroll' },
  { slug: 'ch10',            title: '사업·기타소득',              cat: 'income' },
  { slug: 'nonresident',     title: '비거주자·외국법인 원천징수', cat: 'global' },
  { slug: 'interest-dividend', title: '이자·배당 원천징수',       cat: 'income' },
]

export const APPENDICES: { slug: string; title: string; cat: ChapterCat }[] = [
  { slug: 'glossary',    title: '부록 A · 핵심 용어 사전',     cat: 'appendix' },
  { slug: 'index',       title: '부록 B · 교재 페이지 색인',   cat: 'appendix' },
  { slug: 'cheatsheet',  title: '부록 C · 빠른 참조 치트시트', cat: 'appendix' },
]

const _allEntries = [...CHAPTERS, ...APPENDICES]
const _titleMap = new Map(_allEntries.map((c) => [c.slug, c.title]))
const _catMap = new Map(_allEntries.map((c) => [c.slug, c.cat]))

export function chapterTitle(slug: string): string {
  return _titleMap.get(slug) ?? slug
}

export function chapterCat(slug: string): ChapterCat {
  return _catMap.get(slug) ?? 'appendix'
}
