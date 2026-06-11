import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RootLayout from '@/app/layout'

vi.mock('next/font/google', () => ({
  Noto_Serif_KR: () => ({ variable: 'font-serif-kr' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains' }),
}))
vi.mock('@/components/CommandPalette', () => ({
  CommandPalette: () => null,
}))

describe('sidebar navigation', () => {
  it('keeps implementation checklists out of the general shortcut menu', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )

    const primaryNav = screen.getByRole('navigation', { name: '주요 메뉴' })
    expect(within(primaryNav).queryByText('구현 체크리스트')).not.toBeInTheDocument()

    const developerNav = screen.getByRole('navigation', { name: '개발자 메뉴' })
    expect(within(developerNav).getByText('구현 체크리스트')).toBeInTheDocument()
  })

  it('keeps the operations review queue out of the general shortcut menu', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )

    const primaryNav = screen.getByRole('navigation', { name: '주요 메뉴' })
    expect(within(primaryNav).queryByText('운영 검토 큐')).not.toBeInTheDocument()

    const opsNav = screen.getByRole('navigation', { name: '운영 메뉴' })
    expect(within(opsNav).getByText('운영 검토 큐')).toBeInTheDocument()
  })
})
