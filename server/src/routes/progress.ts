import { Router } from 'express'
import { eq, and, lte, isNull, isNotNull, gte, gt, desc, count, sql, or, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { userProgress, words, decks, studySessions, reviewEvents, users } from '../db/schema'
import { requireAuth, signToken } from '../middleware/auth'
import { nextReviewSchedule } from '../utils/srs'
import { shuffle } from '../utils/shuffle'
import { allowedLevels } from '../utils/level'

const router = Router()
router.use(requireAuth)

const ReviewSchema = z.object({
  correct: z.boolean(),
})

// GET /api/progress/activity — daily review counts for the last 53 weeks
router.get('/activity', async (req, res) => {
  const { userId } = req.user!
  const yearAgo = new Date()
  yearAgo.setDate(yearAgo.getDate() - 53 * 7)

  const rows = await db
    .select({
      day: sql<string>`(${userProgress.lastReviewed})::date`,
      reviews: count(),
    })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        isNotNull(userProgress.lastReviewed),
        gte(userProgress.lastReviewed, yearAgo),
      ),
    )
    .groupBy(sql`(${userProgress.lastReviewed})::date`)
    .orderBy(sql`(${userProgress.lastReviewed})::date`)

  const activity: Record<string, number> = {}
  for (const row of rows) {
    activity[row.day] = row.reviews
  }

  res.json({ activity })
})

// GET /api/progress/stats — streak, words learned, total words
router.get('/stats', async (req, res) => {
  const { userId } = req.user!

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [activeDays, learnedRow, totalRow, todayRows, timeRow, decksTodayRow, lastReviewedRow, recentWords] = await Promise.all([
    // All distinct days with at least one review
    db
      .selectDistinct({ day: sql<string>`TO_CHAR((${userProgress.lastReviewed})::date, 'YYYY-MM-DD')` })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), isNotNull(userProgress.lastReviewed))),

    // Words the user has gotten right at least once, within their allowed levels
    db
      .select({ learned: count() })
      .from(userProgress)
      .innerJoin(words, eq(words.id, userProgress.wordId))
      .innerJoin(decks, eq(decks.id, words.deckId))
      .where(and(
        eq(userProgress.userId, userId),
        gt(userProgress.correct, 0),
        inArray(decks.level, allowedLevels(req.user!.hskLevel ?? 1)),
      )),

    // Total words available at the user's level
    db.select({ total: count() }).from(words)
      .innerJoin(decks, eq(decks.id, words.deckId))
      .where(inArray(decks.level, allowedLevels(req.user!.hskLevel ?? 1))),

    // All review events today (each attempt counts)
    db
      .select({ correct: reviewEvents.correct })
      .from(reviewEvents)
      .where(and(eq(reviewEvents.userId, userId), gte(reviewEvents.reviewedAt, todayStart))),

    // Total seconds spent in completed study sessions today
    db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(CASE WHEN ${studySessions.endedAt} > ${studySessions.startedAt} THEN EXTRACT(EPOCH FROM (${studySessions.endedAt} - ${studySessions.startedAt})) ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(studySessions)
      .where(and(
        eq(studySessions.userId, userId),
        isNotNull(studySessions.endedAt),
        gte(studySessions.startedAt, todayStart),
      )),

    // Distinct decks reviewed today
    db
      .select({ deckCount: sql<number>`COUNT(DISTINCT ${words.deckId})`.mapWith(Number) })
      .from(userProgress)
      .innerJoin(words, eq(words.id, userProgress.wordId))
      .where(and(eq(userProgress.userId, userId), gte(userProgress.lastReviewed, todayStart))),

    // Most recent review timestamp overall, formatted as UTC ISO string
    db
      .select({ lastReviewedAt: sql<string | null>`TO_CHAR(MAX(${userProgress.lastReviewed}), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')` })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), isNotNull(userProgress.lastReviewed))),

    // 5 most recently reviewed words
    db
      .select({
        simplified: words.simplified,
        traditional: words.traditional,
        pinyin: words.pinyin,
        tones: words.tones,
        meaning: words.meaning,
        deck: decks.name,
        lastReviewCorrect: userProgress.lastReviewCorrect,
      })
      .from(userProgress)
      .innerJoin(words, eq(words.id, userProgress.wordId))
      .innerJoin(decks, eq(decks.id, words.deckId))
      .where(and(eq(userProgress.userId, userId), isNotNull(userProgress.lastReviewed)))
      .orderBy(desc(userProgress.lastReviewed))
      .limit(5),
  ])

  // Streak: walk backwards from today; if today has no review, start from yesterday
  const daySet = new Set(activeDays.map((r) => r.day))
  const pad = (n: number) => String(n).padStart(2, '0')
  const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cursor = new Date(today)
  if (!daySet.has(toDateStr(cursor))) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (daySet.has(toDateStr(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const todayCorrect = todayRows.filter((r) => r.correct === true).length
  const todayTotal = todayRows.length
  const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : null

  res.json({
    streak,
    learnedCount: learnedRow[0]?.learned ?? 0,
    totalWords: totalRow[0]?.total ?? 0,
    todayAccuracy,
    todayCorrect,
    todayTotal,
    timeTodaySeconds: timeRow[0]?.totalSeconds ?? 0,
    decksTodayCount: decksTodayRow[0]?.deckCount ?? 0,
    lastReviewedAt: lastReviewedRow[0]?.lastReviewedAt ?? null,
    recentWords,
  })
})

// GET /api/progress/stats30 — 30-day KPI stats
router.get('/stats30', async (req, res) => {
  const { userId } = req.user!
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [reviewsRow, accuracyRow, learnedRow, sessionRow, activeDaysRows] = await Promise.all([
    // Total cards reviewed in the last 30 days
    db
      .select({ total: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), gte(userProgress.lastReviewed, thirtyDaysAgo))),

    // Accuracy: fraction of all review attempts in the last 30 days that were correct
    db
      .select({
        accuracy: sql<number>`ROUND(AVG(CASE WHEN ${reviewEvents.correct} THEN 100.0 ELSE 0.0 END), 1)`.mapWith(Number),
      })
      .from(reviewEvents)
      .where(and(
        eq(reviewEvents.userId, userId),
        gte(reviewEvents.reviewedAt, thirtyDaysAgo),
      )),

    // Words learned: first encountered AND gotten correct within the last 30 days
    db
      .select({ total: count() })
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        gt(userProgress.correct, 0),
        gte(userProgress.createdAt, thirtyDaysAgo),
      )),

    // Total session seconds in last 30 days
    db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(CASE WHEN ${studySessions.endedAt} > ${studySessions.startedAt} THEN EXTRACT(EPOCH FROM (${studySessions.endedAt} - ${studySessions.startedAt})) ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(studySessions)
      .where(and(
        eq(studySessions.userId, userId),
        isNotNull(studySessions.endedAt),
        gte(studySessions.startedAt, thirtyDaysAgo),
      )),

    // Distinct active days in last 30 days
    db
      .selectDistinct({ day: sql<string>`(${userProgress.lastReviewed})::date` })
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        isNotNull(userProgress.lastReviewed),
        gte(userProgress.lastReviewed, thirtyDaysAgo),
      )),
  ])

  const activeDays = activeDaysRows.length
  const avgSessionSeconds = activeDays > 0
    ? Math.round((sessionRow[0]?.totalSeconds ?? 0) / activeDays)
    : 0

  res.json({
    reviews: reviewsRow[0]?.total ?? 0,
    accuracy: accuracyRow[0]?.accuracy ?? null,
    wordsLearned: learnedRow[0]?.total ?? 0,
    avgSessionSeconds,
  })
})

// GET /api/progress/daily-mix — 20 random weak words (never seen or last reviewed wrong)
router.get('/daily-mix', async (req, res) => {
  const { userId } = req.user!

  const pool = await db
    .select(wordColumns)
    .from(words)
    .innerJoin(decks, eq(decks.id, words.deckId))
    .leftJoin(
      userProgress,
      and(eq(userProgress.wordId, words.id), eq(userProgress.userId, userId)),
    )
    .where(and(
      inArray(decks.level, allowedLevels(req.user!.hskLevel ?? 1)),
      or(
        isNull(userProgress.id),
        eq(userProgress.lastReviewCorrect, false),
      ),
    ))

  res.json({ words: shuffle(pool).slice(0, 20) })
})

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
        inArray(decks.level, allowedLevels(req.user!.hskLevel ?? 1)),
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
  const allowed = allowedLevels(req.user!.hskLevel ?? 1)
  const now = new Date()

  const [dueWords, newWords] = await Promise.all([
    // Words the user has seen and that are now due
    db
      .select(wordColumns)
      .from(userProgress)
      .innerJoin(words, eq(words.id, userProgress.wordId))
      .innerJoin(decks, eq(decks.id, words.deckId))
      .where(and(
        eq(userProgress.userId, userId),
        lte(userProgress.nextReview, now),
        inArray(decks.level, allowed),
      )),

    // Words the user has never seen (no progress row)
    db
      .select(wordColumns)
      .from(words)
      .innerJoin(decks, eq(decks.id, words.deckId))
      .leftJoin(
        userProgress,
        and(eq(userProgress.wordId, words.id), eq(userProgress.userId, userId)),
      )
      .where(and(isNull(userProgress.id), inArray(decks.level, allowed))),
  ])

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

  const [[updated]] = await Promise.all([
    db
      .update(userProgress)
      .set({
        repetitions: schedule.repetitions,
        easeFactor: schedule.easeFactor,
        intervalDays: schedule.intervalDays,
        correct: existing.correct + (correct ? 1 : 0),
        incorrect: existing.incorrect + (correct ? 0 : 1),
        lastReviewed: now,
        lastReviewCorrect: correct,
        nextReview: schedule.nextReview,
        updatedAt: now,
      })
      .where(eq(userProgress.id, existing.id))
      .returning(),

    db.insert(reviewEvents).values({ userId, wordId, correct }),
  ])

  // Level-up check — only on correct answers, only if a next level exists
  const currentLevel = req.user!.hskLevel ?? 1
  const nextLevel = currentLevel + 1

  if (!correct || nextLevel > 6) {
    res.json({ progress: updated })
    return
  }

  const currentLevelKey = `HSK${currentLevel}`

  const [[totalRow], [learnedRow]] = await Promise.all([
    db.select({ n: count() })
      .from(words)
      .innerJoin(decks, eq(decks.id, words.deckId))
      .where(eq(decks.level, currentLevelKey)),
    db.select({ n: count() })
      .from(userProgress)
      .innerJoin(words, eq(words.id, userProgress.wordId))
      .innerJoin(decks, eq(decks.id, words.deckId))
      .where(and(
        eq(userProgress.userId, userId),
        gt(userProgress.correct, 0),
        eq(decks.level, currentLevelKey),
      )),
  ])

  if ((learnedRow?.n ?? 0) < (totalRow?.n ?? 1)) {
    res.json({ progress: updated })
    return
  }

  // All words at current level learned — conditional UPDATE prevents double-fire
  const [upgradedUser] = await db
    .update(users)
    .set({ hskLevel: nextLevel })
    .where(and(eq(users.id, userId), eq(users.hskLevel, currentLevel)))
    .returning({ id: users.id, username: users.username, hskLevel: users.hskLevel })

  if (!upgradedUser) {
    // Already leveled up via a concurrent request or stale JWT
    res.json({ progress: updated })
    return
  }

  const newToken = signToken({ userId, username: req.user!.username, hskLevel: nextLevel })
  res.json({ progress: updated, levelUp: { newLevel: nextLevel, user: upgradedUser, token: newToken } })
})

// GET /api/progress/tone-accuracy — accuracy per tone for reviews in the last 30 days
router.get('/tone-accuracy', async (req, res) => {
  const { userId } = req.user!
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString()

  const rows = await db.execute<{ tone: number; accuracy: number }>(sql`
    SELECT
      t.tone::int AS tone,
      ROUND(AVG(CASE WHEN re.correct THEN 100.0 ELSE 0.0 END), 1)::float AS accuracy
    FROM review_events re
    JOIN words w ON w.id = re.word_id
    CROSS JOIN UNNEST(w.tones) AS t(tone)
    WHERE re.user_id = ${userId}
      AND re.reviewed_at >= ${thirtyDaysAgoISO}::timestamptz
      AND t.tone IN (1, 2, 3, 4, 5)
    GROUP BY t.tone
    ORDER BY t.tone
  `)

  const byTone: Record<number, number> = {}
  for (const r of rows) byTone[r.tone] = r.accuracy

  res.json({ byTone })
})

// GET /api/progress/top-struggles — 10 words with highest incorrect rate in last 30 days
router.get('/top-struggles', async (req, res) => {
  const { userId } = req.user!
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const rows = await db
    .select({
      simplified: words.simplified,
      traditional: words.traditional,
      pinyin: words.pinyin,
      tones: words.tones,
      meaning: words.meaning,
      deck: decks.name,
      incorrect: sql<number>`SUM(CASE WHEN NOT ${reviewEvents.correct} THEN 1 ELSE 0 END)`.mapWith(Number),
      total: count(),
    })
    .from(reviewEvents)
    .innerJoin(words, eq(words.id, reviewEvents.wordId))
    .innerJoin(decks, eq(decks.id, words.deckId))
    .where(and(
      eq(reviewEvents.userId, userId),
      gte(reviewEvents.reviewedAt, thirtyDaysAgo),
    ))
    .groupBy(words.id, decks.id)
    .having(sql`SUM(CASE WHEN NOT ${reviewEvents.correct} THEN 1 ELSE 0 END) > 0`)
    .orderBy(sql`SUM(CASE WHEN NOT ${reviewEvents.correct} THEN 1 ELSE 0 END)::float / COUNT(*) DESC`)
    .limit(10)

  const struggles = rows.map((r) => ({
    ...r,
    lapseRate: r.incorrect / r.total,
  }))

  res.json({ struggles })
})

// GET /api/progress/accuracy-trend — daily accuracy % for the last 30 active days
router.get('/accuracy-trend', async (req, res) => {
  const { userId } = req.user!
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const rows = await db
    .select({
      day: sql<string>`(${reviewEvents.reviewedAt})::date`,
      correct: sql<number>`SUM(CASE WHEN ${reviewEvents.correct} THEN 1 ELSE 0 END)`.mapWith(Number),
      total: count(),
    })
    .from(reviewEvents)
    .where(and(
      eq(reviewEvents.userId, userId),
      gte(reviewEvents.reviewedAt, thirtyDaysAgo),
    ))
    .groupBy(sql`(${reviewEvents.reviewedAt})::date`)
    .orderBy(sql`(${reviewEvents.reviewedAt})::date`)

  const points = rows.map((r) => Math.round((r.correct / r.total) * 100))
  res.json({ points })
})

export default router
