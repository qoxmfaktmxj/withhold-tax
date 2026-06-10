import type { ReactNode } from 'react'
import { Box } from '@/components/blocks/Box'

export function DevNote({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <Box kind="tip" title={`◆ ${title ?? '화면 구현 포인트'}`}>
      {children}
    </Box>
  )
}
