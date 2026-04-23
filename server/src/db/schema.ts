import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  real,
  timestamp,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  level: varchar('level', { length: 20 }), // HSK1, HSK2, custom, etc.
  isSystem: boolean('is_system').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const words = pgTable('words', {
  id: serial('id').primaryKey(),
  simplified: varchar('simplified', { length: 50 }).notNull(),
  traditional: varchar('traditional', { length: 50 }).notNull(),
  pinyin: varchar('pinyin', { length: 100 }).notNull(),
  tones: integer('tones').array().notNull(),
  meaning: text('meaning').notNull(),
  deckId: integer('deck_id')
    .references(() => decks.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// SM-2 spaced repetition data per user per word
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  wordId: integer('word_id')
    .references(() => words.id, { onDelete: 'cascade' })
    .notNull(),
  repetitions: integer('repetitions').default(0).notNull(),
  easeFactor: real('ease_factor').default(2.5).notNull(),
  intervalDays: integer('interval_days').default(1).notNull(),
  correct: integer('correct').default(0).notNull(),
  incorrect: integer('incorrect').default(0).notNull(),
  lastReviewed: timestamp('last_reviewed'),
  nextReview: timestamp('next_review').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  uniqUserWord: unique().on(t.userId, t.wordId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
}));

export const decksRelations = relations(decks, ({ many }) => ({
  words: many(words),
}));

export const wordsRelations = relations(words, ({ one, many }) => ({
  deck: one(decks, { fields: [words.deckId], references: [decks.id] }),
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  word: one(words, { fields: [userProgress.wordId], references: [words.id] }),
}));

// Inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Deck = typeof decks.$inferSelect;
export type NewDeck = typeof decks.$inferInsert;
export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
