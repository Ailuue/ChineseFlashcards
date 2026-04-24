import { Router } from 'express'
import { eq, and, lte, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { userProgress, words, decks } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { UserProgress } from '../db/schema'

const router = Router()
router.use(requireAuth)

const ReviewSchema = z.object({
  correct: z.boolean(),
})

// SM-2 algorithm: calculates next review interval
function nextReviewSchedule(current: UserProgress, isCorrect: boolean) {
  let { easeFactor, intervalDays, repetitions } = current

  if (isCorrect) {
    if (repetitions === 0) intervalDays = 1
    else if (repetitions === 1) intervalDays = 4
    else intervalDays = Math.round(intervalDays * easeFactor)

    easeFactor = Math.max(1.3, easeFactor + 0.1)
    repetitions += 1
  } else {
    intervalDays = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
    repetitions = 0
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + intervalDays)

  return { easeFactor, intervalDays, repetitions, nextReview }
}

// GET /api/progress — all progress for the current user
router.get('/', async (req, res) => {
  const rows = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, req.user!.userId),
    with: { word: { with: { deck: true } } },
  })
  res.json({ progress: rows, count: rows.length })
})

// GET /api/progress/due — words due for review right now
router.get('/due', async (req, res) => {
  const now = new Date()

  const due = await db
    .select({
      progressId: userProgress.id,
      wordId: userProgress.wordId,
      repetitions: userProgress.repetitions,
      easeFactor: userProgress.easeFactor,
      intervalDays: userProgress.intervalDays,
      correct: userProgress.correct,
      incorrect: userProgress.incorrect,
      nextReview: userProgress.nextReview,
      simplified: words.simplified,
      traditional: words.traditional,
      pinyin: words.pinyin,
      tones: words.tones,
      meaning: words.meaning,
      deck: decks.name,
    })
    .from(userProgress)
    .innerJoin(words, eq(words.id, userProgress.wordId))
    .innerJoin(decks, eq(decks.id, words.deckId))
    .where(
      and(
        eq(userProgress.userId, req.user!.userId),
        lte(userProgress.nextReview, now),
      ),
    )
    .orderBy(userProgress.nextReview)

  res.json({ words: due, count: due.length })
})

const wordColumns = {
  id: words.id,
  simplified: words.simplified,
  traditional: words.traditional,
  pinyin: words.pinyin,
  tones: words.tones,
  meaning: words.meaning,
  deck: decks.name,
  deckId: words.deckId,
}

const SessionQuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(500).default(20),
})

// GET /api/progress/session — due + new words for a study session
router.get('/session', async (req, res) => {
  const parsed = SessionQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query parameters' })
    return
  }

  const { count } = parsed.data
  const { userId } = req.user!
  const now = new Date()

  const [dueWords, newWords] = await Promise.all([
    // Words the user has seen and that are now due
    db
      .select(wordColumns)
      .from(userProgress)
      .innerJoin(words, eq(words.id, userProgress.wordId))
      .innerJoin(decks, eq(decks.id, words.deckId))
      .where(and(eq(userProgress.userId, userId), lte(userProgress.nextReview, now))),

    // Words the user has never seen (no progress row)
    db
      .select(wordColumns)
      .from(words)
      .innerJoin(decks, eq(decks.id, words.deckId))
      .leftJoin(
        userProgress,
        and(eq(userProgress.wordId, words.id), eq(userProgress.userId, userId)),
      )
      .where(isNull(userProgress.id)),
  ])

  // Shuffle each group, then interleave: cap new words at remaining slots after due
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const pool = [...shuffle(dueWords), ...shuffle(newWords)].slice(0, count)

  res.json({ words: pool, total: dueWords.length + newWords.length })
})

// POST /api/progress/:wordId/review — record a review result
router.post('/:wordId/review', async (req, res) => {
  const wordId = parseInt(req.params.wordId, 10)
  if (Number.isNaN(wordId)) {
    res.status(400).json({ error: 'Invalid word id' })
    return
  }

  const parsed = ReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Body must include { correct: boolean }' })
    return
  }

  const { correct } = parsed.data
  const { userId } = req.user!

  // Get or create progress record
  let existing = await db.query.userProgress.findFirst({
    where: and(eq(userProgress.userId, userId), eq(userProgress.wordId, wordId)),
  })

  if (!existing) {
    // First time reviewing this word — create a baseline record
    const [created] = await db
      .insert(userProgress)
      .values({ userId, wordId })
      .returning()
    existing = created
  }

  const schedule = nextReviewSchedule(existing, correct)
  const now = new Date()

  const [updated] = await db
    .update(userProgress)
    .set({
      repetitions: schedule.repetitions,
      easeFactor: schedule.easeFactor,
      intervalDays: schedule.intervalDays,
      correct: existing.correct + (correct ? 1 : 0),
      incorrect: existing.incorrect + (correct ? 0 : 1),
      lastReviewed: now,
      nextReview: schedule.nextReview,
      updatedAt: now,
    })
    .where(eq(userProgress.id, existing.id))
    .returning()

  res.json({ progress: updated })
})

export default router
