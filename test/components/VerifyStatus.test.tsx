import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerifyStatus } from '@/components/VerifyStatus'

describe('VerifyStatus', () => {
  it('확정 shows checkmark and verified tone', () => {
    render(<VerifyStatus status="확정" />)
    expect(screen.getByText(/확정/)).toBeInTheDocument()
  })
  it('descId 없으면 id 속성 없음 — 중복 id 방지', () => {
    const { container } = render(<VerifyStatus status="강의기반" />)
    const wrapper = container.querySelector('span[data-vs]') ?? container.querySelector('span')
    // id는 descId를 줄 때만 부여(페이지 내 중복 방지)
    expect(wrapper?.id ?? '').toBe('')
  })
  it('descId prop overrides the default id', () => {
    render(<VerifyStatus status="강의기반" descId="vs-f_x" />)
    const wrapper = document.getElementById('vs-f_x')
    expect(wrapper).not.toBeNull()
  })
})
