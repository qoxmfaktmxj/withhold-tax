'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * 사이드바 내비 링크 — 현재 경로와 일치하면 aria-current="page"를 달아
 * globals.css의 active 스타일(.wt-chapter-index-item[aria-current="page"])을 활성화.
 */
export function SidebarLink({
  href,
  className,
  dataCat,
  children,
}: {
  href: string
  className: string
  dataCat?: string
  children: ReactNode
}) {
  const pathname = usePathname()
  const isCurrent = pathname === href

  return (
    <Link
      href={href}
      className={className}
      data-cat={dataCat}
      aria-current={isCurrent ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}
