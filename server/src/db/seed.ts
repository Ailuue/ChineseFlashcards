import 'dotenv/config';
import { db } from './index';
import { decks, words } from './schema';

const HSK1_DECKS = [
  { name: 'Greetings', description: 'Common greetings and farewells', level: 'HSK1' },
  { name: 'Pronouns', description: 'Personal pronouns', level: 'HSK1' },
  { name: 'Numbers', description: 'Numbers and counting', level: 'HSK1' },
  { name: 'Time', description: 'Days, months, and time expressions', level: 'HSK1' },
  { name: 'Family', description: 'Family members', level: 'HSK1' },
  { name: 'Nouns · Food', description: 'Food and drink vocabulary', level: 'HSK1' },
  { name: 'Verbs', description: 'Common action words', level: 'HSK1' },
  { name: 'Adjectives', description: 'Describing words', level: 'HSK1' },
  { name: 'Places', description: 'Locations and places', level: 'HSK1' },
  { name: 'School', description: 'Education vocabulary', level: 'HSK1' },
];

const HSK1_WORDS = [
  // Greetings
  { simplified: '你好', traditional: '你好', pinyin: 'nǐ hǎo', tones: [3, 3], meaning: 'hello', deck: 'Greetings' },
  { simplified: '谢谢', traditional: '謝謝', pinyin: 'xiè xiè', tones: [4, 4], meaning: 'thank you', deck: 'Greetings' },
  { simplified: '再见', traditional: '再見', pinyin: 'zài jiàn', tones: [4, 4], meaning: 'goodbye', deck: 'Greetings' },
  { simplified: '对不起', traditional: '對不起', pinyin: 'duì bu qǐ', tones: [4, 0, 3], meaning: 'sorry', deck: 'Greetings' },
  // Pronouns
  { simplified: '我', traditional: '我', pinyin: 'wǒ', tones: [3], meaning: 'I / me', deck: 'Pronouns' },
  { simplified: '你', traditional: '你', pinyin: 'nǐ', tones: [3], meaning: 'you', deck: 'Pronouns' },
  { simplified: '他', traditional: '他', pinyin: 'tā', tones: [1], meaning: 'he / him', deck: 'Pronouns' },
  { simplified: '她', traditional: '她', pinyin: 'tā', tones: [1], meaning: 'she / her', deck: 'Pronouns' },
  { simplified: '我们', traditional: '我們', pinyin: 'wǒ men', tones: [3, 0], meaning: 'we / us', deck: 'Pronouns' },
  // Numbers
  { simplified: '一', traditional: '一', pinyin: 'yī', tones: [1], meaning: 'one', deck: 'Numbers' },
  { simplified: '二', traditional: '二', pinyin: 'èr', tones: [4], meaning: 'two', deck: 'Numbers' },
  { simplified: '三', traditional: '三', pinyin: 'sān', tones: [1], meaning: 'three', deck: 'Numbers' },
  { simplified: '四', traditional: '四', pinyin: 'sì', tones: [4], meaning: 'four', deck: 'Numbers' },
  { simplified: '五', traditional: '五', pinyin: 'wǔ', tones: [3], meaning: 'five', deck: 'Numbers' },
  // Time
  { simplified: '今天', traditional: '今天', pinyin: 'jīn tiān', tones: [1, 1], meaning: 'today', deck: 'Time' },
  { simplified: '明天', traditional: '明天', pinyin: 'míng tiān', tones: [2, 1], meaning: 'tomorrow', deck: 'Time' },
  { simplified: '昨天', traditional: '昨天', pinyin: 'zuó tiān', tones: [2, 1], meaning: 'yesterday', deck: 'Time' },
  { simplified: '年', traditional: '年', pinyin: 'nián', tones: [2], meaning: 'year', deck: 'Time' },
  // Family
  { simplified: '爸爸', traditional: '爸爸', pinyin: 'bà ba', tones: [4, 0], meaning: 'father / dad', deck: 'Family' },
  { simplified: '妈妈', traditional: '媽媽', pinyin: 'mā ma', tones: [1, 0], meaning: 'mother / mom', deck: 'Family' },
  // Food
  { simplified: '水', traditional: '水', pinyin: 'shuǐ', tones: [3], meaning: 'water', deck: 'Nouns · Food' },
  { simplified: '米饭', traditional: '米飯', pinyin: 'mǐ fàn', tones: [3, 4], meaning: 'rice', deck: 'Nouns · Food' },
  { simplified: '苹果', traditional: '蘋果', pinyin: 'píng guǒ', tones: [2, 3], meaning: 'apple', deck: 'Nouns · Food' },
  // Verbs
  { simplified: '爱', traditional: '愛', pinyin: 'ài', tones: [4], meaning: 'to love', deck: 'Verbs' },
  { simplified: '学习', traditional: '學習', pinyin: 'xué xí', tones: [2, 2], meaning: 'to study / learn', deck: 'Verbs' },
  { simplified: '说', traditional: '說', pinyin: 'shuō', tones: [1], meaning: 'to speak / say', deck: 'Verbs' },
  // Adjectives
  { simplified: '好', traditional: '好', pinyin: 'hǎo', tones: [3], meaning: 'good', deck: 'Adjectives' },
  // Places
  { simplified: '中国', traditional: '中國', pinyin: 'zhōng guó', tones: [1, 2], meaning: 'China', deck: 'Places' },
  // School
  { simplified: '书', traditional: '書', pinyin: 'shū', tones: [1], meaning: 'book', deck: 'School' },
  { simplified: '学校', traditional: '學校', pinyin: 'xué xiào', tones: [2, 4], meaning: 'school', deck: 'School' },
];

async function seed() {
  console.log('Seeding database…');

  // Upsert decks
  const insertedDecks = await db
    .insert(decks)
    .values(HSK1_DECKS)
    .onConflictDoUpdate({ target: decks.name, set: { description: decks.description } })
    .returning({ id: decks.id, name: decks.name });

  const deckMap = Object.fromEntries(insertedDecks.map((d) => [d.name, d.id]));

  // Upsert words
  const wordRows = HSK1_WORDS.map((w) => ({
    simplified: w.simplified,
    traditional: w.traditional,
    pinyin: w.pinyin,
    tones: w.tones,
    meaning: w.meaning,
    deckId: deckMap[w.deck],
  }));

  await db
    .insert(words)
    .values(wordRows)
    .onConflictDoNothing();

  console.log(`Seeded ${insertedDecks.length} decks and ${wordRows.length} words.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
