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
    // The id is on the outer wrapper span (default: vs-강의기반)
    const wrapper = document.getElementById('vs-강의기반')
    expect(wrapper).not.toBeNull()
  })
  it('descId prop overrides the default id', () => {
    render(<VerifyStatus status="강의기반" descId="vs-f_x" />)
    const wrapper = document.getElementById('vs-f_x')
    expect(wrapper).not.toBeNull()
  })
})
