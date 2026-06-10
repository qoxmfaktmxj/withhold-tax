import type { ReactNode } from 'react'
import { Box } from '@/components/blocks/Box'

export function TaxRisk({
  level = 'medium',
  children,
}: {
  level?: 'high' | 'medium'
  children: ReactNode
}) {
  if (level === 'high') {
    return (
      <Box kind="imp" title="◆ 세무 리스크 (high)">
        {children}
      </Box>
    )
  }
  return (
    <Box kind="warn" title="◆ 세무 리스크">
      {children}
    </Box>
  )
}
