import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ProgressBar from '../components/ProgressBar'

describe('ProgressBar', () => {
  const fillWidth = (container: HTMLElement) =>
    (container.querySelector('.fill') as HTMLElement).style.width

  it('renders correct width for a mid-range value', () => {
    const { container } = render(<ProgressBar value={0.5} />)
    expect(fillWidth(container)).toBe('50%')
  })

  it('renders 100% for value of 1', () => {
    const { container } = render(<ProgressBar value={1} />)
    expect(fillWidth(container)).toBe('100%')
  })

  it('renders 0% for value of 0', () => {
    const { container } = render(<ProgressBar value={0} />)
    expect(fillWidth(container)).toBe('0%')
  })

  it('clamps above 1 to 100%', () => {
    const { container } = render(<ProgressBar value={1.5} />)
    expect(fillWidth(container)).toBe('100%')
  })

  it('clamps below 0 to 0%', () => {
    const { container } = render(<ProgressBar value={-0.5} />)
    expect(fillWidth(container)).toBe('0%')
  })

  it('respects a custom max', () => {
    const { container } = render(<ProgressBar value={50} max={200} />)
    expect(fillWidth(container)).toBe('25%')
  })

  it('renders a .progress wrapper and a .fill child', () => {
    const { container } = render(<ProgressBar value={0.5} />)
    expect(container.querySelector('.progress')).not.toBeNull()
    expect(container.querySelector('.fill')).not.toBeNull()
  })
})
