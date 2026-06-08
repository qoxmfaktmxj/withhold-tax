import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerifyStatus } from '@/components/VerifyStatus'

describe('VerifyStatus', () => {
  it('확정 shows checkmark and verified tone', () => {
    render(<VerifyStatus status="확정" />)
    expect(screen.getByText(/확정/)).toBeInTheDocument()
  })
  it('강의기반 exposes a disclosure id for aria-describedby', () => {
    render(<VerifyStatus status="강의기반" />)
    const el = screen.getByText(/강의기반/)
    expect(el).toHaveAttribute('id')
  })
  it('descId prop overrides the default id', () => {
    render(<VerifyStatus status="강의기반" descId="vs-f_x" />)
    const el = screen.getByText(/강의기반/)
    expect(el).toHaveAttribute('id', 'vs-f_x')
  })
})
