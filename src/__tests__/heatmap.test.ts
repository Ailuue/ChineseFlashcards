import { describe, it, expect } from 'vitest'
import { toBucket } from '../components/Heatmap'

describe('toBucket', () => {
  it('returns 0 for 0 reviews', () => {
    expect(toBucket(0)).toBe(0)
  })

  it('returns 1 for 1–2 reviews', () => {
    expect(toBucket(1)).toBe(1)
    expect(toBucket(2)).toBe(1)
  })

  it('returns 2 for 3–4 reviews', () => {
    expect(toBucket(3)).toBe(2)
    expect(toBucket(4)).toBe(2)
  })

  it('returns 3 for 5–7 reviews', () => {
    expect(toBucket(5)).toBe(3)
    expect(toBucket(6)).toBe(3)
    expect(toBucket(7)).toBe(3)
  })

  it('returns 4 for 8+ reviews', () => {
    expect(toBucket(8)).toBe(4)
    expect(toBucket(50)).toBe(4)
    expect(toBucket(999)).toBe(4)
  })
})
