/** Pure client-safe chapter metadata — no Node.js fs/path imports */

export const CHAPTERS: { slug: string; title: string }[] = [
  { slug: 'ch1',             title: '소득세 기본구조' },
  { slug: 'ch2',             title: '법체계·세금분류' },
  { slug: 'ch3',             title: '원천징수 핵심' },
  { slug: 'ch4',             title: '가산세·신고실무' },
  { slug: 'ch5',             title: '거주자·해외파견' },
  { slug: 'ch6',             title: '근로소득 비과세 I' },
  { slug: 'ch7',             title: '신고서 작성·검증' },
  { slug: 'ch8',             title: '근로소득 비과세 II' },
  { slug: 'ch9',             title: '간이세액·퇴직소득' },
  { slug: 'ch10',            title: '사업·기타소득' },
  { slug: 'nonresident',     title: '비거주자·외국법인 원천징수' },
  { slug: 'interest-dividend', title: '이자·배당 원천징수' },
]

export const APPENDICES: { slug: string; title: string }[] = [
  { slug: 'glossary',    title: '부록 A · 핵심 용어 사전' },
  { slug: 'index',       title: '부록 B · 교재 페이지 색인' },
  { slug: 'cheatsheet',  title: '부록 C · 빠른 참조 치트시트' },
]

const _allEntries = [...CHAPTERS, ...APPENDICES]
const _titleMap = new Map(_allEntries.map((c) => [c.slug, c.title]))

export function chapterTitle(slug: string): string {
  return _titleMap.get(slug) ?? slug
}
