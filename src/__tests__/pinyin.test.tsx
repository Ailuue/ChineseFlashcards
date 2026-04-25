import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Pinyin from '../components/Pinyin'

describe('Pinyin', () => {
  it('renders the correct number of syllables', () => {
    const { container } = render(<Pinyin pinyin="nǐ hǎo" tones={[3, 3]} />)
    const spans = container.querySelectorAll('span > span')
    expect(spans).toHaveLength(2)
  })

  it('applies tone class to each syllable', () => {
    const { container } = render(<Pinyin pinyin="nǐ hǎo" tones={[3, 3]} />)
    const t3 = container.querySelectorAll('.t3')
    expect(t3).toHaveLength(2)
  })

  it('applies different tone classes per syllable', () => {
    const { container } = render(<Pinyin pinyin="māo gǒu" tones={[1, 3]} />)
    expect(container.querySelector('.t1')).not.toBeNull()
    expect(container.querySelector('.t3')).not.toBeNull()
  })

  it('falls back to tone 5 (neutral) when tones array is shorter than syllables', () => {
    const { container } = render(<Pinyin pinyin="ma me mi" tones={[1]} />)
    const t5 = container.querySelectorAll('.t5')
    expect(t5).toHaveLength(2)
  })

  it('renders a single syllable correctly', () => {
    const { container } = render(<Pinyin pinyin="nǐ" tones={[3]} />)
    expect(container.querySelector('.t3')).not.toBeNull()
    expect(container.querySelectorAll('span > span')).toHaveLength(1)
  })

  it('applies the size prop as fontSize', () => {
    const { container } = render(<Pinyin pinyin="nǐ" tones={[3]} size={24} />)
    const outer = container.querySelector('span') as HTMLElement
    expect(outer.style.fontSize).toBe('24px')
  })
})
