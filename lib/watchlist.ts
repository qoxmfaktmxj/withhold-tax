import { z } from 'zod'

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')

export const WatchStatus = z.enum([
  'watching',
  'confirmed',
  'implemented',
  'released',
  'deferred',
  'not_applicable',
])

export const WatchItemSchema = z.object({
  watchId: z.string().regex(/^watch_[a-z0-9_]+$/, 'watch_ + snake_case'),
  title: z.string().min(1),
  expectedEffectiveDate: ymd,
  status: WatchStatus,
  owner: z.string().min(1),
  nextCheckDate: ymd,
  impact: z.array(z.string().min(1)).min(1),
  notes: z.string().default(''),
  relatedFactIds: z.array(z.string().regex(/^f_[a-z0-9]+$/, 'f_ + alphanumeric')),
})

export type WatchItem = z.infer<typeof WatchItemSchema>
export type WatchStatusValue = z.infer<typeof WatchStatus>

export const WatchlistFileSchema = z.array(WatchItemSchema)

export function loadWatchlist(raw: unknown): WatchItem[] {
  return WatchlistFileSchema.parse(raw)
}
