import { describe, it, expect } from 'vitest'
import { shuffle } from '../utils/shuffle'

describe('shuffle', () => {
  it('returns an array with the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result.slice().sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3])).toHaveLength(3)
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    shuffle(input)
    expect(input).toEqual(copy)
  })

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('handles a single-element array', () => {
    expect(shuffle(['only'])).toEqual(['only'])
  })

  it('works with strings', () => {
    const input = ['a', 'b', 'c', 'd']
    const result = shuffle(input)
    expect(result.slice().sort()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('produces different orderings over many runs (statistical)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const seen = new Set<string>()
    for (let i = 0; i < 50; i += 1) seen.add(JSON.stringify(shuffle(input)))
    expect(seen.size).toBeGreaterThan(1)
  })
})
