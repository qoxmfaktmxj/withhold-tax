import { SourcesFileSchema, type SourceRecord } from './schema'

export function loadSources(raw: unknown): SourceRecord[] {
  return SourcesFileSchema.parse(raw)
}

export function sourceById(sources: SourceRecord[], id: string): SourceRecord | undefined {
  return sources.find((s) => s.id === id)
}

export function byReliability(sources: SourceRecord[]) {
  const acc: Record<SourceRecord['reliability'], SourceRecord[]> = {
    primary: [],
    'official-guide': [],
    secondary: [],
  }
  for (const s of sources) acc[s.reliability].push(s)
  return acc
}
