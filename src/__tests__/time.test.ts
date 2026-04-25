import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeAgo, greeting } from '../utils/time'

describe('timeAgo', () => {
  it('returns "never" for null', () => {
    expect(timeAgo(null)).toBe('never')
  })

  it('returns "just now" for under 60 seconds ago', () => {
    const iso = new Date(Date.now() - 30_000).toISOString()
    expect(timeAgo(iso)).toBe('just now')
  })

  it('returns "Xm ago" for minutes', () => {
    const iso = new Date(Date.now() - 5 * 60_000).toISOString()
    expect(timeAgo(iso)).toBe('5m ago')
  })

  it('returns "Xh ago" for hours under 24', () => {
    const iso = new Date(Date.now() - 3 * 3_600_000).toISOString()
    expect(timeAgo(iso)).toBe('3h ago')
  })

  it('returns "yesterday" for 24–48 hours ago', () => {
    const iso = new Date(Date.now() - 36 * 3_600_000).toISOString()
    expect(timeAgo(iso)).toBe('yesterday')
  })

  it('returns "Xd ago" for over 48 hours', () => {
    const iso = new Date(Date.now() - 72 * 3_600_000).toISOString()
    expect(timeAgo(iso)).toBe('3d ago')
  })

  it('returns "1m ago" at exactly 60 seconds', () => {
    const iso = new Date(Date.now() - 60_000).toISOString()
    expect(timeAgo(iso)).toBe('1m ago')
  })
})

describe('greeting', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns 早安 in the morning (03:00–11:59)', () => {
    vi.setSystemTime(new Date('2024-01-01T08:00:00'))
    expect(greeting()).toBe('早安')
  })

  it('returns 午安 in the afternoon (12:00–16:59)', () => {
    vi.setSystemTime(new Date('2024-01-01T14:00:00'))
    expect(greeting()).toBe('午安')
  })

  it('returns 晚安 in the evening (17:00–02:59)', () => {
    vi.setSystemTime(new Date('2024-01-01T20:00:00'))
    expect(greeting()).toBe('晚安')
  })

  it('returns 晚安 at midnight', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00'))
    expect(greeting()).toBe('晚安')
  })

  it('returns 早安 at the boundary hour 03:00', () => {
    vi.setSystemTime(new Date('2024-01-01T03:00:00'))
    expect(greeting()).toBe('早安')
  })

  it('returns 午安 at the boundary hour 12:00', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00'))
    expect(greeting()).toBe('午安')
  })

  it('returns 晚安 at the boundary hour 17:00', () => {
    vi.setSystemTime(new Date('2024-01-01T17:00:00'))
    expect(greeting()).toBe('晚安')
  })
})
