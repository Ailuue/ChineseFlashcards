import type { FlashCard, DeckSummary } from '../types';

export const HSK1: FlashCard[] = [
  {
    hanzi: '你好', pinyin: 'nǐ hǎo', tones: [3, 3], meaning: 'hello', deck: 'Greetings',
  },
  {
    hanzi: '谢谢', pinyin: 'xiè xiè', tones: [4, 4], meaning: 'thank you', deck: 'Greetings',
  },
  {
    hanzi: '再见', pinyin: 'zài jiàn', tones: [4, 4], meaning: 'goodbye', deck: 'Greetings',
  },
  {
    hanzi: '我', pinyin: 'wǒ', tones: [3], meaning: 'I, me', deck: 'Pronouns',
  },
  {
    hanzi: '你', pinyin: 'nǐ', tones: [3], meaning: 'you', deck: 'Pronouns',
  },
  {
    hanzi: '他', pinyin: 'tā', tones: [1], meaning: 'he, him', deck: 'Pronouns',
  },
  {
    hanzi: '她', pinyin: 'tā', tones: [1], meaning: 'she, her', deck: 'Pronouns',
  },
  {
    hanzi: '爱', pinyin: 'ài', tones: [4], meaning: 'to love', deck: 'Verbs',
  },
  {
    hanzi: '吃', pinyin: 'chī', tones: [1], meaning: 'to eat', deck: 'Verbs',
  },
  {
    hanzi: '喝', pinyin: 'hē', tones: [1], meaning: 'to drink', deck: 'Verbs',
  },
  {
    hanzi: '看', pinyin: 'kàn', tones: [4], meaning: 'to look, read', deck: 'Verbs',
  },
  {
    hanzi: '学习', pinyin: 'xué xí', tones: [2, 2], meaning: 'to study', deck: 'Verbs',
  },
  {
    hanzi: '说', pinyin: 'shuō', tones: [1], meaning: 'to speak', deck: 'Verbs',
  },
  {
    hanzi: '水', pinyin: 'shuǐ', tones: [3], meaning: 'water', deck: 'Nouns',
  },
  {
    hanzi: '茶', pinyin: 'chá', tones: [2], meaning: 'tea', deck: 'Nouns',
  },
  {
    hanzi: '米饭', pinyin: 'mǐ fàn', tones: [3, 4], meaning: 'cooked rice', deck: 'Nouns',
  },
  {
    hanzi: '苹果', pinyin: 'píng guǒ', tones: [2, 3], meaning: 'apple', deck: 'Nouns',
  },
  {
    hanzi: '书', pinyin: 'shū', tones: [1], meaning: 'book', deck: 'Nouns',
  },
  {
    hanzi: '朋友', pinyin: 'péng yǒu', tones: [2, 3], meaning: 'friend', deck: 'Nouns',
  },
  {
    hanzi: '中国', pinyin: 'zhōng guó', tones: [1, 2], meaning: 'China', deck: 'Places',
  },
  {
    hanzi: '家', pinyin: 'jiā', tones: [1], meaning: 'home, family', deck: 'Places',
  },
  {
    hanzi: '学校', pinyin: 'xué xiào', tones: [2, 4], meaning: 'school', deck: 'Places',
  },
  {
    hanzi: '今天', pinyin: 'jīn tiān', tones: [1, 1], meaning: 'today', deck: 'Time',
  },
  {
    hanzi: '明天', pinyin: 'míng tiān', tones: [2, 1], meaning: 'tomorrow', deck: 'Time',
  },
  {
    hanzi: '一', pinyin: 'yī', tones: [1], meaning: 'one', deck: 'Numbers',
  },
  {
    hanzi: '二', pinyin: 'èr', tones: [4], meaning: 'two', deck: 'Numbers',
  },
  {
    hanzi: '三', pinyin: 'sān', tones: [1], meaning: 'three', deck: 'Numbers',
  },
  {
    hanzi: '大', pinyin: 'dà', tones: [4], meaning: 'big', deck: 'Adjectives',
  },
  {
    hanzi: '小', pinyin: 'xiǎo', tones: [3], meaning: 'small', deck: 'Adjectives',
  },
  {
    hanzi: '好', pinyin: 'hǎo', tones: [3], meaning: 'good', deck: 'Adjectives',
  },
];

export const SESSION_DECK: FlashCard[] = HSK1.slice(0, 20);

const generateHeatmap = (): number[] => {
  const out: number[] = [];
  let s = 1337;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const total = 53 * 7;
  const startWeeks = 18;
  for (let i = 0; i < total; i += 1) {
    const week = Math.floor(i / 7);
    if (week < startWeeks) { out.push(0); continue; } // eslint-disable-line no-continue
    const ramp = Math.min(1, (week - startWeeks) / 8);
    const r = rnd();
    if (r < 0.18 * (1 - ramp * 0.5)) out.push(0);
    else if (r < 0.45) out.push(Math.max(1, Math.floor(ramp * 2 + rnd() * 2)));
    else if (r < 0.78) out.push(Math.max(1, Math.floor(ramp * 3 + rnd() * 2)));
    else out.push(Math.max(2, Math.floor(2 + ramp * 2 + rnd() * 2)));
  }
  return out;
};

export const HEATMAP_DATA: number[] = generateHeatmap();

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
];
