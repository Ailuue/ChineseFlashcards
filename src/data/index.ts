import type { FlashCard, DeckSummary } from '../types'

export const HSK1: FlashCard[] = [
  {
    simplified: '你好', traditional: '你好', pinyin: 'nǐ hǎo', tones: [3, 3], meaning: 'hello', deck: 'Greetings',
  },
  {
    simplified: '谢谢', traditional: '謝謝', pinyin: 'xiè xiè', tones: [4, 4], meaning: 'thank you', deck: 'Greetings',
  },
  {
    simplified: '再见', traditional: '再見', pinyin: 'zài jiàn', tones: [4, 4], meaning: 'goodbye', deck: 'Greetings',
  },
  {
    simplified: '我', traditional: '我', pinyin: 'wǒ', tones: [3], meaning: 'I, me', deck: 'Pronouns',
  },
  {
    simplified: '你', traditional: '你', pinyin: 'nǐ', tones: [3], meaning: 'you', deck: 'Pronouns',
  },
  {
    simplified: '他', traditional: '他', pinyin: 'tā', tones: [1], meaning: 'he, him', deck: 'Pronouns',
  },
  {
    simplified: '她', traditional: '她', pinyin: 'tā', tones: [1], meaning: 'she, her', deck: 'Pronouns',
  },
  {
    simplified: '爱', traditional: '愛', pinyin: 'ài', tones: [4], meaning: 'to love', deck: 'Verbs',
  },
  {
    simplified: '吃', traditional: '吃', pinyin: 'chī', tones: [1], meaning: 'to eat', deck: 'Verbs',
  },
  {
    simplified: '喝', traditional: '喝', pinyin: 'hē', tones: [1], meaning: 'to drink', deck: 'Verbs',
  },
  {
    simplified: '看', traditional: '看', pinyin: 'kàn', tones: [4], meaning: 'to look, read', deck: 'Verbs',
  },
  {
    simplified: '学习', traditional: '學習', pinyin: 'xué xí', tones: [2, 2], meaning: 'to study', deck: 'Verbs',
  },
  {
    simplified: '说', traditional: '說', pinyin: 'shuō', tones: [1], meaning: 'to speak', deck: 'Verbs',
  },
  {
    simplified: '水', traditional: '水', pinyin: 'shuǐ', tones: [3], meaning: 'water', deck: 'Nouns',
  },
  {
    simplified: '茶', traditional: '茶', pinyin: 'chá', tones: [2], meaning: 'tea', deck: 'Nouns',
  },
  {
    simplified: '米饭', traditional: '米飯', pinyin: 'mǐ fàn', tones: [3, 4], meaning: 'cooked rice', deck: 'Nouns',
  },
  {
    simplified: '苹果', traditional: '蘋果', pinyin: 'píng guǒ', tones: [2, 3], meaning: 'apple', deck: 'Nouns',
  },
  {
    simplified: '书', traditional: '書', pinyin: 'shū', tones: [1], meaning: 'book', deck: 'Nouns',
  },
  {
    simplified: '朋友', traditional: '朋友', pinyin: 'péng yǒu', tones: [2, 3], meaning: 'friend', deck: 'Nouns',
  },
  {
    simplified: '中国', traditional: '中國', pinyin: 'zhōng guó', tones: [1, 2], meaning: 'China', deck: 'Places',
  },
  {
    simplified: '家', traditional: '家', pinyin: 'jiā', tones: [1], meaning: 'home, family', deck: 'Places',
  },
  {
    simplified: '学校', traditional: '學校', pinyin: 'xué xiào', tones: [2, 4], meaning: 'school', deck: 'Places',
  },
  {
    simplified: '今天', traditional: '今天', pinyin: 'jīn tiān', tones: [1, 1], meaning: 'today', deck: 'Time',
  },
  {
    simplified: '明天', traditional: '明天', pinyin: 'míng tiān', tones: [2, 1], meaning: 'tomorrow', deck: 'Time',
  },
  {
    simplified: '一', traditional: '一', pinyin: 'yī', tones: [1], meaning: 'one', deck: 'Numbers',
  },
  {
    simplified: '二', traditional: '二', pinyin: 'èr', tones: [4], meaning: 'two', deck: 'Numbers',
  },
  {
    simplified: '三', traditional: '三', pinyin: 'sān', tones: [1], meaning: 'three', deck: 'Numbers',
  },
  {
    simplified: '大', traditional: '大', pinyin: 'dà', tones: [4], meaning: 'big', deck: 'Adjectives',
  },
  {
    simplified: '小', traditional: '小', pinyin: 'xiǎo', tones: [3], meaning: 'small', deck: 'Adjectives',
  },
  {
    simplified: '好', traditional: '好', pinyin: 'hǎo', tones: [3], meaning: 'good', deck: 'Adjectives',
  },
]

export const SESSION_DECK: FlashCard[] = HSK1.slice(0, 20)

const generateHeatmap = (): number[] => {
  const out: number[] = []
  let s = 1337
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const total = 53 * 7
  const startWeeks = 18
  for (let i = 0; i < total; i += 1) {
    const week = Math.floor(i / 7)
    if (week < startWeeks) { out.push(0); continue } // eslint-disable-line no-continue
    const ramp = Math.min(1, (week - startWeeks) / 8)
    const r = rnd()
    if (r < 0.18 * (1 - ramp * 0.5)) out.push(0)
    else if (r < 0.45) out.push(Math.max(1, Math.floor(ramp * 2 + rnd() * 2)))
    else if (r < 0.78) out.push(Math.max(1, Math.floor(ramp * 3 + rnd() * 2)))
    else out.push(Math.max(2, Math.floor(2 + ramp * 2 + rnd() * 2)))
  }
  return out
}

export const HEATMAP_DATA: number[] = generateHeatmap()

export const DECKS: DeckSummary[] = [
  {
    name: 'Greetings', total: 8, learned: 8, due: 0, progress: 1.0,
  },
  {
    name: 'Pronouns', total: 10, learned: 7, due: 3, progress: 0.7,
  },
  {
    name: 'Verbs', total: 24, learned: 12, due: 6, progress: 0.5,
  },
  {
    name: 'Nouns · Food', total: 16, learned: 9, due: 4, progress: 0.56,
  },
  {
    name: 'Nouns · Objects', total: 18, learned: 5, due: 2, progress: 0.28,
  },
  {
    name: 'Places', total: 12, learned: 6, due: 0, progress: 0.5,
  },
  {
    name: 'Numbers 1–10', total: 10, learned: 10, due: 0, progress: 1.0,
  },
  {
    name: 'Time & Dates', total: 14, learned: 4, due: 1, progress: 0.29,
  },
  {
    name: 'Adjectives', total: 18, learned: 3, due: 0, progress: 0.17,
  },
  {
    name: 'Questions', total: 8, learned: 0, due: 0, progress: 0,
  },
]
